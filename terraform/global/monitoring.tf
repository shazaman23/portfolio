# =============================================================================
# Alerts — CloudWatch alarms and the cost budget → SNS → Slack (#portfolio-logs)
# =============================================================================
# Same path killfood's backup alarms use to reach Slack. This is its own channel
# configuration, so killfood's Terraform stays untouched.
# =============================================================================

# -----------------------------------------------------------------------------
# SNS Topic
# Left unencrypted, like killfood's: an encrypted topic would need extra key
# permissions for both CloudWatch and Budgets.
# -----------------------------------------------------------------------------

resource "aws_sns_topic" "alerts" {
  name = "portfolio-alerts"
}

resource "aws_sns_topic_policy" "alerts" {
  arn = aws_sns_topic.alerts.arn

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowCloudWatchAlarms"
        Effect    = "Allow"
        Principal = { Service = "cloudwatch.amazonaws.com" }
        Action    = "sns:Publish"
        Resource  = aws_sns_topic.alerts.arn
        Condition = {
          StringEquals = { "aws:SourceAccount" = var.aws_account_id }
        }
      },
      {
        Sid       = "AllowBudgets"
        Effect    = "Allow"
        Principal = { Service = "budgets.amazonaws.com" }
        Action    = "sns:Publish"
        Resource  = aws_sns_topic.alerts.arn
        Condition = {
          StringEquals = { "aws:SourceAccount" = var.aws_account_id }
        }
      }
    ]
  })
}

# -----------------------------------------------------------------------------
# Slack Channel Configuration
# The KillFood Dev workspace is already authorized for the account.
# -----------------------------------------------------------------------------

resource "aws_chatbot_slack_channel_configuration" "alerts" {
  configuration_name    = "portfolio-alerts"
  iam_role_arn          = aws_iam_role.chatbot_alerts.arn
  slack_team_id         = var.slack_team_id
  slack_channel_id      = var.slack_channel_id
  sns_topic_arns        = [aws_sns_topic.alerts.arn]
  guardrail_policy_arns = [aws_iam_policy.chatbot_alerts_notifications_only.arn]
  logging_level         = "NONE"
}

# -----------------------------------------------------------------------------
# Cost Budget
# Everything tagged Project=portfolio, across environments. Needs the Project
# cost allocation tag to be active in Billing. Plain cost budgets are free.
# -----------------------------------------------------------------------------

resource "aws_budgets_budget" "portfolio" {
  name         = "portfolio-monthly"
  budget_type  = "COST"
  limit_amount = var.monthly_budget_usd
  limit_unit   = "USD"
  time_unit    = "MONTHLY"

  cost_filter {
    name   = "TagKeyValue"
    values = ["user:Project$portfolio"]
  }

  notification {
    comparison_operator       = "GREATER_THAN"
    threshold                 = 80
    threshold_type            = "PERCENTAGE"
    notification_type         = "ACTUAL"
    subscriber_sns_topic_arns = [aws_sns_topic.alerts.arn]
  }

  notification {
    comparison_operator       = "GREATER_THAN"
    threshold                 = 100
    threshold_type            = "PERCENTAGE"
    notification_type         = "FORECASTED"
    subscriber_sns_topic_arns = [aws_sns_topic.alerts.arn]
  }
}
