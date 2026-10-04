# =============================================================================
# IAM Roles and Policies
# =============================================================================
# Three roles, one per actor, none with long-lived access keys:
#   - portfolio-api-lambda        the NestJS API at runtime
#   - portfolio-github-deploy     GitHub Actions on the deploy branch (OIDC)
#   - portfolio-assets-publisher  assumed from the admin CLI profile to upload
#                                 images via the `portfolio-assets` profile
#
# The resources these roles act on (buckets, table, function, distribution)
# are created in later phases of docs/action-plans/serverless-rebuild.md.
# Until then their ARNs are built from the names in variables.tf; when each
# resource lands in Terraform, swap the local for the resource attribute.
#
# Inspection uses the existing account-wide `killfood-readonly` role
# (`killfood-ro` CLI profile), so no portfolio read-only role is defined.
# =============================================================================

locals {
  site_bucket_arn       = "arn:aws:s3:::${var.s3_site_bucket}"
  assets_bucket_arn     = "arn:aws:s3:::${var.s3_assets_bucket}"
  api_function_arn      = "arn:aws:lambda:${var.aws_region}:${var.aws_account_id}:function:${var.api_function_name}"
  api_log_group_arn     = "arn:aws:logs:${var.aws_region}:${var.aws_account_id}:log-group:/aws/lambda/${var.api_function_name}"
  experiences_table_arn = "arn:aws:dynamodb:${var.aws_region}:${var.aws_account_id}:table/${var.experiences_table_name}"

  # The parameter name starts with "/", so it follows "parameter" directly.
  mailgun_api_key_parameter_arn = "arn:aws:ssm:${var.aws_region}:${var.aws_account_id}:parameter${var.mailgun_api_key_parameter}"

  # No distribution exists yet, so its ID is unknown. The account has no
  # other CloudFront distributions; replace with the distribution's ARN in
  # the phase that creates it.
  cloudfront_distributions_arn = "arn:aws:cloudfront::${var.aws_account_id}:distribution/*"
}

# -----------------------------------------------------------------------------
# API Lambda Execution Role
# Runtime permissions for the NestJS API: write its own logs, read work
# experiences, and read the Mailgun API key used to send contact-form email.
# -----------------------------------------------------------------------------

resource "aws_iam_role" "api_lambda" {
  name        = "portfolio-api-lambda"
  description = "Runtime role for the portfolio NestJS API Lambda."

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "api_lambda" {
  name = "portfolio-api-runtime"
  role = aws_iam_role.api_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        # The log group is created by Terraform, so CreateLogGroup is not granted.
        Sid    = "WriteLambdaLogs"
        Effect = "Allow"
        Action = [
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = ["${local.api_log_group_arn}:*"]
      },
      {
        Sid    = "ReadExperiences"
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = [local.experiences_table_arn]
      },
      {
        # SecureString encrypted with the AWS-managed aws/ssm key, whose key
        # policy already lets principals in this account decrypt through SSM,
        # so no kms:Decrypt grant is needed. A customer-managed key would need one.
        Sid      = "ReadMailgunApiKey"
        Effect   = "Allow"
        Action   = ["ssm:GetParameter"]
        Resource = [local.mailgun_api_key_parameter_arn]
      }
    ]
  })
}

# -----------------------------------------------------------------------------
# GitHub Actions OIDC Provider
# Lets workflows exchange a short-lived GitHub token for AWS credentials,
# replacing static access keys (killfood's circleci-deploy user pattern).
# -----------------------------------------------------------------------------

resource "aws_iam_openid_connect_provider" "github" {
  url            = "https://token.actions.githubusercontent.com"
  client_id_list = ["sts.amazonaws.com"]
}

# -----------------------------------------------------------------------------
# GitHub Deploy Role
# Assumable only by workflows running on the deploy branch of this repo.
# Publishes the React build, ships new API code, upserts experience content
# from the repo, and invalidates the CDN cache.
# -----------------------------------------------------------------------------

resource "aws_iam_role" "github_deploy" {
  name        = "portfolio-github-deploy"
  description = "Assumed by GitHub Actions on the portfolio deploy branch."

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Federated = aws_iam_openid_connect_provider.github.arn }
      Action    = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          "token.actions.githubusercontent.com:sub" = "repo:${var.github_repository}:ref:refs/heads/${var.deploy_branch}"
        }
      }
    }]
  })
}

resource "aws_iam_role_policy" "github_deploy" {
  name = "portfolio-deploy"
  role = aws_iam_role.github_deploy.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "SiteBucketObjects"
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = ["${local.site_bucket_arn}/*"]
      },
      {
        Sid      = "SiteBucketList"
        Effect   = "Allow"
        Action   = ["s3:ListBucket"]
        Resource = [local.site_bucket_arn]
      },
      {
        Sid    = "UpdateApiCode"
        Effect = "Allow"
        Action = [
          "lambda:UpdateFunctionCode",
          "lambda:GetFunction",
          "lambda:GetFunctionConfiguration"
        ]
        Resource = [local.api_function_arn]
      },
      {
        Sid    = "UpsertExperiences"
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:BatchWriteItem"
        ]
        Resource = [local.experiences_table_arn]
      },
      {
        Sid    = "InvalidateCdn"
        Effect = "Allow"
        Action = [
          "cloudfront:CreateInvalidation",
          "cloudfront:GetInvalidation"
        ]
        Resource = [local.cloudfront_distributions_arn]
      }
    ]
  })
}

# -----------------------------------------------------------------------------
# Assets Publisher Role
# Assumed from the admin CLI profile through the `portfolio-assets` profile,
# so routine image uploads never run with admin rights. It has no access
# keys of its own. Same trust pattern as killfood-readonly: trusting the
# account root still requires the caller to hold sts:AssumeRole; today only
# the admin user does.
# -----------------------------------------------------------------------------

resource "aws_iam_role" "assets_publisher" {
  name        = "portfolio-assets-publisher"
  description = "Uploads portfolio images to the assets bucket, assumed from the admin CLI profile."

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { AWS = "arn:aws:iam::${var.aws_account_id}:root" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "assets_publisher" {
  name = "portfolio-assets-publish"
  role = aws_iam_role.assets_publisher.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AssetsBucketObjects"
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject"
        ]
        Resource = ["${local.assets_bucket_arn}/*"]
      },
      {
        Sid    = "AssetsBucketList"
        Effect = "Allow"
        Action = [
          "s3:ListBucket",
          "s3:GetBucketLocation"
        ]
        Resource = [local.assets_bucket_arn]
      },
      {
        Sid    = "InvalidateAssets"
        Effect = "Allow"
        Action = [
          "cloudfront:CreateInvalidation",
          "cloudfront:GetInvalidation"
        ]
        Resource = [local.cloudfront_distributions_arn]
      }
    ]
  })
}
