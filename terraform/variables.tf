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
    Environment = "production"
    Purpose     = "portfolio-site"
  }
}

# ---- Domain ----
variable "domain_name" {
  description = "Apex domain the site is served from"
  type        = string
  default     = "jakekillpack.com"
}

# ---- S3 ----
variable "s3_site_bucket" {
  description = "S3 bucket for the built React app (written by CI)"
  type        = string
  default     = "jakekillpack-site"
}

variable "s3_assets_bucket" {
  description = "S3 bucket for images and other media (written by the assets publisher role)"
  type        = string
  default     = "jakekillpack-assets"
}

# ---- API ----
variable "api_function_name" {
  description = "Name of the NestJS API Lambda function"
  type        = string
  default     = "portfolio-api"
}

variable "experiences_table_name" {
  description = "Name of the DynamoDB table holding work experiences"
  type        = string
  default     = "portfolio-experiences"
}

# ---- Contact Email (Mailgun) ----
variable "contact_from_address" {
  description = "From address for contact-form email; must be on the Mailgun sending domain"
  type        = string
  default     = "portfolio@jakekillpack.com"
}

variable "contact_recipient" {
  description = "Address that receives contact-form email"
  type        = string
}

variable "mailgun_api_key_parameter" {
  description = "SSM Parameter Store name of the Mailgun API key (SecureString, created outside Terraform)"
  type        = string
  default     = "/portfolio/mailgun-api-key"
}

# ---- CI/CD ----
variable "github_repository" {
  description = "GitHub repository allowed to assume the deploy role, in owner/repo format"
  type        = string
  default     = "shazaman23/portfolio"
}

variable "deploy_branch" {
  description = "Branch whose workflows may assume the deploy role"
  type        = string
  default     = "master"
}
