# =============================================================================
# Pipeline Deploy Notifications — CodeStar → AWS Chatbot → Slack
# =============================================================================
# Portfolio runs its own Chatbot Slack channel configuration (separate from
# killfood's), wired to the same Slack workspace + channel. Pipeline status
# events from Portfolio-Deploy-Pipeline are routed directly to this Chatbot
# config via a CodeStar notification rule.
#
# The notification rule "Portfolio-Deploy-Notification" was created manually
# in 2021 and currently points at killfood's Chatbot config. After applying,
# it will be redirected to portfolio's own Chatbot config. Import it with:
#
#   terraform import aws_codestarnotifications_notification_rule.pipeline_status \
#     arn:aws:codestar-notifications:us-west-2:412430435138:notificationrule/5ddebcd1427919db36d9c2860acebea0afbca60d
# =============================================================================

resource "aws_chatbot_slack_channel_configuration" "deploy_announce" {
  configuration_name = "portfolio-deploy-announce"
  iam_role_arn       = aws_iam_role.chatbot.arn
  slack_team_id      = var.slack_team_id
  slack_channel_id   = var.slack_channel_id
  logging_level      = "NONE"
}

resource "aws_codestarnotifications_notification_rule" "pipeline_status" {
  name        = "Portfolio-Deploy-Notification"
  resource    = aws_codepipeline.portfolio.arn
  detail_type = "FULL"

  event_type_ids = [
    "codepipeline-pipeline-pipeline-execution-succeeded",
    "codepipeline-pipeline-pipeline-execution-failed",
    "codepipeline-pipeline-pipeline-execution-canceled",
    "codepipeline-pipeline-manual-approval-needed",
  ]

  target {
    address = aws_chatbot_slack_channel_configuration.deploy_announce.chat_configuration_arn
    type    = "AWSChatbotSlack"
  }
}
