# ---- Provider ----
variable "aws_region" {
  description = "AWS region for all resources"
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
    Project   = "portfolio"
    ManagedBy = "terraform"
  }
}

# ---- Shared platform references ----
# These resources are managed in killfood-web/terraform but referenced by name here.
# Update the defaults if killfood ever renames them.

variable "ecs_instance_ip" {
  description = "Public Elastic IP of the shared ECS EC2 instance (managed in killfood-web/terraform/eip.tf)"
  type        = string
}

variable "ecs_cluster_name" {
  description = "Name of the shared ECS cluster (managed in killfood-web)"
  type        = string
  default     = "killfood-test"
}

variable "ecs_service_name" {
  description = "Name of the shared ECS service (managed in killfood-web)"
  type        = string
  default     = "killfood-deployment"
}

variable "s3_deploy_bucket" {
  description = "Shared S3 deploy bucket used as CodePipeline artifact store (managed in killfood-web)"
  type        = string
  default     = "killfood-deploy"
}

# ---- ECR ----
variable "ecr_repository_name" {
  description = "Name of the portfolio ECR repository"
  type        = string
  default     = "portfolio"
}

# ---- CodePipeline ----
variable "codepipeline_name" {
  description = "Name of the portfolio deploy pipeline"
  type        = string
  default     = "Portfolio-Deploy-Pipeline"
}

variable "codestar_connection_arn" {
  description = "ARN of the CodeStar connection to Bitbucket (shared with killfood)"
  type        = string
}

variable "source_repository" {
  description = "Bitbucket repository in owner/repo format"
  type        = string
  default     = "shazaman23/portfolio"
}

variable "source_branch" {
  description = "Branch that triggers the deploy pipeline"
  type        = string
  default     = "master"
}

# ---- Notifications ----
variable "slack_team_id" {
  description = "Slack workspace ID for AWS Chatbot"
  type        = string
}

variable "slack_channel_id" {
  description = "Slack channel ID for portfolio deploy notifications"
  type        = string
}
