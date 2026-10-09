# =============================================================================
# CloudWatch Alarms (production only)
# =============================================================================
# The four alarms in the rebuild plan's "Alerts (Production)". Each publishes
# to the portfolio-alerts SNS topic from terraform/global, which posts to
# Slack (#portfolio-logs), on the way into ALARM and again on recovery.
# Without alarm_topic_arn (QA), none are created; the cost budget covers QA.
#
# Names start with portfolio-<env>- so they stand out in a shared channel.
# Missing data counts as fine: no traffic means no errors.
# =============================================================================

locals {
  alarms_enabled = var.alarm_topic_arn != null

  # HTTP API metrics are published per API and stage.
  api_metric_dimensions = {
    ApiId = aws_apigatewayv2_api.api.id
    Stage = aws_apigatewayv2_stage.default.name
  }

  alarms = {
    lambda-errors = {
      description = "The API's Lambda function is throwing errors."
      namespace   = "AWS/Lambda"
      metric_name = "Errors"
      dimensions  = { FunctionName = aws_lambda_function.api.function_name }
      period      = 300
      comparison  = "GreaterThanOrEqualToThreshold"
      threshold   = 1
    }
    api-5xx = {
      description = "Requests are failing at or behind API Gateway."
      namespace   = "AWS/ApiGateway"
      metric_name = "5xx"
      dimensions  = local.api_metric_dimensions
      period      = 300
      comparison  = "GreaterThanOrEqualToThreshold"
      threshold   = 1
    }
    # About 1M requests a month, the edge of Lambda's free tier.
    api-volume = {
      description = "Over 30,000 API requests in a day: on pace for about 1M a month."
      namespace   = "AWS/ApiGateway"
      metric_name = "Count"
      dimensions  = local.api_metric_dimensions
      period      = 86400
      comparison  = "GreaterThanThreshold"
      threshold   = 30000
    }
    # Mostly 429s from the throttles or the daily send cap.
    api-4xx-spike = {
      description = "Over 300 client errors in 5 minutes, mostly 429s: something is pushing on the limits."
      namespace   = "AWS/ApiGateway"
      metric_name = "4xx"
      dimensions  = local.api_metric_dimensions
      period      = 300
      comparison  = "GreaterThanThreshold"
      threshold   = 300
    }
  }
}

resource "aws_cloudwatch_metric_alarm" "api" {
  for_each = local.alarms_enabled ? local.alarms : {}

  alarm_name        = "portfolio-${var.environment}-${each.key}"
  alarm_description = "${each.value.description} See \"If an Alert Fires\" in docs/action-plans/serverless-rebuild.md."

  namespace   = each.value.namespace
  metric_name = each.value.metric_name
  dimensions  = each.value.dimensions
  statistic   = "Sum"
  period      = each.value.period

  evaluation_periods  = 1
  comparison_operator = each.value.comparison
  threshold           = each.value.threshold
  treat_missing_data  = "notBreaching"

  alarm_actions = [var.alarm_topic_arn]
  ok_actions    = [var.alarm_topic_arn]
}
