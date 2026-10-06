# Portfolio API

The NestJS API behind `/api/*` on jakekillpack.com. It runs on AWS Lambda behind API Gateway and CloudFront. See `docs/action-plans/serverless-rebuild.md` for the architecture and the reasons behind it.

| Endpoint | What it does |
|----------|--------------|
| `GET /api/experiences` | All work experiences. CloudFront caches the response for 5 minutes. |
| `GET /api/experiences/:id` | One experience, or 404 |
| `POST /api/contact` | Emails the site owner. Returns 400 with Laravel-style field errors when the input is invalid, 429 once the daily cap is reached, and 502 if the email can't be sent. |

## Running It

Everything runs in the `api` container from `docker/compose.yaml`. Run these from the repo root:

```bash
docker compose -f docker/compose.yaml run --rm --no-deps api npm test     # unit tests, no AWS needed
docker compose -f docker/compose.yaml up -d                               # LocalStack, Mailhog, and the API on :3000
docker compose -f docker/compose.yaml run --rm api npm run test:e2e       # against LocalStack and Mailhog
docker compose -f docker/compose.yaml run --rm --no-deps api npm run lint
```

LocalStack needs an auth token in `docker/.env` (see `docker/.env.example`). Mailhog's inbox is at http://localhost:8026.

## Layout

- `src/main.ts` runs the app as a local HTTP server. `src/lambda.ts` is the Lambda handler. Both use `configureApp()` from `src/app.factory.ts`.
- `src/config.ts` reads every setting from environment variables. Terraform sets them in `modules/site/lambda.tf`, and Compose sets them locally.
- `src/experiences/` reads experiences from DynamoDB. `content.ts` validates `content/experiences.json`.
- `src/contact/` handles the contact form, with its honeypot and daily send cap.
- `src/mail/` sends email through Mailgun in Lambda and over SMTP to Mailhog locally.
- `src/secrets/` reads secrets from Parameter Store. It's the only place that does.
- `src/seed.ts` loads `content/experiences.json` into a table (`npm run seed`).

## Building and Deploying

`npm run bundle` compiles with `tsc`, then bundles with esbuild into `build/lambda/index.mjs` (handler `index.handler`). esbuild bundles tsc's output because it can't emit the decorator metadata Nest needs.

Until Phase 5's GitHub workflow exists, deploy by hand. Build in the container, then make the AWS calls with the host's AWS CLI, so admin credentials never enter the container:

```bash
# from the repo root; ENV is qa or prod
docker compose -f docker/compose.yaml run --rm --no-deps -e TABLE_NAME=portfolio-experiences-$ENV api \
  sh -c 'npm run bundle && node dist/seed.js --request-file build/seed-request.json'
(cd api/build/lambda && zip -q -9 ../lambda.zip index.mjs index.mjs.map)
AWS_PROFILE=killfood aws lambda update-function-code --function-name portfolio-api-$ENV --zip-file fileb://api/build/lambda.zip
AWS_PROFILE=killfood aws lambda wait function-updated-v2 --function-name portfolio-api-$ENV
AWS_PROFILE=killfood aws dynamodb batch-write-item --request-items file://api/build/seed-request.json
AWS_PROFILE=killfood aws cloudfront create-invalidation --distribution-id <distribution_id output> --paths '/api/*'
```
