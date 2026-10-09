# Rebuild Cleanup

Everything left after the serverless rebuild went live on 2026-10-09, in one place. Nothing here blocks the site. Items are grouped roughly by priority, and each links to the section of [serverless-rebuild.md](serverless-rebuild.md) with the full background.

Written 2026-10-09. Check items off as you go.

## ~~Finish the Rebuild~~

- [x] ~~**Set production's `SITE_URL` to `https://jakekillpack.com`** (GitHub → Settings → Environments → `production`). It still points at the CloudFront domain, which only the deploy's smoke test uses, so nothing breaks in the meantime. ([Phase 6, step 1](serverless-rebuild.md#phase-6-cutover-and-cleanup))~~
- [x] ~~**Shut down the old CircleCI project.** In CircleCI, stop building `shazaman23/portfolio` and delete its environment variables (`ECR_*`, `DH_*`, `prod_*`, `MAILGUN_*`).~~
  - ~~**The priority:** those variables hold credentials that can push an image killfood's production uses, plus old keys and secrets.~~
  - ~~**A side effect:** it also stops the failing CircleCI check on every push.~~
  - ~~**Leave alone:** the `circleci-deploy` IAM user, which killfood still uses.~~
  - ~~([Phase 5, step 4](serverless-rebuild.md#phase-5-cicd-and-monitoring); [Phase 0, step 1](serverless-rebuild.md#phase-0-safety-and-foundations-no-visible-change))~~
- [x] ~~**Remove the "AWS Connector for GitHub" app** from your GitHub account (Settings → Applications), if nothing else uses it. The old pipeline's connection that used it was deleted on 2026-10-04. ([Where It Ran](serverless-rebuild.md#where-it-ran))~~

## After Real Traffic Arrives

- [ ] **Switch production's WAF managed rule sets from Count to Block.** Give real visitors a week or two first.
  - **Before switching:** review sampled requests and CloudWatch metrics for matches on legitimate contact-form posts. As of 2026-10-09 there were none, but that was only test traffic.
  - **False positives to look for:** `CommonRuleSet` blocks request bodies over 8 KB and bodies that look like cross-site scripting. A message with pasted HTML or code, or 5,000 characters of non-ASCII text, could be blocked. The form would show its "couldn't be sent" message pointing to `contact@jakekillpack.com`.
  - **Where to switch:** the CloudFront console (**Security** tab → **Enable blocking**), or the WAF console (turn off each rule set's "Override rule group action to Count").
  - ([Phase 3, step 9](serverless-rebuild.md#phase-3-local-stack-and-api))
- [ ] **Tune the WAF per-IP rate limit.** It starts at 300 requests per 5 minutes per IP. A full uncached page view is about 20 requests, so adjust once real traffic is visible. ([At the Edge](serverless-rebuild.md#at-the-edge-cloudfront-flat-rate-free-plan))

## Clean Up This Machine

The old Laravel containers and files are gone. What's left is disk space:

- [x] ~~**Remove the old Laravel stack's volumes.** These are `portfolio_db_data`, `portfolio_dbdata`, `portfolio_node_modules`, and `portfolio_vendor`.~~
  - ~~**Export first if you want it:** the database volumes hold the old local `new_portfolio` MySQL data. The same content lives in `content/experiences.json`.~~
  - ~~**Then:** `docker volume rm portfolio_db_data portfolio_dbdata portfolio_node_modules portfolio_vendor`~~
- [x] ~~**Remove the old images,** about 2.4 GB: `docker image rm portfolio-app portfolio-pma portfolio-web`~~
- [x] ~~**Remove `portfolio.test` from `/etc/hosts`.** The new stack runs at `http://localhost:5173`.~~
- [x] ~~**Delete the root `node_modules/`.** It holds only a stray Vite cache, and the apps keep their own `node_modules` in `api/` and `web/`.~~
- [x] ~~**Optional: rename the Compose project.** Change `name: portfolio-rebuild` to `name: portfolio` in `compose.yaml`, now that the old `portfolio` project is gone.~~
  - ~~Run `docker compose -p portfolio-rebuild down` first, so the old containers don't linger under the old name.~~
  - ~~Then update the project name in the `dev-environment` skill.~~

## Killfood Follow-ups

Deferred on 2026-10-09. These change killfood, so do them in that repo with its own checks. ([Phase 6, step 4](serverless-rebuild.md#phase-6-cutover-and-cleanup))

- [ ] **Update killfood's docs.** Remove `portfolio-app` from `docs/INFRASTRUCTURE.md` and the `/ecs/killfood/portfolio` log group from `docs/MAINTENANCE.md`.
- [ ] **Remove the `personal-ecr-access` IAM user** from killfood's `iam.tf`, unless another project still pushes with it. Its known job was pushing portfolio images, and the `portfolio` ECR repo was deleted on 2026-10-09.
  - Then remove the `personal` profile from `~/.aws/config`.
  - Also remove its row from the `using-aws-cli` skill's account table.
- [ ] **Give killfood its own Mailgun domain sending key, then revoke the old account key.** killfood may still use the old key, so the order matters: revoke it only after killfood has moved. ([Resolved](serverless-rebuild.md#resolved))
- [ ] **Drop the old portfolio database and user from killfood's MySQL.** They shared that container. Export them for reference first. ([Phase 0, step 8](serverless-rebuild.md#phase-0-safety-and-foundations-no-visible-change))
- [ ] **Optional: let `killfood-ro` list CloudFront pricing plans.** Add `pricingplanmanager:Get*` and `pricingplanmanager:List*` to it in killfood's Terraform. AWS's `ReadOnlyAccess` doesn't cover that service yet. ([IAM Roles](serverless-rebuild.md#iam-roles))
- [ ] **Optional: switch the Terraform state locking in both repos together.** Terraform 1.16 deprecates the S3 backend's `dynamodb_table` argument in favor of `use_lockfile = true`. ([Conventions Kept from Killfood](serverless-rebuild.md#conventions-kept-from-killfood))

## Email (Optional)

- [ ] **Tighten DMARC.** Change `_dmarc.jakekillpack.com` (in `terraform/global/dns.tf`) from `p=none` to `p=quarantine` once mail is known to align. Add `rua=mailto:...` first to get daily aggregate reports to check that against. ([Phase 3, step 8](serverless-rebuild.md#phase-3-local-stack-and-api))
- [ ] **Rotate the DKIM key to 2048-bit.** The domain's key is 1024-bit. Rotate it in Mailgun, then update the `krs._domainkey` record in `terraform/global/dns.tf`.
- [ ] **Remove the diamondsdesk domain from Mailgun** if that project is gone for good. ([Resolved](serverless-rebuild.md#resolved))

## ~~Deploy Hardening (Optional)~~

~~None of these are needed: today only you can push, and production deploys only from `master`.~~

- [x] ~~**Require a reviewer on the `production` environment.** Each production deploy then waits for your click after its build passes. The cost is that merges no longer deploy on their own.~~
- [x] ~~**Add a ruleset on `master`** that requires pull requests and passing CI. It mostly guards against accidental pushes.~~
- [x] ~~**Narrow the production role's OIDC trust.**~~
  ~~1. Customize the repo's OIDC subject template to include `ref` (or `job_workflow_ref`).~~
  ~~2. Require `master` (or `deploy.yml` on `master`) in the production role's trust policy, in `terraform/modules/site/iam.tf`.~~
  ~~- ([IAM Roles](serverless-rebuild.md#iam-roles))~~

## Small Code Cleanups (Optional)

- [x] ~~**Drop `vite-tsconfig-paths` from the API.** Its Vitest run warns that Vite now resolves tsconfig paths itself. Set `resolve.tsconfigPaths: true` in `api/vitest.config.ts` and `api/vitest.config.e2e.ts`, then remove the plugin.~~
- [x] ~~**Optional: backfill the `Project` and `Environment` cost tags** for up to 12 earlier months (Billing → Cost allocation tags → **Backfill tags**). ([Tracking Portfolio Costs Separately](serverless-rebuild.md#tracking-portfolio-costs-separately))~~

## Restyle and Content (Separate Projects)

Planned after the cutover, not part of the rebuild. ([After Cutover](serverless-rebuild.md#after-cutover-separate-projects))

- [ ] **Restyle with Tailwind.** Fold in what Lighthouse found on 2026-10-09; all of it was carried over from the Laravel design:
  - **Low contrast:** white and light-blue (`#61cdf5`) text on light backgrounds, including the Back link, the experience titles, and the footer links.
  - **Heading order:** headings skip levels, for example `h2` straight to `h4`.
  - **Links:** links in body text are told apart by color alone.
  - **No meta description:** this costs some SEO score.
  - **Mouse only:** the About Me strips open only with a mouse; they can't be reached with the keyboard.
- [ ] **Refresh the experiences and other content.** That includes the page title, which is still `Portfolio`, the old Laravel `APP_NAME`. It's one line in `web/index.html`.
