# Maintenance Runbook

Operational procedures for portfolio. For broader infrastructure context (cluster, EC2, backups), see [INFRASTRUCTURE.md](INFRASTRUCTURE.md). For shared-platform operations (instance replacement, EBS, certbot), see `killfood-web/docs/MAINTENANCE.md` — portfolio inherits all of that.

---

## Local Development

See [RELEASE.md](RELEASE.md) for changelog. Local stack is described in the project root `README.md`. Quick reference:

```bash
cp example.docker-compose.yml docker-compose.yml   # if you don't already have one
cp .env.example .env                                # then edit DB_HOST=db, DB_DATABASE=portfolio,
                                                    # DB_USERNAME=homestead, DB_PASSWORD=secret,
                                                    # MAIL_HOST=mailhog
docker compose up -d --build
docker compose exec app composer install
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate --seed
```

Dev URL: <http://localhost:8089> · Mailhog: <http://localhost:8126> · phpMyAdmin: <http://localhost:9081>

Frontend changes:
```bash
docker compose exec app pnpm run dev    # one-shot build
docker compose exec app pnpm run watch  # rebuild on change
docker compose exec app pnpm run prod   # production minified build
```

---

## Deploying

Merging to `master` on Bitbucket triggers the CircleCI workflow:

1. **build** — composer + pnpm install, persist workspace
2. **phpunit** — boot MySQL, run `./vendor/bin/phpunit`
3. **aws-deploy** — only on `master`. Builds the production image (with ECR layer cache) and pushes to ECR `:latest`. The push triggers `Portfolio-Deploy-Pipeline`, which creates a new ECS task definition revision with only `portfolio-app` updated and force-deploys it.

**No manual deploy step is needed for application code changes.** Watch the deploy in CircleCI, then in CodePipeline (`Portfolio-Deploy-Pipeline`), then in ECS — Slack will post when the pipeline finishes.

### CircleCI environment variables required

These are set in the CircleCI project settings, not in this repo:

| Variable | Purpose |
|---|---|
| `ECR_URL`, `ECR_ACCESS_KEY`, `ECR_SECRET_KEY`, `ECR_REGION` | ECR push |
| `MAILGUN_DOMAIN`, `MAILGUN_SECRET`, `MAIL_FROM_ADDRESS` | Mailgun config baked into the image |
| `prod_app_env`, `prod_app_key`, `prod_app_url` | Laravel runtime config |
| `prod_db_host`, `prod_db_database`, `prod_db_username`, `prod_db_password` | DB credentials |

---

## Updating the portfolio container definition (cross-repo)

Anything that changes the *running* container — image tag, env vars, memory, port mapping, mounts — lives in **killfood-web**, not here. The portfolio container is one entry in killfood's shared `task-definition.json`.

### Workflow

1. **Edit `killfood-web/terraform/templates/task-definition.json`** — find the `portfolio-app` container entry and change what you need.
2. **Register and deploy the new revision:**
   ```bash
   cd /path/to/killfood-web
   ecs-tool push    # registers a new task definition revision and prompts to deploy
   ```
3. **Monitor:**
   ```bash
   ecs-tool monitor      # live dashboard
   ecs-tool logs portfolio-app --since 5m
   ```

`ecs-tool` is a wrapper documented in `killfood-web/docs/MAINTENANCE.md`. It reads the `killfood` AWS profile.

### Rolling back a bad portfolio deploy

```bash
cd /path/to/killfood-web
ecs-tool deploy       # picks from 3 most recent revisions; select the previous one
```

This redeploys the previous task definition revision, which restores the previous portfolio-app image (and leaves killfood-app on its current revision, since the previous task-def had the previous portfolio image but the *current* killfood image — task definitions are atomic snapshots).

---

## Bringing portfolio back online

The container is currently absent from killfood's task definition (removed during the killfood Laravel upgrade). To re-add:

1. **Re-add `portfolio-app`** to `killfood-web/terraform/templates/task-definition.json` (use the previous revision in the ECS console as a reference for the exact JSON shape).
2. **Run `ecs-tool push`** from killfood-web to register and deploy the revision.
3. **Uncomment the apex + www A records** in [terraform/dns.tf](../terraform/dns.tf) and `terraform apply` from this repo's `terraform/` directory. Until this is done, `jakekillpack.com` won't resolve to the EC2 instance.
4. **Verify nginx vhost** — confirm `killfood-web/docker-config/nginx/sites-enabled/` still has the portfolio vhost file. The nginx container routes by host header, so the vhost must exist for `jakekillpack.com` to reach `portfolio-app`.

---

## Viewing portfolio logs

Logs ship to CloudWatch under `/ecs/killfood/portfolio`. The simplest path:

```bash
cd /path/to/killfood-web
ecs-tool logs portfolio-app --since 1h
```

Or directly via AWS CLI:
```bash
export AWS_PROFILE=killfood
aws logs tail /ecs/killfood/portfolio --since 1h --follow
```

---

## Terraform changes

Anything in `portfolio/terraform/` (DNS, ECR, pipeline, IAM, log group, notifications):

```bash
cd terraform
export AWS_PROFILE=killfood
terraform plan
terraform apply
```

State and locks live in killfood's S3/DynamoDB; runs from this directory don't touch killfood's state because of the separate state key (`portfolio/terraform.tfstate`).

For changes to the shared platform (cluster, instance, security groups, etc.), work in `killfood-web/terraform/` instead.

---

## Domain / DNS changes

DNS records for `jakekillpack.com` are in [terraform/dns.tf](../terraform/dns.tf). After changes:

```bash
cd terraform
export AWS_PROFILE=killfood
terraform apply
```

Propagation: most resolvers pick up changes within 5–10 minutes given the configured TTLs (300s for A/CNAME, 3600s for MX/TXT). The Route53 nameservers themselves are managed via the registered domain — if you ever change them, run:

```bash
aws route53domains update-domain-nameservers \
  --region us-east-1 --domain-name jakekillpack.com \
  --nameservers Name=<ns1> Name=<ns2> Name=<ns3> Name=<ns4>
```
(`route53domains` is only in `us-east-1` regardless of what region the hosted zone is in.)

---

## Common issues

| Symptom | Likely cause | Fix |
|---|---|---|
| CircleCI build fails on composer install | composer.lock out of sync with composer.json | run `composer update` locally, commit the lock |
| CircleCI build fails on pnpm install | pnpm-lock.yaml out of sync | run `pnpm install` locally, commit the lock |
| ECR push succeeds but pipeline doesn't trigger | Pipeline disabled or detached from ECR source | check `Portfolio-Deploy-Pipeline` in AWS Console |
| Pipeline deploys but site still shows old code | nginx is caching, or the container is in `STOPPED` state | check `ecs-tool tasks` for portfolio-app status; check nginx logs |
| `jakekillpack.com` resolves but returns nginx default page | nginx vhost missing or hostname mismatch | check `killfood-web/docker-config/nginx/sites-enabled/` |
| Slack pipeline notifications stop arriving | Chatbot config drifted, or `@aws` was removed from the Slack channel | re-invite `@aws` to the channel; check Chatbot Slack config status in AWS Console |
