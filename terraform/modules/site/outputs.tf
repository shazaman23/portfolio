output "api_lambda_role_arn" {
  description = "ARN of the API Lambda execution role"
  value       = aws_iam_role.api_lambda.arn
}

output "github_deploy_role_arn" {
  description = "ARN of the GitHub Actions deploy role (role-to-assume in the deploy workflow)"
  value       = aws_iam_role.github_deploy.arn
}

output "assets_publisher_role_arn" {
  description = "ARN of the assets publisher role (role_arn for the portfolio-assets-<env> CLI profile)"
  value       = aws_iam_role.assets_publisher.arn
}
