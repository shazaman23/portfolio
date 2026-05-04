# =============================================================================
# CodePipeline — ECR → ECS Deploy Pipeline (portfolio)
# =============================================================================
# Mirrors killfood's deploy pipeline: ECR push of portfolio:latest triggers a
# new task-definition revision (only the portfolio-app container is updated)
# on the shared killfood-test cluster.
#
# Pipeline was created manually in 2021 (V1) and is imported into Terraform
# while being modernized:
#   - V1 → V2
#   - artifact store: auto-created codepipeline-* bucket → shared killfood-deploy
#   - service role: shared killfood role → dedicated codepipeline-portfolio role
#   - execution_mode: SUPERSEDED (already set on the existing pipeline)
#
# Source.Bitbucket DetectChanges = false is intentional: deploys are triggered
# only by ECR pushes, not by code commits (CircleCI handles the image build).
# =============================================================================

resource "aws_codepipeline" "portfolio" {
  name           = var.codepipeline_name
  role_arn       = aws_iam_role.codepipeline.arn
  pipeline_type  = "V2"
  execution_mode = "SUPERSEDED"

  artifact_store {
    location = var.s3_deploy_bucket
    type     = "S3"
  }

  stage {
    name = "Source"

    action {
      name             = "Image"
      category         = "Source"
      owner            = "AWS"
      provider         = "ECR"
      version          = "1"
      run_order        = 1
      output_artifacts = ["ImageArtifact"]
      namespace        = "ImageVariables"

      configuration = {
        RepositoryName = aws_ecr_repository.portfolio.name
        ImageTag       = "latest"
      }
    }

    action {
      name             = "Source"
      category         = "Source"
      owner            = "AWS"
      provider         = "CodeStarSourceConnection"
      version          = "1"
      run_order        = 1
      output_artifacts = ["SourceArtifact"]
      namespace        = "SourceVariables"

      configuration = {
        ConnectionArn        = var.codestar_connection_arn
        FullRepositoryId     = var.source_repository
        BranchName           = var.source_branch
        DetectChanges        = "false"
        OutputArtifactFormat = "CODE_ZIP"
      }
    }
  }

  stage {
    name = "Deploy"

    action {
      name            = "Deploy"
      category        = "Deploy"
      owner           = "AWS"
      provider        = "ECS"
      version         = "1"
      run_order       = 1
      input_artifacts = ["SourceArtifact"]
      namespace       = "DeployVariables"

      configuration = {
        ClusterName = var.ecs_cluster_name
        ServiceName = var.ecs_service_name
        FileName    = "deploy/imagedefinitions.json"
      }
    }
  }
}
