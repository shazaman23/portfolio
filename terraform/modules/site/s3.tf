# =============================================================================
# S3 Buckets (one set per environment)
# =============================================================================
# Assets bucket: media that content references (About Me photos, experience
# screenshots), uploaded with assets-tool (~/bin) rather than kept in git. Keys
# start with assets/ because CloudFront forwards the full request path, so
# /assets/img/about/popcorn.webp reads the key assets/img/about/popcorn.webp.
#
# The site bucket (the React build) and the OAC-only bucket policies arrive
# with CloudFront in Phase 2. Until then nothing can read these objects except
# the assets publisher role and the admin user.
# =============================================================================

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
