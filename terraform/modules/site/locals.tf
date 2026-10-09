locals {
  # Every environment-scoped name ends in -<environment>, so each role can be
  # limited to its own environment's resources by name alone.
  site_bucket_name       = "jakekillpack-site-${var.environment}"
  assets_bucket_name     = "jakekillpack-assets-${var.environment}"
  api_function_name      = "portfolio-api-${var.environment}"
  experiences_table_name = "portfolio-experiences-${var.environment}"

  # Secrets live at <ssm_parameter_prefix>/<service>/<name>.
  ssm_parameter_prefix = "/portfolio/${var.environment}"
}
