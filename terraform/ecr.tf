# =============================================================================
# ECR Repository — portfolio
# =============================================================================
# Repository was created manually in 2021 and imported into Terraform with:
#   terraform import aws_ecr_repository.portfolio portfolio
# =============================================================================

resource "aws_ecr_repository" "portfolio" {
  name                 = var.ecr_repository_name
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_ecr_lifecycle_policy" "portfolio" {
  repository = aws_ecr_repository.portfolio.name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Remove images that have been replaced by latest."
      selection = {
        tagStatus   = "untagged"
        countType   = "imageCountMoreThan"
        countNumber = 1
      }
      action = {
        type = "expire"
      }
    }]
  })
}
