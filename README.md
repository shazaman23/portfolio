# jakekillpack.com

Jake Killpack's portfolio site: a React single-page app on S3 and CloudFront, with a NestJS API on AWS Lambda. Version 3.0.0 replaced the Laravel app that ran here before; it's still in the git history.

| Folder | What's in it |
|--------|--------------|
| `web/` | The React site (Vite, TypeScript, React Router). See [web/README.md](web/README.md). |
| `api/` | The NestJS API behind `/api/*`: experiences and the contact form. See [api/README.md](api/README.md). |
| `content/` | `experiences.json`, the work experiences. Each deploy loads it into DynamoDB. |
| `terraform/` | All AWS infrastructure: `global/` (DNS, GitHub OIDC, alerts), `modules/site/`, and `envs/qa` and `envs/prod`. |
| `.github/workflows/` | CI on every push, plus the QA and production deploys. |
| `docker/` | The local stack's LocalStack hook and its `.env`. |
| `docs/` | The [rebuild plan](docs/action-plans/serverless-rebuild.md), which explains the architecture and decisions, and the [release notes](docs/RELEASE.md). |

## Environments

| | URL | Deploys |
|---|---|---|
| Local | http://localhost:5173 | `docker compose up -d` |
| QA | https://qa.jakekillpack.com | **Deploy QA** in the Actions tab, from any branch |
| Production | https://jakekillpack.com | **Deploy Production**, on every push to `master` |

Photos and screenshots aren't in git. They live in the `jakekillpack-assets-<env>` buckets, served at `/assets/*` (see "Asset Strategy" in the plan).

## Running Locally

Everything runs in containers; nothing needs Node on the host.

```bash
cp docker/.env.example docker/.env   # then add a LocalStack auth token
mkdir -p assets && assets-tool pull portfolio prod   # images, optional
docker compose up -d
```

That starts:

- the site on http://localhost:5173
- the API on :3000
- LocalStack (DynamoDB, S3, SSM) on :4566
- Mailhog, which catches contact-form email, on http://localhost:8026

Test and lint commands are in each app's README.
