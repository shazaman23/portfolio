# Portfolio Frontend

The React single-page app for jakekillpack.com, built with Vite and served from S3 through CloudFront. It started as a straight port of the Laravel site and was restyled with Tailwind in 3.1.0. See `docs/action-plans/serverless-rebuild.md` for the architecture.

| Path | Page |
|------|------|
| `/` | Home: hero, My Work, About Me, Contact Me |
| `/experience/:id` | One experience, from `GET /api/experiences/:id` |
| anything else | 404 page, tagged `noindex` (CloudFront still answers 200) |

## Running It

Everything runs in the `web` container from `compose.yaml`. Run these from the repo root:

```bash
docker compose up -d                                 # the whole stack; the site is at http://localhost:5173
docker compose run --rm --no-deps web npm test       # unit tests, no stack needed
docker compose run --rm --no-deps web npm run lint
docker compose run --rm --no-deps web npm run build  # type-checks, then builds into web/dist
```

The dev server stands in for CloudFront. It proxies `/api/*` to the `api` container and `/assets/*` to the LocalStack assets bucket. Images come from `assets/` at the repo root (see "Asset Strategy" in the plan). `npm run preview` serves a production build with the same proxies.

## Layout

- `src/api.ts` calls the API. The contact result is one of `sent`, `invalid` (with field errors), `limited` (429), or `failed`.
- `src/experienceList.ts` loads the project list once per visit, in `Layout`, so the home page has its cards on its first render when you come back to it.
- `src/components/` holds the page sections:
  - `Layout.tsx`, `SiteNav.tsx`, `SiteFooter.tsx`: the skip link, pinned nav, and footer on every page.
  - `Hero.tsx`, `MyWork.tsx` and `WorkCard.tsx`, `AboutMe.tsx`, `ContactMe.tsx`: the home page. About Me opens one tile at a time, and a photo isn't requested until its tile first opens.
  - `ContactMe.tsx`, `FlashAlert.tsx`: field errors from a 400 (each field's accessible description), inputs kept on error, a thank-you toast that fades after 5 seconds, and a message pointing to `contact@jakekillpack.com` on a 429 or a failed send. The hidden `website` field is the honeypot.
  - `project/`: the project page's blocks. `ProjectMedia` is where new project formats plug in.
  - `Icon.tsx`: Font Awesome Free icons as inline SVG.
- `src/index.css` is the stylesheet: Tailwind, plus the brand colors as theme tokens. Raleway comes from `@fontsource-variable/raleway`.
- `src/assets/` holds the favicon. Photos and screenshots aren't here; they live in the assets buckets.

## Building and Deploying

`npm run build` writes `web/dist/`: `index.html`, `robots.txt`, and fingerprinted files under `static/`. They go under `static/` rather than Vite's default `assets/`, because CloudFront routes `/assets/*` to the media bucket. The build keeps license comments (`/*! ... */`, `@license`), which Vite's minifier would otherwise drop, so the bundle carries the Font Awesome and React credits.

GitHub Actions deploys: **Deploy QA** (run it from the Actions tab, any branch) and **Deploy Production** (every push to `master`), both through `.github/workflows/deploy.yml`. To deploy by hand instead, build in the container, then upload with the host's AWS CLI. Upload `static/` before `index.html`, so the live page never points at files that aren't there yet:

```bash
# from the repo root; ENV is qa or prod
docker compose run --rm --no-deps web npm run build
AWS_PROFILE=killfood aws s3 sync web/dist/static s3://jakekillpack-site-$ENV/static --cache-control 'public, max-age=31536000, immutable'
AWS_PROFILE=killfood aws s3 cp web/dist/robots.txt s3://jakekillpack-site-$ENV/robots.txt --cache-control 'public, max-age=3600'
AWS_PROFILE=killfood aws s3 cp web/dist/index.html s3://jakekillpack-site-$ENV/index.html --cache-control 'no-cache'
AWS_PROFILE=killfood aws cloudfront create-invalidation --distribution-id <distribution_id output> --paths '/index.html'
```

Every page path is served from `/index.html` by CloudFront's viewer-request function, so invalidating that one path covers them all. On QA, the function answers `/robots.txt` itself, so the uploaded copy is only used in production.
