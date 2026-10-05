# =============================================================================
# TLS Certificate (ACM, us-east-1)
# =============================================================================
# One certificate per environment covering its hostnames, validated through
# DNS records in the global zone (see dns.tf). ACM renews it automatically as
# long as those validation records stay in place. Public certificates are free.
# =============================================================================

resource "aws_acm_certificate" "site" {
  provider = aws.us_east_1

  domain_name               = var.hostnames[0]
  subject_alternative_names = slice(var.hostnames, 1, length(var.hostnames))
  validation_method         = "DNS"

  # A replacement certificate must exist before the distribution lets go of
  # the old one.
  lifecycle {
    create_before_destroy = true
  }
}

# Waits until ACM has issued the certificate, so the distribution never
# references one that's still pending.
resource "aws_acm_certificate_validation" "site" {
  provider = aws.us_east_1

  certificate_arn         = aws_acm_certificate.site.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}
