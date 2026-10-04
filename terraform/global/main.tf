terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Shares killfood's state bucket and lock table under its own key. Not
  # portfolio/terraform.tfstate: that key holds an older portfolio state whose
  # code no longer exists (see docs/action-plans/serverless-rebuild.md).
  backend "s3" {
    bucket         = "killfood-terraform-state"
    key            = "portfolio/global.tfstate"
    region         = "us-west-2"
    dynamodb_table = "killfood-terraform-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = var.common_tags
  }
}
