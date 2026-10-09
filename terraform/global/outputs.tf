# =============================================================================
# Outputs
# =============================================================================

output "github_oidc_provider_arn" {
  description = "ARN of the GitHub Actions OIDC identity provider (looked up by each environment)"
  value       = aws_iam_openid_connect_provider.github.arn
}

output "alerts_topic_arn" {
  description = "ARN of the portfolio-alerts SNS topic (alarm actions publish here)"
  value       = aws_sns_topic.alerts.arn
}

output "slack_channel_configuration_arn" {
  description = "ARN of the Slack channel configuration that posts portfolio alerts"
  value       = aws_chatbot_slack_channel_configuration.alerts.chat_configuration_arn
}
