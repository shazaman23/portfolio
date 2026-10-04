# ---- Environment ----
variable "environment" {
  description = "Environment slug, used as the suffix on every environment-scoped name"
  type        = string

  validation {
    condition     = contains(["qa", "prod"], var.environment)
    error_message = "Use qa or prod."
  }
}

# ---- Account ----
variable "aws_region" {
  description = "AWS region for the environment's regional resources"
  type        = string
}

variable "aws_account_id" {
  description = "AWS account ID"
  type        = string
}

# ---- CI/CD ----
variable "github_repository" {
  description = "GitHub repository whose workflows may deploy, in owner/repo format"
  type        = string
}

variable "github_environment" {
  description = "GitHub Environment the deploy job runs in; its branch rule decides which branches can deploy"
  type        = string
}

variable "github_oidc_provider_arn" {
  description = "ARN of the account's GitHub Actions OIDC provider (created in terraform/global)"
  type        = string
}

# ---- Secrets (SSM Parameter Store) ----
variable "api_secret_parameters" {
  description = "Secrets the API Lambda may read, as <service>/<name> under /portfolio/<environment>. Each is a SecureString created outside Terraform."
  type        = list(string)

  validation {
    condition     = alltrue([for name in var.api_secret_parameters : can(regex("^[a-z0-9-]+/[a-z0-9-]+$", name))])
    error_message = "Use <service>/<name>, e.g. mailgun/api-key."
  }
}
