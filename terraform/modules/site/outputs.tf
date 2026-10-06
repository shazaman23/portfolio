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

output "site_bucket_name" {
  description = "Bucket the deploy workflow uploads the React build to"
  value       = aws_s3_bucket.site.bucket
}

output "assets_bucket_name" {
  description = "Bucket assets-tool syncs media with"
  value       = aws_s3_bucket.assets.bucket
}

output "distribution_id" {
  description = "CloudFront distribution ID (for invalidations)"
  value       = aws_cloudfront_distribution.site.id
}

output "distribution_domain_name" {
  description = "CloudFront domain name; serves the site before the alias records exist"
  value       = aws_cloudfront_distribution.site.domain_name
}

output "api_function_name" {
  description = "Lambda function the deploy updates"
  value       = aws_lambda_function.api.function_name
}

output "experiences_table_name" {
  description = "Table the deploy seeds from content/experiences.json"
  value       = aws_dynamodb_table.experiences.name
}

output "api_endpoint" {
  description = "HTTP API's own URL (CloudFront's /api/* origin)"
  value       = aws_apigatewayv2_api.api.api_endpoint
}
