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

output "site_bucket_name" {
  description = "Bucket the deploy workflow uploads the React build to"
  value       = module.site.site_bucket_name
}

output "assets_bucket_name" {
  description = "Bucket assets-tool syncs media with"
  value       = module.site.assets_bucket_name
}

output "distribution_id" {
  description = "CloudFront distribution ID (for invalidations)"
  value       = module.site.distribution_id
}

output "distribution_domain_name" {
  description = "CloudFront domain name; serves the site before the alias records exist"
  value       = module.site.distribution_domain_name
}

output "api_function_name" {
  description = "Lambda function the deploy updates"
  value       = module.site.api_function_name
}

output "experiences_table_name" {
  description = "Table the deploy seeds from content/experiences.json"
  value       = module.site.experiences_table_name
}

output "api_endpoint" {
  description = "HTTP API's own URL (CloudFront's /api/* origin)"
  value       = module.site.api_endpoint
}
