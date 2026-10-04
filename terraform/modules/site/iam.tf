# =============================================================================
# IAM Roles and Policies (one set per environment)
# =============================================================================
# Three roles, one per actor, none with long-lived access keys:
#   - portfolio-api-lambda-<env>        the NestJS API at runtime
#   - portfolio-github-deploy-<env>     GitHub Actions jobs in the matching
#                                       GitHub Environment (OIDC)
#   - portfolio-assets-publisher-<env>  assumed from the admin CLI profile to
#                                       upload images via `portfolio-assets-<env>`
#
# The resources these roles act on (buckets, table, function, distribution)
# are created in later phases of docs/action-plans/serverless-rebuild.md.
# Until then their ARNs are built from the names in locals.tf; when each
# resource lands in this module, swap the local for the resource attribute.
#
# Inspection uses the existing account-wide `killfood-readonly` role
# (`killfood-ro` CLI profile), so no portfolio read-only role is defined.
# =============================================================================

locals {
  site_bucket_arn       = "arn:aws:s3:::${local.site_bucket_name}"
  assets_bucket_arn     = "arn:aws:s3:::${local.assets_bucket_name}"
  api_function_arn      = "arn:aws:lambda:${var.aws_region}:${var.aws_account_id}:function:${local.api_function_name}"
  api_log_group_arn     = "arn:aws:logs:${var.aws_region}:${var.aws_account_id}:log-group:/aws/lambda/${local.api_function_name}"
  experiences_table_arn = "arn:aws:dynamodb:${var.aws_region}:${var.aws_account_id}:table/${local.experiences_table_name}"

  # One ARN per listed secret, never the whole prefix. Parameter names start
  # with "/", so the prefix follows "parameter" directly.
  api_secret_parameter_arns = [
    for name in var.api_secret_parameters :
    "arn:aws:ssm:${var.aws_region}:${var.aws_account_id}:parameter${local.ssm_parameter_prefix}/${name}"
  ]

  # No distribution exists yet, so its ID is unknown. The account has no
  # CloudFront distributions; replace with this environment's distribution
  # ARN in the phase that creates it.
  cloudfront_distributions_arn = "arn:aws:cloudfront::${var.aws_account_id}:distribution/*"
}

# -----------------------------------------------------------------------------
# API Lambda Execution Role
# Runtime permissions for the NestJS API: write its own logs, read work
# experiences, count contact-form sends, and read its secrets from
# Parameter Store at runtime.
# -----------------------------------------------------------------------------

resource "aws_iam_role" "api_lambda" {
  name        = "portfolio-api-lambda-${var.environment}"
  description = "Runtime role for the portfolio NestJS API Lambda (${var.environment})."

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
        # UpdateItem is for the daily contact-send counter.
        Sid    = "ExperiencesTable"
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:UpdateItem"
        ]
        Resource = [local.experiences_table_arn]
      },
      {
        # SecureString encrypted with the AWS-managed aws/ssm key, whose key
        # policy already lets principals in this account decrypt through SSM,
        # so no kms:Decrypt grant is needed. A customer-managed key would need one.
        Sid    = "ReadSecretParameters"
        Effect = "Allow"
        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters"
        ]
        Resource = local.api_secret_parameter_arns
      }
    ]
  })
}

# -----------------------------------------------------------------------------
# GitHub Deploy Role
# Assumable only by jobs running in this environment's GitHub Environment.
# That environment's branch rule (repo settings) decides which branches can
# deploy: production accepts master only, qa accepts any branch.
# Publishes the React build, ships new API code, upserts experience content
# from the repo, and invalidates the CDN cache.
# -----------------------------------------------------------------------------

resource "aws_iam_role" "github_deploy" {
  name        = "portfolio-github-deploy-${var.environment}"
  description = "Assumed by GitHub Actions in the ${var.github_environment} environment."

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Federated = var.github_oidc_provider_arn }
      Action    = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          "token.actions.githubusercontent.com:sub" = "repo:${var.github_repository}:environment:${var.github_environment}"
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
# Assumed from the admin CLI profile through the `portfolio-assets-<env>`
# profile, so routine image uploads never run with admin rights. It has no
# access keys of its own. Same trust pattern as killfood-readonly: trusting the
# account root still requires the caller to hold sts:AssumeRole; today only
# the admin user does.
# -----------------------------------------------------------------------------

resource "aws_iam_role" "assets_publisher" {
  name        = "portfolio-assets-publisher-${var.environment}"
  description = "Uploads portfolio images to the ${var.environment} assets bucket, assumed from the admin CLI profile."

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
