terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
  }

  backend "s3" {
    bucket         = "killfood-terraform-state"
    key            = "portfolio/prod.tfstate"
    region         = "us-west-2"
    dynamodb_table = "killfood-terraform-locks"
    encrypt        = true
  }
}

locals {
  tags = {
    Project     = "portfolio"
    ManagedBy   = "terraform"
    Environment = "production"
    Purpose     = "portfolio-site"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = local.tags
  }
}

# CloudFront only accepts ACM certificates from us-east-1.
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = local.tags
  }
}

# Created in terraform/global.
data "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"
}

data "aws_route53_zone" "main" {
  name = "jakekillpack.com"
}

# Created in terraform/global; posts to Slack (#portfolio-logs).
data "aws_sns_topic" "alerts" {
  name = "portfolio-alerts"
}

module "site" {
  source = "../../modules/site"

  providers = {
    aws           = aws
    aws.us_east_1 = aws.us_east_1
  }

  environment    = "prod"
  aws_region     = var.aws_region
  aws_account_id = var.aws_account_id

  github_repository        = "shazaman23/portfolio"
  github_environment       = "production"
  github_oidc_provider_arn = data.aws_iam_openid_connect_provider.github.arn

  api_secret_parameters = ["mailgun/sending-key"]

  hostnames            = ["jakekillpack.com", "www.jakekillpack.com"]
  route53_zone_id      = data.aws_route53_zone.main.zone_id
  create_alias_records = true # turned on at cutover (Phase 6, 2026-10-09): this is what makes the site live
  noindex              = false

  contact_recipient = var.contact_recipient

  alarm_topic_arn = data.aws_sns_topic.alerts.arn
}
