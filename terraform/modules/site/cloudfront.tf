# =============================================================================
# CloudFront Distribution
# =============================================================================
# One distribution per environment:
#   default     -> site bucket (the React build), via the viewer-request
#                  function (www redirect, client-side routes, QA robots.txt)
#   /assets/*   -> assets bucket (media)
#   /api/*      -> the HTTP API, added in Phase 3
#
# Everything here stays inside what the flat-rate Free plan allows, so
# production can subscribe (and QA, if AWS accepts a second plan): AWS-managed
# cache and response-header policies only (custom ones need Business), at most
# 5 behaviors, no legacy forwarded-values settings, and functions that belong
# to this distribution alone. The plan attaches its own WAF web ACL, which
# Terraform leaves alone (ignore_changes below).
# =============================================================================

# -----------------------------------------------------------------------------
# AWS-Managed Policies
# -----------------------------------------------------------------------------

# Caches by path only (no query strings, headers, or cookies); honors the
# origin's Cache-Control between 1 second and 1 year, 1 day by default.
# Compresses with gzip and Brotli.
data "aws_cloudfront_cache_policy" "caching_optimized" {
  name = "Managed-CachingOptimized"
}

# HSTS (1 year, without includeSubDomains, so Mailgun's email. tracking host
# isn't forced onto HTTPS), nosniff, X-Frame-Options SAMEORIGIN, and
# Referrer-Policy strict-origin-when-cross-origin.
data "aws_cloudfront_response_headers_policy" "security_headers" {
  name = "Managed-SecurityHeadersPolicy"
}

# -----------------------------------------------------------------------------
# Origin Access Control
# CloudFront signs its requests to both buckets; each bucket policy only
# accepts requests signed for this distribution (see s3.tf).
# -----------------------------------------------------------------------------

resource "aws_cloudfront_origin_access_control" "s3" {
  name                              = "portfolio-s3-${var.environment}"
  description                       = "Portfolio ${var.environment}: CloudFront reads the site and assets buckets"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# -----------------------------------------------------------------------------
# CloudFront Functions (see functions/, tested by functions.test.mjs)
# -----------------------------------------------------------------------------

resource "aws_cloudfront_function" "viewer_request" {
  name    = "portfolio-viewer-request-${var.environment}"
  comment = "www redirect, client-side routes, and robots.txt when noindex"
  runtime = "cloudfront-js-2.0"
  publish = true
  code    = templatefile("${path.module}/functions/viewer-request.js", { noindex = var.noindex })
}

resource "aws_cloudfront_function" "noindex" {
  count = var.noindex ? 1 : 0

  name    = "portfolio-noindex-${var.environment}"
  comment = "Adds X-Robots-Tag: noindex, nofollow to every response"
  runtime = "cloudfront-js-2.0"
  publish = true
  code    = file("${path.module}/functions/noindex.js")
}

# -----------------------------------------------------------------------------
# Distribution
# -----------------------------------------------------------------------------

resource "aws_cloudfront_distribution" "site" {
  enabled             = true
  comment             = "Portfolio site (${var.environment})"
  aliases             = var.hostnames
  default_root_object = "index.html"
  is_ipv6_enabled     = true
  http_version        = "http2and3"
  price_class         = "PriceClass_All"

  origin {
    origin_id                = "site"
    domain_name              = aws_s3_bucket.site.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.s3.id
  }

  origin {
    origin_id                = "assets"
    domain_name              = aws_s3_bucket.assets.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.s3.id
  }

  default_cache_behavior {
    target_origin_id           = "site"
    viewer_protocol_policy     = "redirect-to-https"
    allowed_methods            = ["GET", "HEAD"]
    cached_methods             = ["GET", "HEAD"]
    compress                   = true
    cache_policy_id            = data.aws_cloudfront_cache_policy.caching_optimized.id
    response_headers_policy_id = data.aws_cloudfront_response_headers_policy.security_headers.id

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.viewer_request.arn
    }

    dynamic "function_association" {
      for_each = aws_cloudfront_function.noindex
      content {
        event_type   = "viewer-response"
        function_arn = function_association.value.arn
      }
    }
  }

  ordered_cache_behavior {
    path_pattern               = "/assets/*"
    target_origin_id           = "assets"
    viewer_protocol_policy     = "redirect-to-https"
    allowed_methods            = ["GET", "HEAD"]
    cached_methods             = ["GET", "HEAD"]
    compress                   = true
    cache_policy_id            = data.aws_cloudfront_cache_policy.caching_optimized.id
    response_headers_policy_id = data.aws_cloudfront_response_headers_policy.security_headers.id

    dynamic "function_association" {
      for_each = aws_cloudfront_function.noindex
      content {
        event_type   = "viewer-response"
        function_arn = function_association.value.arn
      }
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.site.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  lifecycle {
    # The flat-rate plan attaches and owns its WAF web ACL.
    ignore_changes = [web_acl_id]
  }
}
