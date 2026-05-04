# =============================================================================
# Route 53 — DNS for jakekillpack.com
# =============================================================================
# Hosted zone was created via CLI on 2026-05-03 and imported into state with:
#   terraform import aws_route53_zone.main Z05239741F47L70Y5ONQR
# =============================================================================

resource "aws_route53_zone" "main" {
  name = "jakekillpack.com"
  tags = var.common_tags
}

# ---- A Records ----
# The apex A record points jakekillpack.com at the shared EC2 instance.
# Commented out until the portfolio container is re-added to the killfood task
# definition — otherwise the domain would resolve to the EC2 instance and nginx
# would serve the default vhost (probably killfood's site).
#
# resource "aws_route53_record" "apex" {
#   zone_id = aws_route53_zone.main.zone_id
#   name    = "jakekillpack.com"
#   type    = "A"
#   ttl     = 300
#   records = [var.ecs_instance_ip]
# }
#
# resource "aws_route53_record" "www" {
#   zone_id = aws_route53_zone.main.zone_id
#   name    = "www.jakekillpack.com"
#   type    = "CNAME"
#   ttl     = 300
#   records = ["jakekillpack.com"]
# }

# ---- Email (Mailgun) ----
# These records can be safely created now — they only affect inbound mail
# routing through Mailgun, independent of the website coming online.

resource "aws_route53_record" "mx" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "jakekillpack.com"
  type    = "MX"
  ttl     = 3600
  records = [
    "10 mxa.mailgun.org",
    "10 mxb.mailgun.org",
  ]
}

resource "aws_route53_record" "spf" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "jakekillpack.com"
  type    = "TXT"
  ttl     = 3600
  records = ["v=spf1 include:mailgun.org ~all"]
}

resource "aws_route53_record" "dkim" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "krs._domainkey.jakekillpack.com"
  type    = "TXT"
  ttl     = 3600
  records = ["k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDU6bGp6C0nw6ucr1w3P1bt+zYNUmAskkwgNmGuiopkYBHQ5+mG3n0A+2jP8+SN1kz7GEvmQ7j58gKe/GQ8k44bMFvInddi6YE0S02D4nxqA1Vf5UjU9mo6nWBSBhaXGvOBKJ5T1GQikCMbOhcos80IKmgDvXPIi8cJTTzu3kG4iQIDAQAB"]
}

resource "aws_route53_record" "email_cname" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "email.jakekillpack.com"
  type    = "CNAME"
  ttl     = 7200
  records = ["mailgun.org"]
}
