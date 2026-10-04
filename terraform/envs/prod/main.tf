terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
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

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "portfolio"
      ManagedBy   = "terraform"
      Environment = "production"
      Purpose     = "portfolio-site"
    }
  }
}

# Created in terraform/global.
data "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"
}

module "site" {
  source = "../../modules/site"

  environment    = "prod"
  aws_region     = var.aws_region
  aws_account_id = var.aws_account_id

  github_repository        = "shazaman23/portfolio"
  github_environment       = "production"
  github_oidc_provider_arn = data.aws_iam_openid_connect_provider.github.arn

  api_secret_parameters = ["mailgun/api-key"]
}
