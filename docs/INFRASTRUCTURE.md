# Portfolio Infrastructure

Portfolio is a **tenant** on the shared killfood AWS platform — a single EC2 / ECS host that also runs killfood and diamondsdesk. The shared platform is owned and managed in the [killfood-web](https://bitbucket.org/killfood/killfood-web) repository. Portfolio owns only the resources scoped to its own deployment (ECR repo, deploy pipeline, DNS zone, log group, dedicated IAM and notification config).

**Last Updated:** May 2026

---

## Architecture (where portfolio fits)

```
┌──────────────────────────────────────────────────────────────────┐
│   Shared EC2 instance — managed in killfood-web/terraform        │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │            ECS Task Definition (single, shared)            │  │
│  │                                                            │  │
│  │  ┌─────────┐   ┌──────────┐   ┌──────────────┐             │  │
│  │  │killfood │   │portfolio │   │ diamondsdesk │  …          │  │
│  │  │  -app   │   │  -app    │   │    -app      │             │  │
│  │  └────┬────┘   └────┬─────┘   └──────┬───────┘             │  │
│  │       └─────────────┼─────────────────┘                    │  │
│  │                     ▼                                      │  │
│  │              ┌────────────┐         ┌──────────┐           │  │
│  │              │   nginx    │         │  MySQL   │           │  │
│  │              │ (vhosts)   │         │ (shared) │           │  │
│  │              └────────────┘         └──────────┘           │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                             ▲
                             │
              jakekillpack.com (Route53 — owned by portfolio)
```

The nginx container routes `jakekillpack.com` traffic to the `portfolio-app` container by host header. MySQL is shared across all three apps; portfolio uses its own database (`portfolio`).

> **Current production status (as of 2026-04-26):** the `portfolio-app` and `diamondsdesk-app` containers were temporarily removed from `killfood-web/terraform/templates/task-definition.json` while resolving SSL issues during the killfood Laravel upgrade. Re-adding the portfolio container is tracked in [docs/action-plans/infrastructure-modernization.md](action-plans/infrastructure-modernization.md).

---

## Terraform Coverage

State and locks are shared with killfood (`killfood-terraform-state` S3 bucket, `killfood-terraform-locks` DynamoDB table) but use a separate state key (`portfolio/terraform.tfstate`). All commands run from `terraform/` with `export AWS_PROFILE=killfood`.

### What lives in `portfolio/terraform/`

| File | What it configures |
|---|---|
| `main.tf` | AWS provider, S3 backend (key: `portfolio/terraform.tfstate`) |
| `variables.tf` | Variable declarations (region, ECS cluster/service names, slack IDs, etc.) |
| `terraform.tfvars` | Actual values — **gitignored** |
| `outputs.tf` | ARNs/URLs printed after apply |
| `dns.tf` | Route53 hosted zone for `jakekillpack.com` and all DNS records (apex, www, MX/SPF/DKIM, email CNAME). Apex/www A records currently commented out — uncomment when re-adding portfolio to the task definition |
| `ecr.tf` | ECR repository `portfolio` and lifecycle policy (expires untagged images) |
| `codepipeline.tf` | `Portfolio-Deploy-Pipeline` (V2) — ECR push → ECS deploy. Artifact store is the shared `killfood-deploy` S3 bucket |
| `iam.tf` | Dedicated CodePipeline service role and Chatbot role for portfolio (no killfood role reuse) |
| `cloudwatch.tf` | `/ecs/killfood/portfolio` log group (the `/ecs/killfood/` prefix is historical — the cluster is named `killfood-test`) |
| `notifications.tf` | Portfolio's own Chatbot Slack channel config + CodeStar notification rule |

### What is NOT in portfolio's Terraform (lives in killfood-web)

Anything that is part of the shared platform stays in `killfood-web/terraform/`:

- ECS cluster, ECS service, **task definition** (all containers, including `portfolio-app`)
- EC2 instance / EBS volume / VPC / security groups / Elastic IP
- The shared `killfood-deploy` S3 bucket (portfolio's pipeline uses it as its artifact store)
- The shared `ecsTaskExecutionRole` / `ecsTaskRole` (portfolio's pipeline references these by ARN)
- EBS snapshots and DB backups (the daily EBS snapshot covers portfolio's DB rows, which live alongside killfood's in the shared MySQL)

This means: **infrastructure changes that affect the running container** (image, env vars, memory, mounts) are made in `killfood-web`, not here.

---

## Deploy Pipeline

```
portfolio (Bitbucket master)
        │  CircleCI builds Docker image
        ▼
ECR repo "portfolio:latest"
        │
        ▼
Portfolio-Deploy-Pipeline (V2)
  Source: ECR push trigger + Bitbucket checkout (for deploy/imagedefinitions.json)
  Deploy: ECS action — registers new task-def revision with only portfolio-app updated;
          force-deploys killfood-deployment service
        │
        ▼
ECS service rolling update (shared with killfood)
```

The `deploy/imagedefinitions.json` file in this repo names only `portfolio-app`, so killfood/nginx/db/etc. are untouched when portfolio deploys. Killfood has its own pipeline doing the symmetric thing for `killfood-app`. Both pipelines independently push to the same ECS service without stomping on each other.

Pipeline status events route to Slack via portfolio's own Chatbot config (`portfolio-deploy-announce`), separate from killfood's.

---

## DNS

`jakekillpack.com` was transferred to Route53 in May 2026. The hosted zone is managed in `terraform/dns.tf`. Records:

| Record | Type | Purpose |
|---|---|---|
| `jakekillpack.com` | A | Apex → shared EIP (currently commented out — uncomment after re-adding portfolio container) |
| `www.jakekillpack.com` | CNAME | → apex (currently commented out) |
| `jakekillpack.com` | MX | Mailgun inbound mail |
| `jakekillpack.com` | TXT | SPF (`v=spf1 include:mailgun.org ~all`) |
| `krs._domainkey.jakekillpack.com` | TXT | Mailgun DKIM |
| `email.jakekillpack.com` | CNAME | Mailgun click/open tracking |

Email records can be active independent of the website; they routed inbound email through Mailgun the moment the nameserver change propagated.

---

## Known Constraints

| Constraint | Notes |
|---|---|
| **Single shared task definition** | Adding/changing the portfolio container requires editing `killfood-web/terraform/templates/task-definition.json`. Running multiple ECS services would require an ALB (~$20/mo) — not worth it at current scale |
| **Shared MySQL** | Portfolio uses the `portfolio` database on killfood's MySQL container. No separate DB host |
| **No portfolio-specific backups** | Daily EBS snapshots (managed in killfood-web) capture the entire root volume, including portfolio data. Restore is at the volume level — same procedure as killfood, no portfolio-specific knobs |
| **Shared CodeStar connection** | Portfolio's pipeline uses the same Bitbucket CodeStar connection as killfood (`arn:…connection/90022187-…`) — created via Console OAuth, not Terraform-managed |
