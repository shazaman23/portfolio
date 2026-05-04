# =============================================================================
# CloudWatch Log Group — portfolio container
# =============================================================================
# This log group is used by the portfolio-app container running on the shared
# ECS service in killfood. The log group name uses the /ecs/killfood/ prefix
# because the cluster is named killfood-test and historical naming is kept
# for log continuity.
#
# Previously managed in killfood-web/terraform/cloudwatch.tf — moved here as
# part of the modernization (portfolio owns its own logs).
# =============================================================================

resource "aws_cloudwatch_log_group" "portfolio" {
  name              = "/ecs/killfood/portfolio"
  retention_in_days = 30
}
