# Portfolio Serverless Rebuild

Status: proposal · Written 2026-10-03 · Updated 2026-10-04 (QA environment, limits and alerts)

Rebuild jakekillpack.com as-is (same pages, look, and behavior) as a React single-page app on S3 + CloudFront, with a NestJS API on Lambda, images on S3, a QA environment at `qa.jakekillpack.com`, and its own Terraform and IAM roles, patterned after killfood.

## Context

### What the Site Is

- Laravel 8 (PHP 8.1) with Blade views and one inline Vue 2 instance (`resources/js/app.js`). No auth, no admin.
- Three routes (`routes/web.php`):
  - `GET /` renders all work experiences.
  - `GET /experience/{id}` renders one, or 404.
  - `POST /send` validates name/email/body and emails the contact form.
- One real table, `work_experiences`, with 5 rows. The seeder that held them was emptied during the Laravel 8 upgrade (commit `6928a6c`); it was restored on 2026-10-03 (see [Changes to the Current Site](#changes-to-the-current-site)).
- Production mail went through Mailgun, with `From:` set to the visitor's own address. Gmail and other receivers reject or spam that under SPF/DMARC. Fixed in the current code on 2026-10-04 (see [Changes to the Current Site](#changes-to-the-current-site)).
- 29 image and font files (2.8 MB) are committed under `public/`, along with the compiled `public/js` and `public/css`. Because every image revision stays in history, the repo's pack is 23.9 MiB.
- Bootstrap is loaded twice: 4.6 compiled from `resources/sass/app.scss`, and a 4.0.0-beta.2 stylesheet from a CDN in `layouts/app.blade.php`.

### Where It Ran

The `portfolio-app` container ran inside killfood's shared ECS task on the t2.small, using a database in killfood's MySQL container. Killfood removed it (killfood commits `f842760` and `793c271`). `jakekillpack.com` has no A record today, so the site is offline.

Leftovers in the account (inventoried with `killfood-ro` on 2026-10-03; cleaned up 2026-10-04):

| Resource | State | Bills while idle? |
|----------|-------|-------------------|
| ECR repo `portfolio` | 3 images, ~2 GB, last push 2022-10-16. **Kept on purpose** (see [Phase 0, step 2](#phase-0-safety-and-foundations-no-visible-change)) | Yes, up to ~$0.20/month |
| CodePipeline `Portfolio-Deploy-Pipeline` (V2) | Was triggered by a push of `portfolio:latest` and deployed to killfood's production service. **Deleted 2026-10-04** | — |
| EventBridge rule `codepipeline-portfo-latest-115244-rule` | **Deleted 2026-10-04** | — |
| CodeStar connection `90022187-…` ("Portfolio Connection", GitHub) | **Deleted 2026-10-04**. The "AWS Connector for GitHub" app may still be installed on your GitHub account; remove it there if nothing else uses it | — |
| Chatbot config `portfolio-deploy-announce`, role `portfolio-chatbot-role`, its notification rule and SNS topic | **Deleted 2026-10-04**; the config was removed first to free `#portfolio-logs` (see [Where Alerts Go](#where-alerts-go)) | — |
| IAM roles `AWSCodePipelineServiceRole-us-west-2-Portfolio-Deploy-Pipeline`, `cwe-role-us-west-2-Portfolio-Deploy-Pipeline`, and their policies | **Deleted 2026-10-04** | — |
| Log group `/ecs/killfood/portfolio` | **Deleted 2026-10-04** (it was empty) | — |
| Route 53 zone `jakekillpack.com` | Mailgun MX, SPF, DKIM, and `email.` CNAME only. **Imported into `terraform/global` 2026-10-04** | $0.50/month |
| Domain `jakekillpack.com` | Auto-renews 2027-11-17 | $16/year |

### An Orphaned Terraform State

`killfood-terraform-state` already holds `portfolio/terraform.tfstate` (26.9 KiB, last written 2026-05-03; found 2026-10-04). An earlier portfolio Terraform wrote it, and that code isn't in this repo's history, killfood's, or anywhere on this machine. Judging by the `Project=portfolio` + `ManagedBy=terraform` tags, it manages:

- the `jakekillpack.com` zone (comment "Managed by Terraform"), and probably its Mailgun records
- the `portfolio` ECR repo
- `Portfolio-Deploy-Pipeline`, its CodePipeline role and policy, and the CodeStar notification rule
- the old Slack config and its role and policy
- `/ecs/killfood/portfolio`

What this means:

- **Never apply `terraform/` from commit `a899345`.** Its single-environment `main.tf` used that same key. With no zone or pipeline in its config, a plan from that commit would try to destroy everything the old state owns. The new layout uses different keys (`portfolio/global.tfstate`, `portfolio/qa.tfstate`, `portfolio/prod.tfstate`).
- ✅ **Resolved 2026-10-04.**
  - Its 17 addresses were listed (addresses only).
  - Everything it managed was deleted, apart from the ECR repo (kept) and the zone and records, which were imported into `global/`.
  - The state was moved to `portfolio/archive/terraform-2026-05-03.tfstate`. The bucket is versioned, so the original is still recoverable.
  - The lock table's checksum entry for the old key was left in place on purpose. Anything that tries to use `portfolio/terraform.tfstate` again (such as `a899345`) now fails with a checksum error instead of running.

### Hazard: the Old CI Can Still Touch Killfood Production

`.circleci/config.yml` runs `aws-deploy` on every merge to master. That job:

1. Builds `docker-config/pma/pma.Dockerfile` and pushes it as **`killfood-pma:latest`** on Docker Hub, the phpMyAdmin image killfood's production task pulls.
2. Pushes `portfolio:latest` to ECR, which starts `Portfolio-Deploy-Pipeline` against killfood's production ECS service. With no `portfolio-app` container left in killfood's task definition, that deploy should fail rather than change anything, but it still runs against production.

The last master merge (2022-10-16) lines up with the last ECR push, so CircleCI was active then. The CircleCI project is still registered to the `shazaman23` org (its public API returned the project on 2026-10-04), but whether it's actively building can't be seen without logging in.

**Status (2026-10-04): the AWS half of the chain no longer exists.**

| Guard | Where | Undo |
|-------|-------|------|
| Deleted `.circleci/config.yml` and `deploy/imagedefinitions.json` | Branch `refresh-local-add-terraform-and-small-cleanups`. Takes effect on master when that branch merges: CircleCI finds no config in the merge commit, so no job runs. This is the only guard against the Docker Hub `killfood-pma` overwrite. | Restore the files from git history |
| Deleted the old pipeline, its EventBridge trigger, roles, and connection | AWS, 2026-10-04 (Phase 0, step 2). An ECR push of `portfolio:latest` can no longer reach killfood's ECS service. They were first disabled (rule and Deploy transition) earlier the same day, then deleted. | Not reversible; nothing left to re-enable |

Still open by choice: the CircleCI project and its environment variables stay in place until the GitHub Actions replacement works (Phase 5). Those variables hold Docker Hub credentials that can push `killfood-pma`, ECR keys, and the old production secrets, so they get cleared then. Until Phase 5, nothing runs the test suite automatically; run it locally (see [Changes to the Current Site](#changes-to-the-current-site)).

### Goal

- Same site, rebuilt on React + NestJS with no always-on servers.
- Images live in S3, not git.
- Three environments:
  - **local:** Docker Compose with LocalStack
  - **QA:** `qa.jakekillpack.com`, deployed by hand from any branch
  - **production:** deployed on merge to master
- Terraform in this repo owns every resource, following killfood's conventions, with roles of its own (no sharing of killfood's roles or keys).
- Costs have a ceiling. Rate limits stop obvious abuse, and alerts fire well before free allowances run out.

## Environments

| | Local | QA | Production |
|---|---|---|---|
| URL | `http://localhost:5173` | `https://qa.jakekillpack.com` | `https://jakekillpack.com` (`www` redirects to the apex) |
| Frontend | Vite dev server | S3 `jakekillpack-site-qa` via CloudFront | S3 `jakekillpack-site-prod` via CloudFront |
| API | Nest as a plain HTTP server | Lambda `portfolio-api-qa` behind its own HTTP API | Lambda `portfolio-api-prod` behind its own HTTP API |
| Data | LocalStack DynamoDB | DynamoDB `portfolio-experiences-qa` | DynamoDB `portfolio-experiences-prod` |
| Media | LocalStack S3 | S3 `jakekillpack-assets-qa` | S3 `jakekillpack-assets-prod` |
| Secrets | LocalStack SSM, fake values | `/portfolio/qa/<service>/<name>` | `/portfolio/prod/<service>/<name>` |
| Email | Mailhog | Mailgun → your inbox, subject prefixed `[QA]` | Mailgun → your inbox |
| Deploys | — | Manual: run the **Deploy QA** workflow on any branch | Automatic on merge to `master` |
| Access | — | Public, with an `X-Robots-Tag: noindex` header and a `robots.txt` that disallows all crawling (decided 2026-10-04) | Public |
| CloudFront pricing | — | Flat-rate Free plan if AWS accepts a second plan on the same domain; otherwise pay-as-you-go | Flat-rate Free plan |
| Alarms | — | None (the cost budget covers it) | Full set, posted to Slack (see [Limits, Rate Limiting, and Alerts](#limits-rate-limiting-and-alerts)) |

QA and production are identical stacks built from one Terraform module. So QA tests the real AWS path: CloudFront routing, API Gateway, the Lambda wrapper, IAM, and Parameter Store. QA has its own media bucket and table, so content and image changes can be previewed there before they reach production.

QA is one shared environment, so it shows whichever branch was deployed last. That fits a one-person project; per-branch environments would need a stack per branch.

### Local Stack

Docker Compose services:

- **`localstack`:** LocalStack's free Hobby plan, which is for non-commercial use; a personal portfolio qualifies. Since 2026-03-23 it requires a free LocalStack account and an auth token, kept in the gitignored `.env`. It runs DynamoDB, S3, and SSM.
- **`api`:** Nest as a plain HTTP server in watch mode. Its AWS SDK clients point at `http://localstack:4566`.
- **`web`:** the Vite dev server. It proxies `/api/*` to `api` and `/assets/*` to the LocalStack assets bucket, standing in for CloudFront's routing.
- **`mailhog`:** catches contact-form email.

A LocalStack init hook (`docker/localstack/ready.d/seed.sh`, mounted at `/etc/localstack/init/ready.d/`) creates the table, the bucket, and fake secrets, seeds `content/experiences.json`, and uploads `assets/`. A fresh `docker compose up` gives a working site.

What isn't emulated: the Hobby plan doesn't include API Gateway HTTP APIs or CloudFront, which are only on LocalStack's higher paid tiers. Locally, Vite stands in for CloudFront, and Nest runs without the Lambda wrapper. The wrapper (`lambda.ts`) gets a unit test, and QA exercises the full path for real.

If you'd rather not have a LocalStack account, `amazon/dynamodb-local` plus MinIO covers DynamoDB and S3, and secrets come from `.env`.

## Target Architecture

The same stack for each environment:

```
  Browser
     │
     ▼
┌──────────────────────────────────────┐
│ Route 53  jakekillpack.com           │  existing zone; alias A/AAAA records
│                                      │  prod: apex + www · qa: qa
└──────────────┬───────────────────────┘
               ▼
┌──────────────────────────────────────────────────────────────────┐
│ CloudFront  (ACM certificate in us-east-1)                       │
│   prod: flat-rate Free plan, WAF per-IP rate limit               │
│   qa:   public, noindex header and robots.txt                    │
│   /*          → S3 jakekillpack-site-<env>    (OAC, React build) │
│   /assets/*   → S3 jakekillpack-assets-<env>  (OAC, images)      │
│   /api/*      → API Gateway HTTP API (throttled)                 │
└───────────────────────────────────────────────┬──────────────────┘
                                                ▼
                          ┌─────────────────────────────────────┐
                          │ Lambda  portfolio-api-<env>         │
                          │ NestJS · Node.js · arm64 · 512 MB   │
                          │ reserved concurrency 5              │
                          └───────┬──────────────────┬──────────┘
                                  ▼                  ▼
                   DynamoDB                      Mailgun API → your inbox
                   portfolio-experiences-<env>   (key from /portfolio/<env>/mailgun/api-key)
```

API surface (replaces the three Laravel routes):

| Endpoint | Replaces | Notes |
|----------|----------|-------|
| `GET /api/experiences` | data for `GET /` | CloudFront caches it for 5 minutes, which hides most Lambda cold starts |
| `GET /api/experiences/:id` | data for `GET /experience/{id}` | 404 for an unknown id |
| `POST /api/contact` | `POST /send` | Same rules as today: name required, max 150; email required and valid; body required. Returns 400 with per-field errors, and 429 once the daily send cap is reached |

Client-side routes (`/`, `/experience/:id`) are handled by a CloudFront Function that rewrites extensionless paths to `/index.html`. In production the same function redirects `www` to the apex. A distribution-wide custom error response could do the rewrite instead, but it would also turn API 404s into the HTML page.

## Decisions

| Area | Choice | Why, and the alternative |
|------|--------|--------------------------|
| Frontend | React + Vite + TypeScript + React Router. The existing SCSS partials and Bootstrap 4.6 are ported unchanged. | Parity first (confirmed 2026-10-04). A Tailwind restyle and a refresh of the experiences are separate projects after cutover. |
| API runtime | NestJS (Express adapter) wrapped with `@codegenie/serverless-express`, bundled to one file with esbuild, on the newest Node.js LTS Lambda runtime, arm64, 512 MB | Bundling and a cached handler keep cold starts down; arm64 is 20% cheaper per GB-second. |
| API front door | API Gateway HTTP API, with stage and route throttling | $1 per million requests. A Lambda Function URL behind CloudFront OAC is free, but POSTs then need the browser to send a SHA-256 hash of the body. |
| Data | DynamoDB on-demand, one table per environment, keyed by `id` (`"1"`–`"5"`, so old `/experience/{id}` links keep working). The source of truth is `content/experiences.json` in the repo; each deploy upserts it into that environment's table. | Confirmed 2026-10-04. Free at this size, and it keeps the API a real data-backed service. |
| Email | Mailgun for both directions (decided 2026-10-04). The API sends the contact form through Mailgun's HTTP API with `From: portfolio@jakekillpack.com` and `Reply-To:` the visitor. Each environment has its own key at `/portfolio/<env>/mailgun/api-key`, read at cold start. `contact@jakekillpack.com` keeps forwarding through its Mailgun route. | One email provider, already verified, and the DNS records don't change. Keys stay out of Lambda environment variables, which the `killfood-ro` read-only role can see; that role is denied `ssm:GetParameter`. SES was the alternative: no key at all, but a second provider, since SES has no simple inbound forwarding. |
| Edge pricing | CloudFront flat-rate Free plan for production | $0/month with no overage charges, whatever the traffic or attack. It includes WAF with per-IP rate limiting, DDoS protection, the Route 53 zone fee, and 5 GB of S3 storage credits. Pay-as-you-go has a bigger free allowance (1 TB and 10M requests) but no ceiling past it, and WAF would cost about $7–8/month. |
| Images | One S3 bucket per environment, served through CloudFront at `/assets/*` | See [Asset Strategy](#asset-strategy). |
| CI/CD | GitHub Actions, using GitHub Environments (`qa`, `production`) with one OIDC deploy role each | No stored AWS keys, unlike killfood's `circleci-deploy` user. Free minutes for a public repo. This replaces CircleCI, ECR, and CodePipeline. |
| Infrastructure | Terraform: a shared module, a root per environment, and a root for shared resources | See [Terraform](#terraform). |
| Local dev | Docker Compose with LocalStack | See [Local Stack](#local-stack). |

## Asset Strategy

### Today

Images sit in `public/img` and ship inside the Docker image. Changing a photo means a commit, a CI build, and a deploy, and the old copy stays in git history forever.

### Plan

Split assets by who references them:

- **Code assets:** anything the SCSS or components reference (`main-banner-bg-2.png`, the computer/iPad/phone frames, the Flaticon font, the favicon; about 100 KB). These live in `web/src/assets`, Vite fingerprints them, and each deploy uploads them to that environment's site bucket. Compiled output is never committed again.
- **Unused, not carried over:** `main-banner-bg.png` and `public/fonts/vendor/bootstrap-sass/` (glyphicons). Nothing references them.
- **Media:** anything content references (About Me photos, desktop and mobile screenshots). These live only in the `jakekillpack-assets-<env>` buckets, served at `/assets/*`. They're converted to WebP on the way in, because image bytes are what use up CloudFront's allowance (see [Limits](#limits-rate-limiting-and-alerts)). The conversion in Phase 1 took the 14 files from 2.5 MB to 0.96 MB.

Bucket setup (`modules/site/s3.tf`, killfood's bucket conventions):

- Private, with all four public-access blocks, `BucketOwnerEnforced`, and SSE-S3. The environment's CloudFront OAC is the only reader.
- Versioning on, so an overwrite or delete can be undone, plus a lifecycle rule that expires noncurrent versions after 90 days and aborts incomplete multipart uploads after 7.
- `prevent_destroy`.

Key layout (each key matches its URL path):

```
assets/img/about/<name>.webp                 (family-cabin, betrayal-game-slim, studying, popcorn, jetski-day)
assets/img/screenshots/desktop/<name>.webp   (uk2-dropdown, uk2-dont-forget, uk2-bulk-search, uk2-disclaimers, benegov-site)
assets/img/screenshots/mobile/<name>.webp    (the same, minus uk2-dont-forget, which has no mobile view)
```

- **Why keys start with `assets/`:** CloudFront forwards the whole request path to the origin, and an origin path can add a prefix but can't remove one. So `/assets/img/about/popcorn.webp` reads the key `assets/img/about/popcorn.webp`, with no rewrite function needed.
- **Vite must not build into `/assets/`:** that's its default output folder for JS and CSS, and CloudFront would route those requests to the media bucket. Phase 4 sets `build.assetsDir: 'static'`.

Experience records store just the file name (`"screenshot": "uk2-dropdown.webp"`), and the frontend builds `/assets/img/screenshots/{desktop,mobile}/<name>`.

Workflow:

- `assets/` at the repo root is the gitignored working copy. It mirrors the bucket's `assets/` prefix, so `assets/img/about/popcorn.webp` is served at `/assets/img/about/popcorn.webp`.
- Two personal tools in `~/bin` do the work. They aren't in this repo, because other projects (UFF, killfood) can use them too; `--help` on each has the details.
- `to-webp [-w width] [-o dir] <image>...` converts new images. It encodes each one both lossy (quality 85) and lossless and keeps the smaller file. Lossy won for the photos and the busier screenshots; lossless won for flat UI. It drops EXIF data, such as phone GPS, and never scales up. The About Me photos display at 300 CSS pixels tall or less, so `-w 1200` is plenty for a large photo. `cwebp` runs in a local Docker image, built on first use, so there's nothing to install.
- `assets-tool push|pull|ls portfolio qa|prod [path...]` wraps `aws s3 sync` using the `portfolio-assets-qa` or `portfolio-assets-prod` CLI profile. Optional paths limit it to particular files or folders. Each must be inside `assets/`, and the tool won't run until that folder exists, so it can't sync the wrong files. `--dryrun` previews a change. Push to QA, check it on `qa.jakekillpack.com`, then push to production. It never deletes on either side; versioning covers mistakes anyway.
- Media is uploaded with `Cache-Control: public, max-age=86400`. To change an image, prefer a new file name. Overwriting an existing name needs `aws cloudfront create-invalidation`; the first 1,000 paths each month are free.
- Local dev: the LocalStack init hook uploads `assets/` into the local bucket under the same `assets/` prefix. A new machine fills the folder with `mkdir assets && assets-tool pull portfolio prod`.
- Git history: leave it alone. Rewriting a public repo's history isn't worth about 20 MB. The media leaves `public/` at cutover.

## Terraform

### Layout

```
terraform/
  global/          shared resources       state: portfolio/global.tfstate
  modules/site/    one environment        (no state of its own)
  envs/qa/         calls modules/site     state: portfolio/qa.tfstate
  envs/prod/       calls modules/site     state: portfolio/prod.tfstate
```

- **`global/`** holds what exists once per account or domain:
  - the imported Route 53 zone and its Mailgun records
  - the GitHub OIDC provider
  - the `portfolio-alerts` SNS topic and its Slack channel configuration
  - the portfolio cost budget
- **`modules/site/`** holds everything one environment needs: buckets, certificate, distribution, CloudFront Function, the environment's DNS records, table, function, log group, HTTP API, IAM roles, and (optionally) alarms.
- **`envs/qa` and `envs/prod`** each contain:
  - a backend block
  - providers whose `default_tags` set `Environment`
  - one `module "site"` call with that environment's settings: hostnames, `noindex` on or off, alias records on or off, throttle limits, and alarms on or off
- **Apply order** is `global`, then `envs/qa`, then `envs/prod`. A module change reaches QA first and gets checked there before production. Separate state means a QA apply can't touch production.
- **Today's `terraform/`** was written for a single environment and hasn't been applied. It moves into this layout in Phase 0, so there's no state to migrate.

### Conventions Kept from Killfood

- Runs from each root directory with `export AWS_PROFILE=killfood` (admin). Inspection uses `killfood-ro`.
- State goes in killfood's bucket and lock table under `portfolio/` keys (`killfood-terraform-state`, locked by `killfood-terraform-locks`). Separate state means no project's or environment's plan can touch another's resources.
- One file per concern. Each root's `terraform.tfvars` is gitignored and holds the account-specific values. Tags come from `common_tags` via `default_tags`: `Project=portfolio` everywhere, and `Environment` set to `qa` or `production`.
- `prevent_destroy` on the buckets, tables, and hosted zone. Terraform requires that flag to be a literal, so it applies to QA too; tearing QA down means removing it on purpose.
- `ignore_changes` wherever something else owns a value:
  - the Lambda's code, which CI deploys (the same way killfood's ECS service ignores `task_definition` so CodePipeline can own it)
  - the production distribution's `web_acl_id`, which the flat-rate plan owns
- Terraform 1.16 warns that the `dynamodb_table` backend argument is deprecated in favor of `use_lockfile = true`. It's kept here to match killfood; switch both at once later.

### Files

| Path | What it configures | Phase |
|------|--------------------|-------|
| `global/dns.tf` | Imported `jakekillpack.com` zone and Mailgun records (✅ 2026-10-04; the records imported with no changes) | 0 |
| `global/iam.tf` | GitHub OIDC provider | 0 |
| `global/monitoring.tf` | SNS topic `portfolio-alerts`, its Slack channel configuration and notifications-only role, and an AWS Budget filtered to `Project=portfolio` (see [Where Alerts Go](#where-alerts-go)) | 0 |
| `modules/site/iam.tf` | The environment's three roles: today's `terraform/iam.tf`, with names suffixed by environment and trust moved to GitHub Environments | 0 |
| `modules/site/s3.tf` | Site and assets buckets, encryption, versioning, lifecycle, public-access blocks, OAC-only bucket policies (✅ assets bucket, 2026-10-04) | 1–2 |
| `modules/site/acm.tf` | Certificate in us-east-1 for the environment's hostnames, DNS-validated | 2 |
| `modules/site/cloudfront.tf` | Distribution, two OACs, three behaviors, cache policies, response headers policy (`noindex` on QA), CloudFront Function | 2 |
| `modules/site/dns.tf` | Alias records (behind an on/off input) and certificate validation records, in the global zone | 2 |
| `modules/site/dynamodb.tf` | The environment's table (on-demand) | 3 |
| `modules/site/lambda.tf` | Function with reserved concurrency, 30-day log group, placeholder zip with `ignore_changes` on code | 3 |
| `modules/site/apigateway.tf` | HTTP API, `$default` route → Lambda, stage and route throttling | 3 |
| `modules/site/alarms.tf` | CloudWatch alarms → `portfolio-alerts` (production only) | 5 |

The zone and its four Mailgun records already exist, so they're imported rather than created: `terraform import aws_route53_zone.main Z05239741F47L70Y5ONQR`, plus one import per record. The plan must then show no changes to them.

The production stack can be built before launch with its alias records switched off. Turning them on at cutover is what makes the site live.

### Not Managed by Terraform

| Resource | Reason |
|----------|--------|
| Secret values in Parameter Store (`/portfolio/<env>/<service>/<name>`) | If Terraform managed the parameters, refreshes would copy the decrypted values into state. Each is created once with the CLI (see [Secrets](#secrets)), the same way killfood's `production.env` lives in S3 outside Terraform. Terraform only grants read access, through each environment's `api_secret_parameters`. |
| CloudFront flat-rate plan subscription, attaching the zone to it, and the plan's WAF rate-limit setting | Managed in the CloudFront console (or the PricingPlanManager CLI). The plan attaches its own WAF web ACL, so Terraform ignores the distribution's `web_acl_id`. A subscribed distribution can't be deleted until the plan is cancelled. |
| GitHub Environments `qa` and `production` and their branch rules | Repository settings |
| Mailgun account, domain, sending keys, and the `contact@` route | These live in Mailgun's dashboard. A Mailgun Terraform provider exists, but it would need an API key in Terraform. Only the DNS records are managed here. |

## IAM Roles

Status: **applied 2026-10-04** from `modules/site/iam.tf`, with one copy of the three roles per environment.

- **Policy checks:** IAM Access Analyzer reports no findings on any permission policy, or on the Lambda and assets-publisher trust policies.
- **Advisory on the GitHub trust policies:** they get `SPECIFIC_GITHUB_REPO_AND_BRANCH_RECOMMENDED` (plus an informational `CONFIRM_AUDIENCE_CLAIM_TYPE`). The analyzer expects a branch in the OIDC subject, but these trust a GitHub Environment instead, which is GitHub's documented pattern. The Environment's branch rule (production = `master` only) does the branch check.
- **Optional hardening:** customize the repo's OIDC subject template to include both `environment` and `ref`, then require `ref:refs/heads/master` in the production trust policy too.
- **Assets roles:** both `portfolio-assets-publisher-*` roles were assumed successfully from the admin profile.

| Role (one per environment) | Assumed by | Can do | Killfood counterpart |
|------|------------|--------|----------------------|
| `portfolio-api-lambda-<env>` | Lambda | Write its own log group. `GetItem`/`Query`/`Scan` on its own table, plus `UpdateItem` for the daily contact-send counter. `ssm:GetParameter`/`GetParameters` on each secret in its `api_secret_parameters` under `/portfolio/<env>/`, never the whole prefix. No `kms:Decrypt` is needed: the AWS-managed `aws/ssm` key's policy already lets principals in the account decrypt through SSM (checked 2026-10-04). | `ecsTaskRole` |
| `portfolio-github-deploy-<env>` | GitHub Actions jobs running in the repo's matching GitHub Environment, via OIDC with no keys. Subject `repo:shazaman23/portfolio:environment:qa` or `…:environment:production` | Put/delete objects in its own site bucket; update its own function's code; upsert items in its own table; invalidate its own distribution | `circleci-deploy` user (static keys, `AmazonEC2ContainerRegistryFullAccess`) |
| `portfolio-assets-publisher-<env>` | You, from the admin profile via the `portfolio-assets-qa` or `portfolio-assets-prod` CLI profile (no keys) | Read, write, and delete objects in its own assets bucket; invalidate its own distribution | `killfood-local-dev` / `personal-ecr-access` users (static keys) |

Also:

- **Branch rules:** the GitHub Environments enforce which branches may deploy. `production` accepts deployments only from `master`; `qa` accepts any branch. The OIDC subject names the environment, so only a job GitHub let into `production` can assume the production role.
- **Isolation between environments:** every role is scoped to resources named for its own environment, so nothing in QA can touch production.
- **Pull requests** get no AWS access at all.
- **OIDC provider** for `token.actions.githubusercontent.com`, in `global/`. The account has none today.
- **Slack alerts role** `portfolio-chatbot-alerts`, in `global/`. The Slack integration assumes it, and it can only read CloudWatch (see [Where Alerts Go](#where-alerts-go)).
- **Read-only access** reuses the account-wide `killfood-readonly` role (`killfood-ro`), which already covers everything here. It already denies S3 object reads and SSM parameter reads, so state, media contents, and the Mailgun keys stay out of inspection sessions.
- **Interim scope:** the CloudFront statements use `distribution/*` until Phase 2 creates the distributions. The account has no other distributions. Phase 2 narrows each to its own distribution's ARN.

CLI profiles to add to `~/.aws/config` after apply:

```ini
[profile portfolio-assets-qa]
role_arn = arn:aws:iam::412430435138:role/portfolio-assets-publisher-qa
source_profile = killfood
role_session_name = portfolio-assets
region = us-west-2

[profile portfolio-assets-prod]
role_arn = arn:aws:iam::412430435138:role/portfolio-assets-publisher-prod
source_profile = killfood
role_session_name = portfolio-assets
region = us-west-2
```

## Secrets

This is the pattern for any credential the API needs (decided 2026-10-04), and it repeats for future integrations.

### Where Secrets Live

- **Path:** `/portfolio/<env>/<service>/<name>`, lowercase and hyphenated. For example `/portfolio/prod/mailgun/api-key`, and later perhaps `/portfolio/prod/kafka/sasl-username`. Each environment has its own copy, so QA can use a separate Mailgun key that's revoked independently.
- **Fetched at runtime, never set at deploy time:**
  - A Lambda environment variable is plaintext to anyone who can read the function's configuration, including `killfood-ro`. It also lands in Terraform state if Terraform sets it.
  - A runtime fetch keeps only the parameter name in the configuration, and the value lives only in the function's memory. Access is granted per secret by IAM, and every read is logged in CloudTrail. `killfood-ro` is denied both `ssm:GetParameter*` and `secretsmanager:GetSecretValue`.
- **Locally,** LocalStack's SSM holds fake values under `/portfolio/local/...`, so the same code path runs.

### Parameter Store or Secrets Manager

| Use | When | Cost (us-west-2) |
|-----|------|------------------|
| Parameter Store SecureString (the default) | Credentials your own code uses: API keys, webhook signing secrets, credentials for a Kafka producer client. Rotated by hand. Up to 4 KB (8 KB as an advanced parameter). | Free for standard parameters at standard throughput; advanced parameters are $0.05 each per month |
| Secrets Manager | An AWS service reads the secret itself: a Lambda Kafka trigger's credentials, MSK SASL/SCRAM, RDS-managed passwords. Also when you need automatic rotation, values over 8 KB, cross-account sharing, or multi-region replication. | $0.40 per secret per month + $0.05 per 10,000 calls |

The AWS-managed `aws/ssm` key is fine for encryption within this account; its policy was checked on 2026-10-04. Use a customer-managed KMS key (about $1/month) when you need cross-account access, separate key-level permissions or audit, or when a service requires one (MSK SASL/SCRAM does).

### Adding a Secret

1. Store it once per environment with the admin profile, tagged for cost tracking, without leaving the value in shell history:

   ```bash
   read -rs SECRET && AWS_PROFILE=killfood aws ssm put-parameter \
     --name /portfolio/<env>/<service>/<name> --type SecureString --value "$SECRET" \
     --tags Key=Project,Value=portfolio Key=Environment,Value=<qa|production> && unset SECRET
   ```

   To change the value later, add `--overwrite` and drop `--tags`; the CLI doesn't accept both together.
2. Add `<service>/<name>` to `api_secret_parameters` in both `envs/qa` and `envs/prod`, then apply QA, then production. The variable's validation rejects names that don't fit the convention, and each role gains read access to that one parameter in its own environment.
3. In code, read it through the single shared helper: Powertools for AWS Lambda's Parameters utility, `getParameter(name, { decrypt: true, maxAge: 300 })`.
   - The helper caches the value in module scope for 5 minutes, so a changed value takes effect without a redeploy.
   - Never copy the value into `process.env`, and never log it.
   - Add a fake value to the LocalStack init hook.
4. If a secret belongs in Secrets Manager instead (see the table above), give it the same name there (`portfolio/<env>/<service>/<name>`). Grant `secretsmanager:GetSecretValue` on that secret's ARN, and read it with Powertools' `getSecret`.

## Limits, Rate Limiting, and Alerts

Three layers keep bot traffic from becoming a bill.

### At the Edge (CloudFront Flat-Rate Free Plan)

- **No overage charges:** CloudFront, WAF, and the attached Route 53 zone cost $0/month whatever the traffic or attack. The allowance is 1M requests and 100 GB a month.
- **Built-in "approaching" alerts:** AWS emails the account at 50%, 80%, and 100% of the allowance.
- **Going over:** still no charge. The first spike up to 3× the allowance is absorbed that month. Sustained excess over 2–3 months gets slower delivery (fewer or more distant edge locations) until you upgrade. Pro is $15/month for 10M requests and 50 TB.
- **In page views:** at today's ~3 MB per uncached page, 100 GB is about 33,000 first visits a month, and 1M requests is about 50,000 at ~20 requests each. WebP (Phase 1, which cut the media from 2.5 MB to 0.96 MB) and lazy-loading the About Me photos (Phase 4) should roughly triple the bandwidth headroom. Returning visitors cost far less, because fingerprinted assets and images stay in the browser cache. A steady 1M views a month would mean upgrading to Pro or Business, and the 50% and 80% emails arrive long before that.
- **Per-IP rate limit (WAF, included):** start at 300 requests per 5 minutes per IP and tune once real traffic is visible. A full uncached page view is about 20 requests, so a real visitor never gets near it. Requests WAF blocks don't count against the allowance. DDoS protection and bot management are also included.

QA gets the same protection if AWS accepts a second Free plan on the same domain (an account can have three). That matters more now that QA is public; its hostname is discoverable through certificate transparency logs. If AWS won't accept it, QA's CloudFront stays on pay-as-you-go with no WAF. QA traffic should still fit easily inside the always-free 1 TB and 10M requests, its API has the same origin caps as production, and the cost budget is the backstop.

### At the Origin (Pay-as-You-Go in Both Environments)

API Gateway, Lambda, and DynamoDB bill per request no matter which CloudFront plan is in use, so they get their own caps:

| Guard | Setting | What it stops |
|-------|---------|---------------|
| CloudFront cache for `GET /api/*` | 5 minutes; cache key ignores query strings | GET floods are served from cache, and adding `?x=random` can't force a Lambda call |
| API Gateway stage throttle | 5 requests/second, burst 10 | Caps total API traffic |
| API Gateway route throttle on `POST /api/contact` | 1 request/second, burst 2 | Form floods |
| Daily contact-send cap (in the API) | 25 emails/day per environment, counted in DynamoDB; past the cap the form returns 429 and points to `contact@jakekillpack.com` | Mailgun overage charges. A bot that passed validation could otherwise send up to 1/second, and Mailgun bills overage outside AWS on an account killfood shares. This is the hard ceiling for email. |
| Lambda reserved concurrency | 5 | Concurrent executions, so a flood can't eat the account's 1,000-execution pool (checked 2026-10-04) that killfood's Lambda shares |
| Honeypot field | — | Simple form bots |

**Worst case:** suppose a distributed bot held the API at its throttle 24/7 for a whole month and nobody responded. That's about 13M requests: API Gateway ~$13, Lambda ~$6, DynamoDB ~$2, so **about $21**. Email stays capped at 25/day, and CloudFront stays at $0. The alarms below fire within the first day.

### Alerts (Production)

CloudWatch alarms publish to the `portfolio-alerts` SNS topic, which posts to Slack (see [Where Alerts Go](#where-alerts-go)). Alarm names start with `portfolio-prod-` so they stand out in a shared channel.

| Alarm | Fires when | Why |
|-------|-----------|-----|
| Lambda errors | `Errors` ≥ 1 in 5 minutes | The API is failing |
| API 5xx | `5xx` ≥ 1 in 5 minutes | Requests are failing at or behind API Gateway |
| API volume | `Count` > 30,000 in a day | Origin traffic is on pace for about 1M requests a month, the edge of Lambda's free tier |
| API 4xx spike | `4xx` > 300 in 5 minutes | Mostly 429s from the throttles or the send cap, which means a bot is pushing on the limits |

Outside CloudWatch:

- **CloudFront usage emails** at 50%, 80%, and 100% of the plan allowance. AWS sends these automatically to the account's email address; they can't be routed to Slack.
- **AWS Budget:** $5/month, filtered to `Project=portfolio`, alerting at 80% of actual spend and 100% of forecast. It publishes to `portfolio-alerts` too, so it lands in Slack. It covers QA and anything the alarms miss. Plain cost budgets are free; only action-enabled budgets cost money. It needs the `Project` cost allocation tag active (Phase 0). The account already has one budget, "New Resource Breakdown Budget" ($45/month).

The 4 production alarms plus killfood's 2 use 6 of the 10 free CloudWatch alarms. SNS and the Slack integration add no cost at this volume.

### Where Alerts Go

Alerts go to Slack in `#portfolio-logs` (`C0B27NY5NP2`) in the "KillFood Dev" workspace (decided 2026-10-04). It's the same path killfood's backup alarms use to reach `#deployment-announce`:

```
CloudWatch alarms ─┐
                   ├─► SNS portfolio-alerts ─► Amazon Q Developer in chat applications ─► Slack #portfolio-logs
AWS Budget ────────┘                           (formerly AWS Chatbot)
```

- ✅ **Built and tested 2026-10-04.** `global/monitoring.tf` created the `portfolio-alerts` topic and the `portfolio-alerts` Slack channel configuration. A test message published to the topic arrived in `#portfolio-logs`.
- **One configuration per channel.** AWS allows only one Slack channel configuration per channel per account. The old `portfolio-deploy-announce` configuration (from [the orphaned state](#an-orphaned-terraform-state)) already held `#portfolio-logs`, so it was deleted on 2026-10-04. Its settings, in case you ever want it back:
  - topic `CodeStarNotifications-portfolio-deploy-announce-e00874e921d8686028b7b6b3f77a0fdaed316dd3`
  - role `service-role/portfolio-chatbot-role`
  - guardrail `AdministratorAccess`
  - logging `NONE`
  - Its pipeline is disabled, so nothing was posting through it.
- **killfood's wiring is untouched.** Its `deploy-announce` configuration still posts deploys and backup alarms to `#deployment-announce`.
- **Notifications-only permissions.** The configuration's role (`portfolio-chatbot-alerts`) can only read CloudWatch, which lets alarm posts include their graphs. The channel guardrail is that same read-only policy, so nobody can run AWS commands from Slack through it.
- **Topic access policy.** It lets `cloudwatch.amazonaws.com` and `budgets.amazonaws.com` publish, limited to this account. The topic stays unencrypted, like killfood's, because an encrypted topic would need extra key permissions for both services.
- **Slack IDs** are in `global/terraform.tfvars`: `slack_team_id = "T8RTXLMSA"` and `slack_channel_id = "C0B27NY5NP2"`.
- **Still email:** only the CloudFront plan's usage emails, which AWS sends to the account's email address.

### If an Alert Fires

1. Check CloudFront's usage and security dashboards and the API's metrics to tell real traffic from a bot.
2. Tighten the limits: lower the WAF per-IP limit or block offending IPs or countries in WAF, or lower the API throttles in Terraform.
3. If needed, use the kill switch for origin cost:

   ```bash
   AWS_PROFILE=killfood aws lambda put-function-concurrency \
     --function-name portfolio-api-prod --reserved-concurrent-executions 0
   ```

   Pages keep loading from CloudFront, but experience data and the contact form stop. Undo it by setting the value back to 5, or by re-applying Terraform.
4. If it's real growth, upgrade the CloudFront plan to Pro ($15/month).

## Costs

### Killfood Today

Cost Explorer, `killfood-ro`, 2026-10-03:

| Service | Sep 2026 | What it is |
|---------|---------:|------------|
| EC2 compute | $16.56 | t2.small on demand, 24/7 |
| EBS snapshots | $3.85 | AWS Backup daily snapshots |
| Public IPv4 (VPC) | $3.60 | Elastic IP |
| EBS volume | $3.00 | 30 GB gp2 |
| Route 53 | $1.53 | 3 hosted zones (including `jakekillpack.com`) + queries |
| ECR | $1.17 | All 7 repos, including the old `portfolio` images |
| S3, Inspector, Lambda, CloudWatch, SNS, CodePipeline, DynamoDB | $0.08 | |
| **Total** | **$29.80** | Apr–Sep average $30.53, excluding a $30 registrar charge in April |

About $27 of the $30 is always-on capacity (instance, disk, snapshots, IP). It costs the same at zero traffic and is capped at one t2.small at peak.

### Portfolio After Migration (QA and Production)

Pay-as-you-go unit prices come from the AWS Pricing API (us-west-2). Flat-rate plan terms come from the CloudFront docs (checked 2026-10-04). The account predates July 2025, so it keeps the legacy always-free tiers; `freetier get-free-tier-usage` confirms the Lambda and CloudWatch allowances.

Assumptions:

- 2,000 page views/month typical; 100,000/month as a spike (for example, a post that takes off).
- About 3 MB and 20 CloudFront requests per uncached page view, before WebP.
- One API call per page view, with no CDN caching (worst case).
- Lambda at 512 MB and 300 ms average.
- 10 contact emails/month typical, 100 at the spike.
- QA traffic is your own testing.

| Item | Pricing | Typical (2k views) | Spike (100k views) |
|------|---------|-------------------:|-------------------:|
| CloudFront + WAF + Route 53 zone and queries (prod) | Flat-rate Free plan, no overages | $0 | $0 (absorbed as a first spike) |
| S3 storage (all buckets) | Covered by the plan's 5 GB storage credits | $0 | $0 |
| API Gateway HTTP API | $1.00/M requests | $0.002 | $0.10 |
| Lambda | Free up to 1M requests + 400k GB-s | $0 | $0 |
| DynamoDB on-demand | $0.125/M reads; 25 GB free | <$0.01 | $0.01 |
| CloudWatch alarms | 4 of the 10 free (with killfood's 2) | $0 | $0 |
| SNS, Slack integration (Amazon Q Developer in chat applications), AWS Budgets, SSM Parameter Store, ACM | Free at this use | $0 | $0 |
| Mailgun (outside AWS) | Shared account; at most 25/day per environment | $0 | $0 |
| QA environment | Same stack, your own traffic only; inside free tiers | ~$0 | ~$0 |
| **Total** | | **~$0.01/month** | **~$0.12/month** |

The zone counts toward the plan's Free-tier limit of 50 DNS records. It will have about 15: today's 6, the production and QA alias records, and the certificate validation records.

### Side by Side

| | Killfood today | Portfolio after migration |
|---|---|---|
| Typical month | $30.53 | ~$0.01 |
| Cost at zero traffic | ~$29 | $0 (the zone fee moves into the flat-rate plan) |
| Domain | $16/year | $16/year (already being paid) |
| At 50× traffic | Same bill, until the t2.small runs out | ~$0.12; past the CloudFront allowance it costs nothing more, just slower delivery |
| Worst case under abuse | One instance's capacity | About $21 for a full month of saturated API throttles; alarms fire on day one |

**Net change to the AWS bill:** about −$0.69/month. The zone's $0.50 moves into the free plan, deleting the old `portfolio` ECR images saves up to $0.20, and the site's usage adds about $0.01. The domain renewal is unchanged.

### The Database

The DynamoDB row above is the entire database cost for both environments: under a cent a month typical, about a cent at the spike. Five items (~5 KB) per table sit far inside the 25 GB free storage, and each page view reads about one request unit.

It doesn't lower today's bill, though. The portfolio's database never had its own line item: it was a schema in killfood's MySQL container, riding on the t2.small that killfood pays for anyway. Today it's offline. Moving killfood's own MySQL off EC2 would be a separate project and isn't in this plan.

Where DynamoDB pays off is against the other ways to give the portfolio a database of its own (Pricing API, us-west-2):

| Option | Monthly |
|--------|--------:|
| DynamoDB on-demand (this plan) | <$0.01 |
| RDS MySQL `db.t4g.micro`, Single-AZ, 20 GB gp3 | ~$14 ($11.68 instance + $2.30 storage), per environment |
| Back inside killfood's MySQL container | $0 extra, but the portfolio is tied to killfood's instance, deploys, and downtime again |

### Tracking Portfolio Costs Separately

Every resource the Terraform creates is tagged `Project=portfolio`, plus `ManagedBy`, `Purpose`, and `Environment` (`qa` or `production`), through the provider's `default_tags`. A rendered plan confirmed the tags on 2026-10-04. killfood's resources use `Project=killfood`.

1. **Activate the tags.** `Project` and `Environment` are known tag keys in the account but are **Inactive** as cost allocation tags (checked 2026-10-04), so Cost Explorer can't group by them yet for either project. Activate both in the Billing console under Cost allocation tags. Activation is free and takes up to 24 hours. It needs the admin profile and hasn't been done yet.
2. **Optionally backfill.** The same page's **Backfill tags** applies the tags to up to 12 earlier months. AWS lists no charge for it, and it accepts one request per 24 hours.
3. **Filter.** Filter Cost Explorer to `Project = portfolio`, and group by `Environment` to split QA from production. Costs on untagged resources show as "No tag key: Project".

Gaps to know about:

- The old `portfolio` ECR repo is already tagged `Project=portfolio`, so about $0.20/month of old images shows under the portfolio until the repo is deleted (Phase 0).
- killfood's EC2 instance and EBS volume have no `Project` tag, because they're outside Terraform. So about $20/month of killfood will show as untagged. Tag the volume, and tag the instance through its launch template so a replacement inherits the tag.
- Anything created outside Terraform needs tags by hand, such as the `--tags` in [Adding a Secret](#adding-a-secret).
- Some charges never carry tags, such as tax.

## Steps

Each phase builds QA first, checks it, then applies the same change to production.

### Phase 0: Safety and Foundations (No Visible Change)

1. **Shut off the old CI.**
   - ✅ 2026-10-04: deleted `.circleci/config.yml` and `deploy/imagedefinitions.json` on the working branch.
   - ✅ 2026-10-04: disabled the old pipeline's EventBridge rule and Deploy transition, then deleted them in step 2 (see [the hazard status](#hazard-the-old-ci-can-still-touch-killfood-production)).
   - Deferred until Phase 5 works: in CircleCI, stop building `shazaman23/portfolio` and delete its environment variables (`ECR_*`, `DH_*`, `prod_*`, `MAILGUN_*`).
   - Leave the `circleci-deploy` IAM user alone; killfood uses it.
2. ✅ 2026-10-04: **Deleted the old pipeline and its leftovers**, after confirming none of it touches killfood:
   - **The checks:**
     - killfood's Terraform state (84 addresses) holds nothing portfolio-related.
     - Each IAM policy was attached only to its own portfolio role.
     - killfood's pipeline uses a different role, connection, and Slack config.
     - No subscriptions, filters, or other consumers existed.
   - **Deleted:**
     - `Portfolio-Deploy-Pipeline` and its EventBridge rule
     - the `Portfolio-Deploy-Notification` rule and its SNS topic
     - the `portfolio-deploy-announce` Slack config (deleted first, to free `#portfolio-logs`)
     - roles `AWSCodePipelineServiceRole-us-west-2-Portfolio-Deploy-Pipeline`, `cwe-role-us-west-2-Portfolio-Deploy-Pipeline`, and `portfolio-chatbot-role`, with their three policies
     - the "Portfolio Connection" GitHub connection
     - the empty `/ecs/killfood/portfolio` log group
   - **Afterward:**
     - killfood's service was still ACTIVE, 1/1 on revision 401.
     - Its pipeline stages were still enabled.
     - Its notification rule, connection, and topics were untouched.
   - **Kept: the `portfolio` ECR repo.** killfood's task definition revisions **363 and older** (registered 2026-04-24 or earlier) include `portfolio-app` as an essential container that pulls from this repo. Deleting it would break a rollback of killfood to April or earlier. Revisions 364–401 don't use it. Your call: deleting it saves up to $0.20/month, and the old images also carry the 2022 production `.env`.
   - The old pipeline's artifacts in killfood's `killfood-deploy` bucket were left alone.
   - ✅ **Archived the orphaned state** and imported the zone and its four Mailgun records into `global/` (see [An Orphaned Terraform State](#an-orphaned-terraform-state)). The plan showed the records unchanged and only two new tags on the zone, and a re-plan shows no changes. Public DNS still returns the same Mailgun records.
3. ✅ 2026-10-04: **Restructured `terraform/`** into `global/`, `modules/site/`, and `envs/{qa,prod}`. Nothing had been applied, so there was no state to move.
   - Role names gain the environment suffix.
   - GitHub trust moves to the `qa` and `production` GitHub Environments.
   - Secret paths gain the environment segment.
   - Add `global/monitoring.tf` (SNS topic, Slack channel configuration, cost budget).
4. ✅ 2026-10-04: **Activated the `Project` and `Environment` cost allocation tags.** Cost Explorer can take up to 24 hours to show them. A backfill is optional and hasn't been requested.
5. **Apply.**
   - ✅ 2026-10-04: applied `global`, creating 8 resources: the OIDC provider, the Slack alerts role and policy, the SNS topic and policy, the Slack configuration, and the budget. The test message reached `#portfolio-logs`. The zone import waits for step 2.
   - ✅ 2026-10-04: applied `envs/qa`, then `envs/prod`, creating 6 resources each: the three roles and their policies.
   - ✅ 2026-10-04: you added the two `portfolio-assets-*` CLI profiles; both assume their roles.
6. ✅ 2026-10-04: **GitHub Environments created** (verified through GitHub's API): `production` allows deployments only from `master`; `qa` has no branch restriction.
7. ✅ 2026-10-04: **Set up the branch.** Created `rebuild` off the Phase 0 branch. Git doesn't track empty folders, so each of `web/`, `api/`, `content/`, `scripts/`, `docker/`, and the gitignored `assets/` is added in the phase that first fills it (`assets/` in Phase 1). Laravel stays at the root as the parity reference until cutover.
8. **Clean up the old database** (you'll do this when ready). Check killfood's MySQL for the old portfolio database and user (they shared the container). Export them for reference, then drop both.

### Phase 1: Assets to S3

1. ✅ 2026-10-04: **Added the assets bucket** to `modules/site/s3.tf`, and applied QA, then production (6 resources each).
   - The assets-publisher policy now references the bucket resource instead of a name-built ARN. The policy content didn't change.
   - Checked with `killfood-ro`: all four public-access blocks, `BucketOwnerEnforced`, SSE-S3, versioning, the lifecycle rule, and the `Project` and `Environment` tags. There's no bucket policy until Phase 2 adds the OAC one. Re-plans show no changes.
2. ✅ 2026-10-04: **Converted and uploaded the media.**
   - Converted the 14 files into `assets/` using the new layout. `family-cabin` and `studying` were scaled from 2048 to 1200 px wide.
   - Pushed them to QA, then to production.
   - The conversion and sync scripts then became the general-purpose `to-webp` and `assets-tool` in `~/bin`. `to-webp` reproduces all 14 files byte for byte, and `assets-tool` reports both buckets in sync.
   - Every object has `Content-Type: image/webp`, `Cache-Control: public, max-age=86400`, SSE, and a version ID.
   - A second push uploads nothing.
   - `pull qa` into an empty folder restored all 14 files byte for byte.
   - The QA publisher role is denied listing the production bucket.
3. ✅ 2026-10-04: **Verified with `killfood-ro`:** `aws s3 ls --recursive` shows 14 objects (961.9 KiB) in each of `jakekillpack-assets-qa` and `jakekillpack-assets-prod`.

### Phase 2: Certificate, CDN, DNS

1. Add the certificate, distribution, site bucket, CloudFront Function, response headers policy, and DNS records to the module.
2. Apply QA (`qa.jakekillpack.com`, `noindex`). Check it with a placeholder `index.html`:
   - `/` and `/experience/1` return the placeholder, and `/assets/img/about/popcorn.webp` returns the image.
   - Every response carries `X-Robots-Tag: noindex`, and `/robots.txt` disallows all crawling.
   - Direct S3 URLs return 403.
3. Try subscribing the QA distribution to a second Free plan. If AWS won't accept a second plan on the same domain, QA stays on pay-as-you-go.
4. Apply production with its alias records off; the site doesn't go live until Phase 6.
5. Subscribe the production distribution to the flat-rate Free plan, attach the Route 53 zone to the plan, and set the WAF per-IP limit to 300 requests per 5 minutes.
6. Narrow each environment's CloudFront IAM statements from `distribution/*` to its own distribution's ARN.

### Phase 3: Local Stack and API

1. **Local stack:** create a LocalStack account (free Hobby plan) and put the auth token in `.env`. Add the Compose services and the init hook from [Local Stack](#local-stack).
2. **Scaffold `api/` (NestJS):**
   - `ExperiencesModule` and `ContactModule`.
   - class-validator rules that mirror the Laravel validation, plus a honeypot field.
   - The daily send cap: a counter item in the environment's table, incremented atomically with `UpdateItem`.
   - A mail adapter: Mailgun's HTTP API (`api.mailgun.net`, domain `jakekillpack.com`) in Lambda, SMTP to Mailhog locally. From is always `portfolio@jakekillpack.com` and Reply-To is the visitor, carrying over the 2026-10-04 fix. QA prefixes the subject with `[QA]`.
   - A secrets helper using Powertools' Parameters utility.
   - `main.ts` (local) and `lambda.ts` (handler).
3. **Content:** create `content/experiences.json` from `database/seeders/WorkExperienceSeeder.php`. Replace the hardcoded `brand == "Benegov"` check in the Blade view with data: a `null` `url` shows "(site no longer running)".
4. **Tests:**
   - Jest unit tests, including the Lambda wrapper and the send cap.
   - e2e tests (supertest) against LocalStack.
5. **Terraform:** add the table, the function (reserved concurrency 5), and the HTTP API (stage throttle 5/s, burst 10; contact route 1/s, burst 2). Apply QA, then production.
6. **Mailgun keys:**
   - Create two domain sending keys scoped to `jakekillpack.com`, one per environment.
   - Store them with the [add-a-secret command](#adding-a-secret) as `/portfolio/qa/mailgun/api-key` and `/portfolio/prod/mailgun/api-key`.
   - Don't revoke the old account key yet; see Resolved, Mailgun.
7. **CloudFront `/api/*` behavior:**
   - origin request policy `AllViewerExceptHostHeader`
   - a cache policy with a 300-second TTL that ignores query strings (only GET and HEAD are cached, so POSTs pass through)
8. **Contact flow, end to end:** on QA, check that the email arrives with `[QA]` in the subject, lands in the inbox rather than spam, and shows `dkim=pass` for `jakekillpack.com` (Mailgun signs with the existing `krs._domainkey` record). Check that the 26th send of the day returns 429. Then repeat on production.

### Phase 4: React Frontend

1. Scaffold `web/` (Vite, React, TypeScript, React Router). Set `build.assetsDir: 'static'` so built JS and CSS don't land under `/assets/`, which CloudFront routes to the media bucket. Port the SCSS partials, Bootstrap 4.6, the Flaticon font, and Font Awesome 5. Drop the duplicate Bootstrap 4.0.0-beta.2 CDN stylesheet; the parity check in step 5 will show whether any of its rules were visible.
2. Port the behaviors from the Vue instance in `resources/js/app.js`:
   - About Me strips (one open at a time)
   - screenshot rotation every 5 seconds
   - hover selects a screenshot and pauses rotation for 10 seconds
   - resize-driven monitor size
   - the flash alert that hides after 5 seconds
3. Lazy-load the About Me photos, so they download only when a strip opens.
4. Contact form:
   - inline field errors from the API's 400 response
   - inputs kept on error (what `old()` did)
   - a success flash
   - a friendly message on 429 that points to `contact@jakekillpack.com`
5. Parity check: take Playwright screenshots of the Laravel site (local) and the new site on QA at 1280 px and 375 px, and compare them side by side.

### Phase 5: CI/CD and Monitoring

1. Add the workflows under `.github/workflows/`:
   - `ci.yml`: on pull requests and pushes. Lint, test, and build, with no AWS access.
   - `deploy.yml`: a reusable workflow (`workflow_call`) with an `environment` input. It runs in that GitHub Environment and:
     1. tests and builds
     2. assumes `portfolio-github-deploy-<env>`
     3. syncs the site: hashed files `immutable`, `index.html` `no-cache`
     4. updates the Lambda code, then waits with `aws lambda wait function-updated`
     5. upserts `content/experiences.json` into that environment's table
     6. invalidates `/index.html` and `/api/*`
   - `deploy-qa.yml`: `workflow_dispatch` only. Pick any branch in the Actions UI, and it runs `deploy.yml` with `qa`.
   - `deploy-prod.yml`: on push to `master`. Runs `deploy.yml` with `production`.
2. Add `modules/site/alarms.tf` (enabled for production) wired to `portfolio-alerts`. Prove the Slack path by forcing one alarm into ALARM with `aws cloudwatch set-alarm-state`.
3. Once a production deploy has worked through GitHub Actions, finish the deferred CircleCI cleanup from Phase 0, step 1.

### Phase 6: Cutover and Cleanup

1. Turn on production's alias records and apply. There's no A record today, so nothing is being replaced.
2. Check every page, the contact form, and the old `/experience/{id}` URLs; run Lighthouse.
3. Remove the Laravel app, `docker-config/`, `public/` media, `composer.*`, and `webpack.mix.js`. (`deploy/` and `.circleci/` were already removed on 2026-10-04.) Replace the stock Laravel `README.md`, and add a 3.0.0 entry to `docs/RELEASE.md`.
4. Killfood follow-ups:
   - `docs/INFRASTRUCTURE.md` still lists `portfolio-app`, and `docs/MAINTENANCE.md` still lists the `/ecs/killfood/portfolio` log group; remove both.
   - Remove the `personal-ecr-access` user from killfood's `iam.tf`, unless another project still pushes with it.
   - Give killfood its own Mailgun domain sending key, then revoke the old account key that was baked into the 2022 portfolio images.
5. Update the `dev-environment` skill's portfolio row: Node stack, LocalStack, new services and ports.

### After Cutover (Separate Projects)

- Restyle with Tailwind.
- Refresh the experiences and other content.

## Open Questions

None right now.

### Resolved

- **QA access** (2026-10-04): public, with an `X-Robots-Tag: noindex` header and a `robots.txt` that disallows all crawling. No password.
- **Alerts go to Slack** (2026-10-04): `#portfolio-logs`, built and tested the same day. See [Where Alerts Go](#where-alerts-go).
- **The old CI** (2026-10-04): neutralized. The config was removed on the working branch, and the old pipeline's trigger and Deploy stage are disabled. The CircleCI project and its variables are cleared in Phase 5.
- **DynamoDB** for the experiences (2026-10-04).
- **Parity first** (2026-10-04). The Tailwind restyle and the content refresh come after cutover.
- **Mailgun** is one account shared by killfood, the portfolio, and formerly diamondsdesk (2026-10-04). As a result:
  - The key baked into the 2022 portfolio images is most likely that account's API key, which killfood probably still uses. Revoke it only after killfood moves to its own domain sending key (Phase 6).
  - The portfolio uses domain sending keys scoped to `jakekillpack.com`, one per environment, so nothing else depends on them.
  - The send quota is shared across domains. The daily send cap keeps the portfolio from using it up.
  - If diamondsdesk is gone for good, its domain can be removed from Mailgun.
- **`contact@jakekillpack.com` still works through Mailgun** (confirmed 2026-10-03). Its MX, SPF, DKIM (`krs._domainkey`), and `email.` CNAME records stay exactly as they are. Phase 0 imports them into Terraform, and that plan must show no changes to them.
- **Mailgun sends the contact form too, with its keys in SSM Parameter Store** (decided 2026-10-04 over SES). See Decisions, the IAM section, and Phase 3, step 6.

## Changes to the Current Site

To get it running locally (2026-10-03):

- `docker-config/Dockerfile`: the base image changed from `php:8.1.3-fpm` to `php:8.1-fpm-bookworm`. The old base is Debian 11, whose security repo now returns 404 for the package versions it lists, so `apt install` failed. PHP stays on 8.1.
- `database/seeders/WorkExperienceSeeder.php`: restored the five work experiences from git history (lost in `6928a6c`), and `DatabaseSeeder` now calls it.
- `docker-compose.yml` (gitignored, local only): added a `mailhog` service. `.env` sends mail to `mailhog:1025`, so without it the contact form returned 500.

The From fix (2026-10-04):

- `app/Mail/ViewerContact.php`: From is now `MAIL_FROM_ADDRESS` / `MAIL_FROM_NAME` (`Jake's Portfolio <portfolio@jakekillpack.com>`), and the visitor's address moved to Reply-To. `tests/Feature/ContactFormTest.php` covers it.
- `.env.example` and the local `.env`: `MAIL_FROM_ADDRESS` and `MAIL_FROM_NAME` are set; the address was `null` before.
- Known, not fixed: `.env.pipelines` sets `MAIL_DRIVER=mailgun`, but Laravel 8 reads `MAIL_MAILER`. Since the Laravel 8 upgrade, production would have fallen back to SMTP with no credentials, so the live contact form likely wasn't sending. This only matters if the legacy site is redeployed.

Running it:

```bash
docker compose up -d
docker compose exec -T app php artisan migrate --seed   # fresh database only
```

| What | URL |
|------|-----|
| Site | http://portfolio.test |
| phpMyAdmin | http://localhost:8081 |
| Mailhog | http://localhost:8025 |

The legacy stack publishes host port 80 and killfood uses 8089, so they don't collide, but run one at a time.
