# =============================================================================
# S3 Buckets (one set per environment)
# =============================================================================
# Site bucket: the React build, uploaded by the GitHub deploy role. Served by
# CloudFront's default behavior.
#
# Assets bucket: media that content references (About Me photos, experience
# screenshots), uploaded with assets-tool (~/bin) rather than kept in git. Keys
# start with assets/ because CloudFront forwards the full request path, so
# /assets/img/about/popcorn.webp reads the key assets/img/about/popcorn.webp.
#
# Both are private. Each bucket policy lets only this environment's
# distribution read, through origin access control (OAC).
# =============================================================================

# -----------------------------------------------------------------------------
# Site Bucket
# -----------------------------------------------------------------------------

resource "aws_s3_bucket" "site" {
  bucket = local.site_bucket_name

  lifecycle {
    prevent_destroy = true
  }

  tags = {
    Purpose = "site-build"
  }
}

resource "aws_s3_bucket_public_access_block" "site" {
  bucket = aws_s3_bucket.site.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ACLs off: the bucket owner owns every object, and access is policy-only.
resource "aws_s3_bucket_ownership_controls" "site" {
  bucket = aws_s3_bucket.site.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "site" {
  bucket = aws_s3_bucket.site.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Each deploy replaces the build; old versions are a short safety net. A real
# rollback is a redeploy of an earlier commit.
resource "aws_s3_bucket_versioning" "site" {
  bucket = aws_s3_bucket.site.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "site" {
  bucket = aws_s3_bucket.site.id

  # Versioning must be on before noncurrent-version rules apply.
  depends_on = [aws_s3_bucket_versioning.site]

  rule {
    id     = "expire-old-versions"
    status = "Enabled"

    # Apply to all objects in the bucket
    filter {}

    noncurrent_version_expiration {
      noncurrent_days = 30
    }

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}

resource "aws_s3_bucket_policy" "site" {
  bucket = aws_s3_bucket.site.id
  policy = data.aws_iam_policy_document.cloudfront_read["site"].json

  # Changing both at once can fail with OperationAborted, so apply in order.
  depends_on = [aws_s3_bucket_public_access_block.site]
}

# -----------------------------------------------------------------------------
# Assets Bucket
# -----------------------------------------------------------------------------

resource "aws_s3_bucket" "assets" {
  bucket = local.assets_bucket_name

  lifecycle {
    prevent_destroy = true
  }

  tags = {
    Purpose = "site-media"
  }
}

resource "aws_s3_bucket_public_access_block" "assets" {
  bucket = aws_s3_bucket.assets.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ACLs off: the bucket owner owns every object, and access is policy-only.
resource "aws_s3_bucket_ownership_controls" "assets" {
  bucket = aws_s3_bucket.assets.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "assets" {
  bucket = aws_s3_bucket.assets.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# An overwrite or delete keeps the old copy as a noncurrent version, so a bad
# upload can be undone. The publisher role can't delete versions, only objects.
resource "aws_s3_bucket_versioning" "assets" {
  bucket = aws_s3_bucket.assets.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "assets" {
  bucket = aws_s3_bucket.assets.id

  # Versioning must be on before noncurrent-version rules apply.
  depends_on = [aws_s3_bucket_versioning.assets]

  rule {
    id     = "expire-old-versions"
    status = "Enabled"

    # Apply to all objects in the bucket
    filter {}

    # Undo window for an overwritten or deleted image
    noncurrent_version_expiration {
      noncurrent_days = 90
    }

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}

resource "aws_s3_bucket_policy" "assets" {
  bucket = aws_s3_bucket.assets.id
  policy = data.aws_iam_policy_document.cloudfront_read["assets"].json

  # Changing both at once can fail with OperationAborted, so apply in order.
  depends_on = [aws_s3_bucket_public_access_block.assets]
}

# -----------------------------------------------------------------------------
# Bucket Policies
# Only this environment's distribution can read, and only through OAC (the
# AWS:SourceArn condition). ListBucket lets S3 answer 404 for a missing key
# instead of 403; CloudFront never sends a request for the bucket root, so it
# can't produce a listing.
# -----------------------------------------------------------------------------

data "aws_iam_policy_document" "cloudfront_read" {
  for_each = {
    site   = aws_s3_bucket.site.arn
    assets = aws_s3_bucket.assets.arn
  }

  statement {
    sid       = "CloudFrontReadObjects"
    actions   = ["s3:GetObject"]
    resources = ["${each.value}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.site.arn]
    }
  }

  statement {
    sid       = "CloudFrontListForNotFound"
    actions   = ["s3:ListBucket"]
    resources = [each.value]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.site.arn]
    }
  }
}
