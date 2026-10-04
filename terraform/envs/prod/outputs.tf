output "api_lambda_role_arn" {
  description = "ARN of the API Lambda execution role"
  value       = module.site.api_lambda_role_arn
}

output "github_deploy_role_arn" {
  description = "ARN of the GitHub Actions deploy role (role-to-assume in the deploy workflow)"
  value       = module.site.github_deploy_role_arn
}

output "assets_publisher_role_arn" {
  description = "ARN of the assets publisher role (role_arn for the portfolio-assets CLI profile)"
  value       = module.site.assets_publisher_role_arn
}
