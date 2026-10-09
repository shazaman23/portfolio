# =============================================================================
# API Lambda Function
# =============================================================================
# The NestJS API (api/), bundled by `npm run bundle` into one ESM file with
# handler index.handler. Terraform creates the function with a placeholder
# that answers 503; deploys own the code from then on (ignore_changes below),
# the way killfood's ECS service leaves task_definition to CodePipeline.
#
# Settings come from environment variables (api/src/config.ts). Secrets
# don't: MAILGUN_SENDING_KEY_PARAMETER is only the parameter's name, and the
# API reads the key from Parameter Store at runtime.
# =============================================================================

locals {
  # Every API setting in one place. The list of secrets the function may read
  # is api_secret_parameters (iam.tf); this is where the code learns the name.
  # An empty value is left out rather than set to "", which Lambda would drop
  # and Terraform would then try to add back on every plan.
  api_environment = merge(
    {
      NODE_OPTIONS                  = "--enable-source-maps"
      APP_ENV                       = var.environment
      TABLE_NAME                    = aws_dynamodb_table.experiences.name
      DAILY_SEND_CAP                = tostring(var.daily_send_cap)
      MAIL_TRANSPORT                = "mailgun"
      MAIL_FROM                     = "Jake's Portfolio <portfolio@jakekillpack.com>"
      MAIL_TO                       = var.contact_recipient
      MAILGUN_DOMAIN                = "jakekillpack.com"
      MAILGUN_SENDING_KEY_PARAMETER = "${local.ssm_parameter_prefix}/mailgun/sending-key"
      # Nest's logger otherwise adds terminal color codes, which CloudWatch
      # shows as raw escape sequences.
      NO_COLOR = "1"
    },
    var.mail_subject_prefix == "" ? {} : { MAIL_SUBJECT_PREFIX = var.mail_subject_prefix },
  )
}

resource "aws_cloudwatch_log_group" "api" {
  name              = "/aws/lambda/${local.api_function_name}"
  retention_in_days = 30
}

# Stands in until the first deploy, so a fresh environment answers clearly
# instead of failing.
data "archive_file" "api_placeholder" {
  type        = "zip"
  output_path = "${path.root}/.terraform/api-placeholder.zip" # gitignored

  source {
    filename = "index.mjs"
    content  = <<-EOT
      export const handler = async () => ({
        statusCode: 503,
        headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
        body: JSON.stringify({ message: 'The API has not been deployed yet.' }),
      });
    EOT
  }
}

resource "aws_lambda_function" "api" {
  function_name = local.api_function_name
  description   = "Portfolio NestJS API (${var.environment})"
  role          = aws_iam_role.api_lambda.arn

  runtime       = "nodejs24.x"
  architectures = ["arm64"]
  handler       = "index.handler"
  memory_size   = 512
  timeout       = 10

  # Caps concurrent executions, so a flood can't take over the account's
  # shared pool (killfood's Lambda draws from it too). Setting it to 0 is the
  # kill switch; see "If an Alert Fires" in the rebuild plan.
  reserved_concurrent_executions = 5

  filename         = data.archive_file.api_placeholder.output_path
  source_code_hash = data.archive_file.api_placeholder.output_base64sha256

  environment {
    variables = local.api_environment
  }

  depends_on = [aws_cloudwatch_log_group.api]

  lifecycle {
    # Deploys upload the real code.
    ignore_changes = [filename, source_code_hash]
  }
}
