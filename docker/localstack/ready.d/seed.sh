#!/bin/sh
# LocalStack init hook: runs once LocalStack is ready. Creates the local
# stand-ins for one environment's AWS resources. The API container loads
# content/experiences.json into the table itself (npm run seed), the same way
# a deploy does.
set -eu

TABLE=portfolio-experiences-local
BUCKET=jakekillpack-assets-local

awslocal dynamodb create-table \
  --table-name "$TABLE" \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST >/dev/null
awslocal dynamodb update-time-to-live \
  --table-name "$TABLE" \
  --time-to-live-specification Enabled=true,AttributeName=expiresAt >/dev/null

awslocal s3 mb "s3://$BUCKET" >/dev/null
if [ -d /seed/assets ] && [ -n "$(ls -A /seed/assets)" ]; then
  awslocal s3 sync /seed/assets "s3://$BUCKET/assets/" --only-show-errors
else
  echo "seed.sh: ../assets is empty; run 'mkdir -p assets && assets-tool pull portfolio prod' for images"
fi

# Fake secret, so the Parameter Store code path runs locally.
awslocal ssm put-parameter \
  --name /portfolio/local/mailgun/sending-key \
  --type SecureString \
  --value local-fake-mailgun-key >/dev/null

echo "seed.sh: created $TABLE, s3://$BUCKET, and /portfolio/local/mailgun/sending-key"
