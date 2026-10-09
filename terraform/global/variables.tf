# ---- Provider ----
variable "aws_region" {
  description = "AWS region for all regional resources"
  type        = string
  default     = "us-west-2"
}

variable "aws_account_id" {
  description = "AWS account ID"
  type        = string
}

# ---- Tags ----
variable "common_tags" {
  description = "Common tags applied to all Terraform-managed resources"
  type        = map(string)
  default = {
    Project     = "portfolio"
    ManagedBy   = "terraform"
    Environment = "shared"
    Purpose     = "portfolio-site"
  }
}

# ---- Alerts (Slack) ----
variable "slack_team_id" {
  description = "Slack workspace ID for alert notifications (KillFood Dev)"
  type        = string
}

variable "slack_channel_id" {
  description = "Slack channel ID for alert notifications (#portfolio-logs)"
  type        = string
}

# ---- Budget ----
variable "monthly_budget_usd" {
  description = "Monthly cost budget for everything tagged Project=portfolio"
  type        = string
  default     = "5"
}
