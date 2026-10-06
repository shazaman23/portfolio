terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
      # CloudFront certificates must live in us-east-1.
      configuration_aliases = [aws.us_east_1]
    }
    # Builds the Lambda's placeholder zip (lambda.tf).
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
  }
}
