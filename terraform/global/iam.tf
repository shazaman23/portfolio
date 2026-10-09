# =============================================================================
# Account-level IAM shared by every portfolio environment
# =============================================================================

# -----------------------------------------------------------------------------
# GitHub Actions OIDC Provider
# Lets workflows exchange a short-lived GitHub token for AWS credentials,
# replacing static access keys (killfood's circleci-deploy user pattern).
# Each environment's deploy role trusts it (modules/site/iam.tf).
# -----------------------------------------------------------------------------

resource "aws_iam_openid_connect_provider" "github" {
  url            = "https://token.actions.githubusercontent.com"
  client_id_list = ["sts.amazonaws.com"]
}

# -----------------------------------------------------------------------------
# Slack Alerts Role
# Assumed by Amazon Q Developer in chat applications (formerly AWS Chatbot) to
# render alarm notifications. CloudWatch read-only, matching killfood's
# chatbot-role. The same policy is the channel guardrail (monitoring.tf), so
# nobody can run AWS commands from Slack through this configuration.
# -----------------------------------------------------------------------------

resource "aws_iam_role" "chatbot_alerts" {
  name        = "portfolio-chatbot-alerts"
  path        = "/service-role/"
  description = "Posts portfolio alerts to Slack."

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "chatbot.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_policy" "chatbot_alerts_notifications_only" {
  name        = "portfolio-chatbot-alerts-notifications-only"
  path        = "/service-role/"
  description = "CloudWatch read-only, for rendering portfolio alerts in Slack"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "cloudwatch:Describe*",
          "cloudwatch:Get*",
          "cloudwatch:List*"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "chatbot_alerts_notifications_only" {
  role       = aws_iam_role.chatbot_alerts.name
  policy_arn = aws_iam_policy.chatbot_alerts_notifications_only.arn
}
