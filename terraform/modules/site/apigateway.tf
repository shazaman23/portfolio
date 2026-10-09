# =============================================================================
# HTTP API (API Gateway v2)
# =============================================================================
# CloudFront's /api/* behavior forwards here, and every route goes to the
# Lambda function. The throttles are part of the origin cost guards in the
# rebuild plan ("At the Origin"):
#   - every route         5 requests/second, burst 10
#   - POST /api/contact   1 request/second, burst 2
# Over the limit, API Gateway answers 429 without invoking Lambda.
# =============================================================================

resource "aws_apigatewayv2_api" "api" {
  name          = "portfolio-api-${var.environment}"
  description   = "Portfolio API (${var.environment}), behind CloudFront /api/*"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_integration" "lambda" {
  api_id                 = aws_apigatewayv2_api.api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.api.invoke_arn
  payload_format_version = "2.0"
}

# Everything not matched by a more specific route, which is all of /api/*.
resource "aws_apigatewayv2_route" "default" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

# Its own route only so it can have a tighter throttle.
resource "aws_apigatewayv2_route" "contact" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "POST /api/contact"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.api.id
  name        = "$default"
  auto_deploy = true

  default_route_settings {
    throttling_rate_limit  = 5
    throttling_burst_limit = 10
  }

  route_settings {
    route_key              = aws_apigatewayv2_route.contact.route_key
    throttling_rate_limit  = 1
    throttling_burst_limit = 2
  }
}

resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowInvokeFromHttpApi"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.api.execution_arn}/*"
}
