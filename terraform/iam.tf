# =============================================================================
# IAM Roles — portfolio-specific
# =============================================================================
# Portfolio uses its own dedicated IAM roles rather than reusing killfood's.
# The CodePipeline role is scoped to the minimum permissions needed for
# ECR source → ECS deploy on the shared cluster.
#
# Note: PassRole below references the existing killfood ECS task / execution
# roles by ARN string (constructed from the account ID). These roles are
# managed in killfood-web/terraform/iam.tf — portfolio's pipeline only needs
# permission to *pass* them when registering new task-definition revisions.
# =============================================================================

# -----------------------------------------------------------------------------
# CodePipeline Service Role — Portfolio Deploy Pipeline
# -----------------------------------------------------------------------------

resource "aws_iam_role" "codepipeline" {
  name = "AWSCodePipelineServiceRole-us-west-2-Portfolio-Deploy-Pipeline"
  path = "/service-role/"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "codepipeline.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_policy" "codepipeline" {
  name        = "AWSCodePipelineServiceRole-us-west-2-Portfolio-Deploy-Pipeline"
  path        = "/service-role/"
  description = "Policy used in trust relationship with the Portfolio CodePipeline"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "S3ArtifactAccess"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:GetObjectVersion",
          "s3:GetBucketVersioning",
          "s3:GetBucketLocation",
          "s3:PutObject"
        ]
        Resource = [
          "arn:aws:s3:::${var.s3_deploy_bucket}",
          "arn:aws:s3:::${var.s3_deploy_bucket}/*"
        ]
      },
      {
        Sid      = "ECRSourceAccess"
        Effect   = "Allow"
        Action   = ["ecr:DescribeImages"]
        Resource = [aws_ecr_repository.portfolio.arn]
      },
      {
        Sid      = "CodeStarConnection"
        Effect   = "Allow"
        Action   = ["codestar-connections:UseConnection"]
        Resource = [var.codestar_connection_arn]
      },
      {
        Sid    = "ECSTaskDefinitions"
        Effect = "Allow"
        Action = [
          "ecs:RegisterTaskDefinition",
          "ecs:DescribeTaskDefinition",
          "ecs:TagResource"
        ]
        Resource = "*"
      },
      {
        Sid    = "ECSServiceDeploy"
        Effect = "Allow"
        Action = [
          "ecs:DescribeServices",
          "ecs:UpdateService",
          "ecs:DescribeTasks",
          "ecs:ListTasks"
        ]
        Resource = "*"
      },
      {
        Sid    = "PassRoleToECS"
        Effect = "Allow"
        Action = ["iam:PassRole"]
        Resource = [
          "arn:aws:iam::${var.aws_account_id}:role/ecsTaskExecutionRole",
          "arn:aws:iam::${var.aws_account_id}:role/ecsTaskRole"
        ]
        Condition = {
          StringEquals = {
            "iam:PassedToService" = "ecs-tasks.amazonaws.com"
          }
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "codepipeline_policy" {
  role       = aws_iam_role.codepipeline.name
  policy_arn = aws_iam_policy.codepipeline.arn
}

# -----------------------------------------------------------------------------
# AWS Chatbot Role — Portfolio
# Used by AWS Chatbot to read CloudWatch metrics for notification context.
# Separate from killfood's chatbot-role so portfolio owns its own identity.
# -----------------------------------------------------------------------------

resource "aws_iam_role" "chatbot" {
  name        = "portfolio-chatbot-role"
  path        = "/service-role/"
  description = "AWS Chatbot Execution Role (portfolio)"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "chatbot.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_policy" "chatbot_notifications_only" {
  name        = "Portfolio-Chatbot-NotificationsOnly-Policy"
  path        = "/service-role/"
  description = "NotificationsOnly policy for Portfolio AWS Chatbot"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "cloudwatch:Describe*",
          "cloudwatch:Get*",
          "cloudwatch:List*"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "chatbot_notifications_only" {
  role       = aws_iam_role.chatbot.name
  policy_arn = aws_iam_policy.chatbot_notifications_only.arn
}
