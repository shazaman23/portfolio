# =============================================================================
# Outputs
# =============================================================================

# ---- DNS ----
output "route53_zone_id" {
  description = "Route 53 hosted zone ID for jakekillpack.com"
  value       = aws_route53_zone.main.zone_id
}

output "route53_nameservers" {
  description = "Route 53 nameservers — set these on the registered domain to activate DNS"
  value       = aws_route53_zone.main.name_servers
}

# ---- ECR ----
output "ecr_repository_url" {
  description = "URL of the portfolio ECR repository (for docker push/pull)"
  value       = aws_ecr_repository.portfolio.repository_url
}

# ---- CodePipeline ----
output "codepipeline_name" {
  description = "Name of the portfolio deploy pipeline"
  value       = aws_codepipeline.portfolio.name
}

output "codepipeline_role_arn" {
  description = "ARN of the dedicated Portfolio CodePipeline service role"
  value       = aws_iam_role.codepipeline.arn
}

# ---- CloudWatch ----
output "log_group_portfolio" {
  description = "CloudWatch log group used by the portfolio-app container"
  value       = aws_cloudwatch_log_group.portfolio.name
}

# ---- Notifications ----
output "notification_rule_arn" {
  description = "ARN of the CodeStar notification rule for the portfolio pipeline"
  value       = aws_codestarnotifications_notification_rule.pipeline_status.arn
}

output "chatbot_config_arn" {
  description = "ARN of the portfolio-specific AWS Chatbot Slack channel config"
  value       = aws_chatbot_slack_channel_configuration.deploy_announce.chat_configuration_arn
}
