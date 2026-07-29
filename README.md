# Treat YourSelf Studios

Marketing site for [Treat YourSelf Studios](https://treatyourselfstudios.net), an appointment-only esthetics studio in Seattle's Columbia City neighborhood — custom facials, waxing, lash & brow services, and body treatments.

The site is a static [Astro](https://astro.build) build deployed to GitHub Pages. All content (services, prices, deals, FAQs, team, testimonials) lives in [Sanity](https://www.sanity.io) and is owner-editable through Sanity Studio; booking, gift cards, and retail all happen on Square. Publishing in Studio triggers a webhook that rebuilds and redeploys the site automatically.

## Setup

```sh
git clone <this repo> && cd treatyourselfstudios
make install
cp .env.example .env   # fill in values — tokens live at sanity.io/manage → API
make dev
```

Required environment variables (no fallbacks — the build fails fast if any is missing):

| Variable | Purpose |
|---|---|
| `SANITY_PROJECT_ID` | Sanity project (`xbsj15ow`) |
| `SANITY_DATASET` | Dataset name (`production`) |
| `SANITY_API_TOKEN` | Read token for builds; read+write to run `make seed` |
| `PUBLIC_FORMSPREE_ENDPOINT` | Contact form POST target ([formspree.io](https://formspree.io)) |

## Commands

| Command | What it does |
|---|---|
| `make install` | Install dependencies for root and `studio/` |
| `make dev` | Start the Astro dev server at localhost:4321 |
| `make build` | Build the production site to `./dist/` |
| `make preview` | Preview the production build locally |
| `make check` | Run everything CI runs: types, lint, build |
| `make lint` | Run ESLint |
| `make format` | Auto-fix lint and formatting issues |
| `make studio` | Start the Sanity Studio dev server at localhost:3333 |
| `make deploy-studio` | Deploy Sanity Studio to `*.sanity.studio` hosting |
| `make seed` | Seed/refresh Sanity content from `scripts/seed-data/` |
| `make set-logo LOGO=<file>` | Upload an image and set it as the site logo in Sanity |

## Editing content

Owners edit everything in Sanity Studio (hosted at the project's `*.sanity.studio` URL, or locally via `make studio`). Publishing a change triggers a `repository_dispatch` webhook → GitHub Actions rebuild → Pages deploy; changes go live in about two minutes.

The seed in `scripts/seed-data/` is idempotent (`createOrReplace` with deterministic IDs) — re-running `make seed` refreshes documents to the seeded baseline without duplicating anything. It will overwrite Studio edits to seeded documents, so treat it as a bootstrap/reset tool, not routine maintenance.

## Architecture

Astro fetches all content from Sanity at build time via GROQ and renders pure static HTML — zero client JavaScript except the mobile-nav toggle and contact-form enhancement. Full design rationale and content model: [`docs/superpowers/specs/2026-07-09-treatyourselfstudios-redesign-design.md`](docs/superpowers/specs/2026-07-09-treatyourselfstudios-redesign-design.md).

## Deployment

GitHub Actions workflows:

| Workflow | Trigger | Purpose |
|---|---|---|
| `deploy.yml` | push to `main`, Sanity webhook, manual, weekly cron | Build and deploy to GitHub Pages |
| `ci.yml` | PRs and pushes to `main` | Types + lint, then the reusable audit |
| `audit.yml` | called by CI and nightly | Build, sitemap validation, link check, Lighthouse budgets |
| `nightly.yml` | daily cron | Runs the audit against `main` |

Repository secrets (names only): `SANITY_PROJECT_ID`, `SANITY_DATASET`, `SANITY_API_TOKEN`, `PUBLIC_FORMSPREE_ENDPOINT`.

The Sanity webhook POSTs `{"event_type": "sanity-content-update"}` to the GitHub `dispatches` API on publish, authorized by a fine-grained PAT scoped to this repository.
