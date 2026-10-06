# =============================================================================
# DynamoDB Table (one per environment)
# =============================================================================
# Holds two kinds of items, told apart by their `kind` attribute:
#   - experience  ids "1"-"5", upserted from content/experiences.json on
#                 every deploy (api/src/seed.ts)
#   - counter     contact-sends#<UTC date>, the daily contact-send cap
#                 (api/src/contact/send-cap.ts); TTL deletes each after 2 days
#
# On-demand billing: at this size it's within the always-free tier. No
# point-in-time recovery: the content lives in git, and the counters are
# disposable.
# =============================================================================

resource "aws_dynamodb_table" "experiences" {
  name         = local.experiences_table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }

  # Blocks deletes from the console or CLI too, not just from Terraform.
  deletion_protection_enabled = true

  lifecycle {
    prevent_destroy = true
  }

  tags = {
    Purpose = "experiences-and-send-counters"
  }
}
