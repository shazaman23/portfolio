# =============================================================================
# Route 53 — DNS for jakekillpack.com
# =============================================================================
# The zone and its Mailgun records existed before this Terraform (they came
# from an older portfolio state, archived 2026-10-04 at
# portfolio/archive/terraform-2026-05-03.tfstate) and were imported here.
# The Mailgun records carry contact@jakekillpack.com mail; keep them exactly
# as they are. Each environment adds its own records in modules/site.
# =============================================================================

import {
  to = aws_route53_zone.main
  id = "Z05239741F47L70Y5ONQR"
}

import {
  to = aws_route53_record.mx
  id = "Z05239741F47L70Y5ONQR_jakekillpack.com_MX"
}

import {
  to = aws_route53_record.spf
  id = "Z05239741F47L70Y5ONQR_jakekillpack.com_TXT"
}

import {
  to = aws_route53_record.dkim
  id = "Z05239741F47L70Y5ONQR_krs._domainkey.jakekillpack.com_TXT"
}

import {
  to = aws_route53_record.email_cname
  id = "Z05239741F47L70Y5ONQR_email.jakekillpack.com_CNAME"
}

resource "aws_route53_zone" "main" {
  name    = "jakekillpack.com"
  comment = "Managed by Terraform"

  lifecycle {
    prevent_destroy = true
  }
}

# ---- Email (Mailgun) ----

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
