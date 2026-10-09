# =============================================================================
# DNS Records (in the global jakekillpack.com zone)
# =============================================================================
# The zone and its Mailgun records belong to terraform/global. Each
# environment adds only its own records here, so separate state keeps QA and
# production from touching each other's names.
# =============================================================================

# -----------------------------------------------------------------------------
# Certificate Validation
# Always present, including in production before cutover: ACM needs them to
# issue the certificate and later to renew it.
# -----------------------------------------------------------------------------

resource "aws_route53_record" "cert_validation" {
  for_each = {
    for option in aws_acm_certificate.site.domain_validation_options : option.domain_name => {
      name   = option.resource_record_name
      type   = option.resource_record_type
      record = option.resource_record_value
    }
  }

  zone_id = var.route53_zone_id
  name    = each.value.name
  type    = each.value.type
  ttl     = 300
  records = [each.value.record]
}

# -----------------------------------------------------------------------------
# Site Aliases
# A and AAAA alias records pointing each hostname at the distribution. Behind
# create_alias_records: production keeps them off until cutover.
# -----------------------------------------------------------------------------

resource "aws_route53_record" "alias" {
  for_each = {
    for pair in setproduct(var.hostnames, ["A", "AAAA"]) :
    "${pair[0]} ${pair[1]}" => { name = pair[0], type = pair[1] }
    if var.create_alias_records
  }

  zone_id = var.route53_zone_id
  name    = each.value.name
  type    = each.value.type

  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
    evaluate_target_health = false
  }
}
