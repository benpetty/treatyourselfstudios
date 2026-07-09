# Treat YourSelf Studios Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild treatyourselfstudios.net as a static Astro site on GitHub Pages, with all content owner-editable in Sanity CMS and all transactions (booking, gift cards, retail) on Square.

**Architecture:** Astro fetches all content from Sanity at build time via GROQ and renders pure static HTML (zero client JS except mobile-nav toggle and contact-form feedback). A Sanity publish webhook fires `repository_dispatch` → GitHub Actions rebuild → Pages deploy. Mirrors `/Users/benny/dev/nw-local.com` throughout — consult it when a pattern is ambiguous.

**Tech Stack:** Astro 6, strict TypeScript, Sanity v5 (Studio in `studio/`), `@sanity/client`, `@astrojs/sitemap`, `astro-portabletext`, Fontsource (Fraunces + Inter), ESLint, yarn (classic), GitHub Actions, GitHub Pages, Formspree.

**Spec:** `docs/superpowers/specs/2026-07-09-treatyourselfstudios-redesign-design.md` — read it first. Two deliberate refinements from the spec's content-model table: the `package` document type is named `servicePackage` (avoids colliding with npm vocabulary), and the spec's `page` singletons became a single `homePage` singleton — the About page's short studio-story is page furniture hardcoded in `about.astro` (YAGNI; team bios and testimonials, the parts the owner actually updates, ARE in Sanity).
**Source content:** `docs/content-audit/*.txt` (scraped copy from the old site) and `docs/content-audit/images/` (the studio's 13 original photos). The Getty stock image was deliberately NOT archived — its license doesn't transfer.

**Image inventory (controller-verified by visual inspection — these assignments are authoritative):**

| File | Actual content | Use |
|---|---|---|
| `E998EFC5-…22.png` | Smiling client, face masque, pink bg (the old site's recurring brand image) | homePage heroImage |
| `49AF74D4-…34.png` | Saphiyah headshot (name embroidered on scrubs) | team-saphiyah photo |
| `FF0554C5-…26.jpg` | Professional circular headshot, woman in spa room | team-nichele photo (user-confirmed) |
| `9833A5C9-…27.jpeg` | Leg wax strip application in progress | hair-removal category heroImage |
| `blob-0009.png` | Serene facial masque application with brush | facials category heroImage |
| `B9C316FC-…B1.jpeg` | Lash extensions + brow close-up | lash-and-brow category heroImage |
| `06B33C38-…E8.jpeg` | Back masque treatment (back facial) | body-treatments category heroImage |
| `IMG_6988.jpg` | Two bowls of masque product with flowers | add-ons category heroImage |
| `IMG_4750.jpg` | Gift card box ("Give the perfect gift") | `public/images/gift-cards.jpg` for GiftCardCallout (Task 8) |
| `IMG_2745.jpeg` | Studio building exterior (Columbia City Abbey) | `public/images/studio-exterior.jpg` for LocationMap (Task 12) |
| `26ADA3C5-…01.jpeg`, `7793D2CD-…6B.jpeg`, `VineyardGrapeFacial_…jpg` | Legs w/ flower; man's brows; seasonal-facial vendor art | unassigned — owner may add via Studio |

**There is no logo image.** The old site's header was text. Seed data omits `siteSettings.logo`; Nav and Footer must render the site title as styled text (display serif) when `logo` is absent, and BaseHead's og:image renders only when a logo exists (the owner can upload one in Studio later).

## Global Constraints

- Node `>=22.13.0`; package manager is yarn classic (v1) — `yarn install --frozen-lockfile` in CI
- Latest stable majors for all new deps; no pre-releases
- Strict TypeScript (`astro/tsconfigs/strict`); **no `as` assertions** — type guards/`satisfies` only
- **No fallback values for env vars** — assert at module level, fail the build
- **No silent failures** — build-time validation throws naming the offending Sanity document
- No `eslint-disable` comments; run `make format` before every commit
- Descriptive variable names everywhere — no single-character identifiers, including callbacks
- Code style: spaces inside parens — `function name( arg )`, `if( condition )` (nw-local ESLint style)
- Canonical site URL: `https://treatyourselfstudios.net` (apex, no `www` in canonicals)
- Square URLs (from `siteSettings`, never hardcoded in components):
  - Booking: `https://squareup.com/appointments/book/E92Q1CBDSF7V8/treat-yourself-studios-seattle-wa`
  - Gift cards: `https://squareup.com/gift/1R0F1BKX04VN4/order`
  - Shop: the Square Online store URL (owner confirms; placeholder until then is the old page `https://treatyourselfstudios.net/home-care` — flagged in Task 14 launch checklist)
- Business facts (must match Google Business Profile exactly, sitewide):
  - Name: `Treat YourSelf Studios`; Phone: `(206) 717-4843`; tel link `tel:+12067174843`
  - Address: `3902 S Ferdinand St Unit 101, Seattle, WA 98118`
  - Geo: `47.5590, -122.2855` (Hillman City/Columbia City area — verify against Google Maps pin in Task 14)
  - Hours: appointment only
- Every Sanity image field requires alt text
- Voice: warm, personal, second person; correct "Estetician" → "Esthetician" everywhere

## File Structure

```
/  (repo root)
├── .github/workflows/{ci,deploy,audit,nightly}.yml
├── Makefile                     # env-loaded targets incl. `make check` (mirrors CI)
├── astro.config.mjs             # site URL + sitemap integration
├── eslint.config.mjs            # flat config, astro plugin, space-in-parens
├── lighthouserc.json            # Lighthouse CI budgets
├── package.json / tsconfig.json / .env.example / .gitignore
├── public/
│   ├── CNAME                    # treatyourselfstudios.net
│   ├── robots.txt
│   └── favicon.svg
├── scripts/
│   ├── seed.ts                  # idempotent Sanity import (createOrReplace)
│   └── seed-data/               # one TS module per document type
├── src/
│   ├── lib/sanity.ts            # client, env asserts, types, GROQ, validation
│   ├── lib/image.ts             # urlFor() builder
│   ├── layouts/Layout.astro     # BaseHead + Nav + Footer + LocalBusiness JSON-LD
│   ├── components/              # one component per file (inventory in spec)
│   ├── styles/global.css        # full theme: palette/type/spacing custom props
│   └── pages/
│       ├── index.astro, packages.astro, about.astro, faq.astro,
│       │   contact.astro, terms.astro, 404.astro
│       ├── services/index.astro
│       ├── services/[slug].astro          # category pages via getStaticPaths
│       └── legacy/[...path].astro         # meta-refresh redirects for old URLs
└── studio/                      # Sanity Studio (own package.json)
    ├── sanity.config.ts / sanity.cli.ts
    └── schemaTypes/             # one schema per document type + index.ts
```

Dependency order: Task 1 (scaffold) → 2 (studio) → 3 (schemas) → 4 (data layer) → 5–6 (seed) → 7 (design system/layout) → 8–12 (pages) → 13 (SEO extras) → 14 (CI/CD) → 15 (launch) → 16 (verification). Tasks 8–12 are parallelizable after 7.

**Worktree note:** execute in a worktree branched from `main` per `superpowers:using-git-worktrees`. Commit after every task (steps show exact commits).

**Human-in-the-loop steps** are marked `[HUMAN]` — Sanity login/project creation, Formspree account, GitHub repo settings, DNS. The executor stops and asks rather than guessing credentials. Never read `.env` contents or ask the user to paste tokens into chat — the user edits `.env` directly (file-on-disk handoff).

---

### Task 1: Scaffold Astro project + tooling

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `eslint.config.mjs`, `Makefile`, `.gitignore`, `.env.example`, `public/robots.txt`, `public/CNAME`, `src/pages/index.astro` (placeholder), `src/styles/global.css` (placeholder)

**Interfaces:**
- Produces: `make dev|build|preview|check|lint|format|install` targets; `yarn build` → `dist/`. Placeholder files are replaced in Tasks 7–8.

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "treatyourselfstudios-net",
  "type": "module",
  "version": "0.0.1",
  "private": true,
  "engines": { "node": ">=22.13.0" },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro",
    "check": "astro check",
    "lint": "eslint .",
    "format": "eslint --fix .",
    "seed": "tsx scripts/seed.ts"
  },
  "dependencies": {
    "@astrojs/sitemap": "^3.7.2",
    "@fontsource-variable/fraunces": "^5.2.0",
    "@fontsource-variable/inter": "^5.2.0",
    "@sanity/client": "^7.21.0",
    "@sanity/image-url": "^2.1.1",
    "astro": "^6.1.4",
    "astro-portabletext": "^0.13.0",
    "sharp": "^0.34.3"
  },
  "devDependencies": {
    "@astrojs/check": "^0.9.9",
    "@eslint/js": "^10.0.1",
    "eslint": "^10.2.0",
    "eslint-plugin-astro": "^1.7.0",
    "tsx": "^4.20.0",
    "typescript": "^6.0.2",
    "typescript-eslint": "^8.58.2"
  }
}
```

Then run `yarn install` (registry resolves current matching versions; if any `^` spec no longer resolves, take the latest stable major and note it in the commit message).

- [ ] **Step 2: Write `astro.config.mjs`**

```js
// @ts-check
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://treatyourselfstudios.net",
  integrations: [ sitemap() ],
});
```

- [ ] **Step 3: Write `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "src/**/*", "scripts/**/*"],
  "exclude": ["dist", "studio"]
}
```

- [ ] **Step 4: Write `eslint.config.mjs`** (copy nw-local's style rules)

```js
// @ts-check
import eslintJs from "@eslint/js";
import eslintPluginAstro from "eslint-plugin-astro";
import typescriptEslint from "typescript-eslint";

export default typescriptEslint.config(
  { ignores: ["dist/", ".astro/", "node_modules/", "studio/"] },
  eslintJs.configs.recommended,
  ...typescriptEslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  {
    rules: {
      "space-in-parens": ["error", "always"],
      "id-length": ["error", { "min": 2, "exceptions": ["_"] }]
    }
  }
);
```

- [ ] **Step 5: Write `Makefile`** (nw-local pattern: `-include .env` + `export`)

```makefile
-include .env
export

.DEFAULT_GOAL := help

.PHONY: help install dev build preview check lint format studio deploy-studio seed

help: ## Show this help message with all available targets
	@grep -hE '^[a-zA-Z_-]+:.*?##' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies for root and studio/
	yarn install
	cd studio && yarn install

dev: ## Start the Astro dev server at localhost:4321
	yarn dev

build: ## Build the production site to ./dist/
	yarn build

preview: ## Preview the production build locally
	yarn preview

check: ## Run everything CI runs: types, lint, build
	yarn run check
	yarn lint
	yarn build

# NOTE: `yarn run check`, not `yarn check` — in yarn classic, bare `yarn check`
# invokes yarn's built-in integrity command and silently skips the package script.

lint: ## Run ESLint
	yarn lint

format: ## Auto-fix lint and formatting issues
	yarn format

studio: ## Start the Sanity Studio dev server at localhost:3333
	cd studio && npx sanity dev

deploy-studio: ## Deploy Sanity Studio to *.sanity.studio hosting
	cd studio && npx sanity deploy

seed: ## Seed/refresh Sanity content from scripts/seed-data/
	yarn seed
```

- [ ] **Step 6: Write `.gitignore`, `.env.example`, `public/CNAME`, `public/robots.txt`**

`.gitignore`:
```
node_modules/
dist/
.astro/
.env
.DS_Store
.claude/worktrees/
studio/dist/
```

`.env.example` (real values go in `.env`, which the USER edits directly — never paste tokens in chat):
```
SANITY_PROJECT_ID=
SANITY_DATASET=production
SANITY_API_TOKEN=
PUBLIC_FORMSPREE_ENDPOINT=
```

`public/CNAME` (single line, no trailing newline issues):
```
treatyourselfstudios.net
```

`public/robots.txt`:
```
User-agent: *
Allow: /
Disallow: /legacy/

Sitemap: https://treatyourselfstudios.net/sitemap-index.xml
```

- [ ] **Step 7: Placeholder page + stylesheet** so the build has output

`src/styles/global.css`: `/* Theme lands in Task 7 */`

`src/pages/index.astro`:
```astro
---
import "../styles/global.css";
---
<html lang="en">
  <head><meta charset="utf-8" /><title>Treat YourSelf Studios</title></head>
  <body><h1>Treat YourSelf Studios</h1></body>
</html>
```

- [ ] **Step 8: Verify the toolchain**

Run: `yarn install && make check`
Expected: `astro check` 0 errors, ESLint clean, build writes `dist/index.html` and `dist/robots.txt` and `dist/CNAME`. Confirm: `ls dist/CNAME dist/robots.txt dist/index.html`

- [ ] **Step 9: Commit**

```bash
git add -A && git commit -m "feat: scaffold Astro project with tooling"
```

---

### Task 2: Sanity project + Studio scaffold

**Files:**
- Create: `studio/package.json`, `studio/sanity.config.ts`, `studio/sanity.cli.ts`, `studio/tsconfig.json`, `studio/.gitignore`

**Interfaces:**
- Consumes: nothing (independent of root app)
- Produces: a real Sanity `projectId` recorded in `studio/sanity.config.ts`, `studio/sanity.cli.ts`, and the user's `.env` (`SANITY_PROJECT_ID`); dataset `production`. Task 3 adds `schemaTypes/`.

- [ ] **Step 1 [HUMAN]: Create the Sanity project**

Ask the user to run these in the terminal themselves (`!` prefix runs it in-session):
```
! cd studio 2>/dev/null || mkdir -p studio && cd studio; npx sanity@latest login
```
Then: `! cd studio && npx sanity@latest init --create-project "Treat YourSelf Studios" --dataset production --bare`
The command prints `projectId`. The user then writes `SANITY_PROJECT_ID=<id>` into `.env` in their editor. The executor may read the projectId from the command output in-session (it is not a secret — it appears in public API URLs); the API token later IS a secret and never enters chat.

- [ ] **Step 2: Write `studio/package.json`**

```json
{
  "name": "treatyourselfstudios-studio",
  "private": true,
  "version": "1.0.0",
  "scripts": {
    "dev": "sanity dev",
    "build": "sanity build",
    "deploy": "sanity deploy"
  },
  "dependencies": {
    "@sanity/vision": "^5.20.0",
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "sanity": "^5.20.0",
    "styled-components": "^6.1.18"
  },
  "devDependencies": {
    "@types/react": "^19.2.14",
    "typescript": "^5.8.0"
  }
}
```

- [ ] **Step 3: Write `studio/sanity.cli.ts`** (replace `PROJECT_ID` with the real id from Step 1 — the one literal exception to "no placeholders", since the id doesn't exist until Step 1 runs)

```ts
import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'PROJECT_ID',
    dataset: 'production',
  },
})
```

- [ ] **Step 4: Write `studio/sanity.config.ts`** (singleton guard pattern from nw-local; `schemaTypes` import satisfied in Task 3 — until then use `const schemaTypes = []` inline and note it)

```ts
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemaTypes'

const SINGLETON_TYPES = new Set( [ 'siteSettings', 'homePage' ] )
const SINGLETON_ACTIONS = new Set( [ 'publish', 'discardChanges', 'restore' ] )

export default defineConfig({
  name: 'treatyourselfstudios',
  title: 'Treat YourSelf Studios',
  projectId: 'PROJECT_ID',
  dataset: 'production',
  plugins: [
    structureTool({
      structure: ( listBuilder ) =>
        listBuilder.list()
          .title( 'Content' )
          .items( [
            listBuilder.listItem()
              .title( 'Site Settings' )
              .id( 'siteSettings' )
              .child( listBuilder.document().schemaType( 'siteSettings' ).documentId( 'siteSettings' ) ),
            listBuilder.listItem()
              .title( 'Home Page' )
              .id( 'homePage' )
              .child( listBuilder.document().schemaType( 'homePage' ).documentId( 'homePage' ) ),
            listBuilder.divider(),
            listBuilder.documentTypeListItem( 'serviceCategory' ).title( 'Service Categories' ),
            listBuilder.documentTypeListItem( 'service' ).title( 'Services' ),
            listBuilder.documentTypeListItem( 'servicePackage' ).title( 'Packages' ),
            listBuilder.divider(),
            listBuilder.documentTypeListItem( 'deal' ).title( 'Deals & Specials' ),
            listBuilder.documentTypeListItem( 'faq' ).title( 'FAQs' ),
            listBuilder.documentTypeListItem( 'teamMember' ).title( 'Team Members' ),
            listBuilder.documentTypeListItem( 'testimonial' ).title( 'Testimonials' ),
          ] ),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
    templates: ( templates ) => templates.filter( ({ schemaType }) => !SINGLETON_TYPES.has( schemaType ) ),
  },
  document: {
    actions: ( input, context ) =>
      SINGLETON_TYPES.has( context.schemaType )
        ? input.filter( ({ action }) => action && SINGLETON_ACTIONS.has( action ) )
        : input,
  },
})
```

Note: the document type is `servicePackage` (not `package` — that name is reserved-feeling and collides with npm vocabulary; keep `servicePackage` consistently everywhere).

`studio/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["./**/*.ts", "./**/*.tsx"],
  "exclude": ["node_modules", "dist"]
}
```

`studio/.gitignore`:
```
node_modules/
dist/
.sanity/
```

- [ ] **Step 5: Verify studio boots**

Run: `cd studio && yarn install && npx sanity build`
Expected: build completes without schema errors (empty schema list is valid at this point).

- [ ] **Step 6: Commit**

```bash
git add studio && git commit -m "feat: scaffold Sanity Studio"
```

---

### Task 3: Sanity document schemas

**Files:**
- Create: `studio/schemaTypes/index.ts`, `blockContent.ts`, `siteSettings.ts`, `homePage.ts`, `serviceCategory.ts`, `service.ts`, `servicePackage.ts`, `deal.ts`, `faq.ts`, `teamMember.ts`, `testimonial.ts`
- Modify: `studio/sanity.config.ts` (restore `schemaTypes` import if inlined in Task 2)

**Interfaces:**
- Produces: document type names and field names consumed verbatim by GROQ in Task 4 and by seed data in Tasks 5–6. The price model everywhere is `prices: Array<{ label?: string; amount: number }>` (amount in whole dollars) + optional `priceNote: string`.

- [ ] **Step 1: Write `studio/schemaTypes/blockContent.ts`**

```ts
import { defineArrayMember, defineType } from 'sanity'

export const blockContentType = defineType({
  name: 'blockContent',
  title: 'Rich Text',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'H2', value: 'h2' },
        { title: 'H3', value: 'h3' },
      ],
      lists: [ { title: 'Bullet', value: 'bullet' } ],
      marks: {
        decorators: [
          { title: 'Strong', value: 'strong' },
          { title: 'Emphasis', value: 'em' },
        ],
        annotations: [
          defineArrayMember({
            name: 'link',
            type: 'object',
            title: 'Link',
            fields: [ { name: 'href', type: 'url', title: 'URL', validation: ( rule ) => rule.required() } ],
          }),
        ],
      },
    }),
  ],
})
```

- [ ] **Step 2: Write `studio/schemaTypes/siteSettings.ts`**

```ts
import { defineField, defineType } from 'sanity'

export const siteSettingsType = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({ name: 'siteTitle', title: 'Site Title', type: 'string', validation: ( rule ) => rule.required() }),
    defineField({ name: 'tagline', title: 'Tagline', type: 'string', description: 'Short brand line used in the footer and default page titles' }),
    defineField({ name: 'siteDescription', title: 'Default SEO Description', type: 'text', rows: 3, validation: ( rule ) => rule.required().max( 160 ) }),
    defineField({
      name: 'logo', title: 'Logo', type: 'image', options: { hotspot: true },
      fields: [ defineField({ name: 'alt', title: 'Alternative Text', type: 'string', validation: ( rule ) => rule.required() }) ],
    }),
    defineField({ name: 'phone', title: 'Phone (display)', type: 'string', description: 'e.g. (206) 717-4843', validation: ( rule ) => rule.required() }),
    defineField({ name: 'phoneE164', title: 'Phone (tel: link)', type: 'string', description: 'e.g. +12067174843', validation: ( rule ) => rule.required().regex( /^\+1\d{10}$/ ) }),
    defineField({ name: 'email', title: 'Contact Email', type: 'string', validation: ( rule ) => rule.email() }),
    defineField({
      name: 'address', title: 'Address', type: 'object',
      fields: [
        defineField({ name: 'street', title: 'Street', type: 'string', validation: ( rule ) => rule.required() }),
        defineField({ name: 'city', title: 'City', type: 'string', validation: ( rule ) => rule.required() }),
        defineField({ name: 'state', title: 'State', type: 'string', validation: ( rule ) => rule.required() }),
        defineField({ name: 'zip', title: 'ZIP', type: 'string', validation: ( rule ) => rule.required() }),
      ],
    }),
    defineField({
      name: 'geo', title: 'Map Coordinates', type: 'geopoint',
      description: 'Must match the Google Business Profile pin',
      validation: ( rule ) => rule.required(),
    }),
    defineField({ name: 'hoursNote', title: 'Hours Note', type: 'string', description: 'e.g. "By appointment only"', validation: ( rule ) => rule.required() }),
    defineField({ name: 'priceRange', title: 'Price Range', type: 'string', description: 'For LocalBusiness JSON-LD, e.g. "$15-$140"', validation: ( rule ) => rule.required() }),
    defineField({ name: 'bookingUrl', title: 'Square Booking URL', type: 'url', validation: ( rule ) => rule.required().uri({ scheme: [ 'https' ] }) }),
    defineField({ name: 'giftCardUrl', title: 'Square Gift Card URL', type: 'url', validation: ( rule ) => rule.required().uri({ scheme: [ 'https' ] }) }),
    defineField({ name: 'shopUrl', title: 'Square Online Shop URL', type: 'url', validation: ( rule ) => rule.uri({ scheme: [ 'https' ] }) }),
    defineField({ name: 'firstVisitOffer', title: 'First-Visit Offer Banner', type: 'string', description: 'Shown in the site-wide announcement bar; empty hides the bar' }),
    defineField({
      name: 'socialLinks', title: 'Social Links', type: 'object',
      fields: [
        defineField({ name: 'instagram', title: 'Instagram URL', type: 'url', validation: ( rule ) => rule.uri({ scheme: [ 'https' ] }) }),
        defineField({ name: 'facebook', title: 'Facebook URL', type: 'url', validation: ( rule ) => rule.uri({ scheme: [ 'https' ] }) }),
        defineField({ name: 'twitter', title: 'X / Twitter URL', type: 'url', validation: ( rule ) => rule.uri({ scheme: [ 'https' ] }) }),
        defineField({ name: 'yelp', title: 'Yelp URL', type: 'url', validation: ( rule ) => rule.uri({ scheme: [ 'https' ] }) }),
      ],
    }),
  ],
})
```

- [ ] **Step 3: Write `studio/schemaTypes/serviceCategory.ts`**

```ts
import { defineArrayMember, defineField, defineType } from 'sanity'

export const serviceCategoryType = defineType({
  name: 'serviceCategory',
  title: 'Service Category',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: ( rule ) => rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title', maxLength: 96 }, validation: ( rule ) => rule.required() }),
    defineField({ name: 'menuLabel', title: 'Nav Menu Label', type: 'string', description: 'Short label for the Services dropdown; defaults to Title if empty' }),
    defineField({ name: 'order', title: 'Display Order', type: 'number', validation: ( rule ) => rule.required().integer() }),
    defineField({ name: 'isAddOnCategory', title: 'Is the Add-Ons category?', type: 'boolean', initialValue: false, description: 'Add-ons render on the Packages page and as cross-sells, not as a standalone category page' }),
    defineField({ name: 'seoTitle', title: 'SEO Title', type: 'string', description: 'e.g. "Facials in West Seattle | Treat YourSelf Studios"', validation: ( rule ) => rule.required().max( 60 ) }),
    defineField({ name: 'seoDescription', title: 'SEO Description', type: 'text', rows: 2, validation: ( rule ) => rule.required().max( 160 ) }),
    defineField({ name: 'intro', title: 'Intro Copy', type: 'blockContent', validation: ( rule ) => rule.required() }),
    defineField({
      name: 'educationBlocks', title: 'Education Blocks', type: 'array',
      description: '"What is a lash lift?"-style explainers, rendered as expandable sections',
      of: [ defineArrayMember({
        type: 'object',
        name: 'educationBlock',
        fields: [
          defineField({ name: 'heading', title: 'Heading', type: 'string', validation: ( rule ) => rule.required() }),
          defineField({ name: 'body', title: 'Body', type: 'blockContent', validation: ( rule ) => rule.required() }),
        ],
      }) ],
    }),
    defineField({ name: 'preCare', title: 'Pre-Care Guide', type: 'blockContent' }),
    defineField({ name: 'postCare', title: 'Post-Care Guide', type: 'blockContent' }),
    defineField({
      name: 'heroImage', title: 'Hero Image', type: 'image', options: { hotspot: true },
      fields: [ defineField({ name: 'alt', title: 'Alternative Text', type: 'string', validation: ( rule ) => rule.required() }) ],
    }),
  ],
  orderings: [ { title: 'Display Order', name: 'orderAsc', by: [ { field: 'order', direction: 'asc' } ] } ],
})
```

- [ ] **Step 4: Write `studio/schemaTypes/service.ts`**

```ts
import { defineArrayMember, defineField, defineType } from 'sanity'

export const serviceType = defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: ( rule ) => rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name', maxLength: 96 }, validation: ( rule ) => rule.required() }),
    defineField({
      name: 'category', title: 'Category', type: 'reference', to: [ { type: 'serviceCategory' } ],
      validation: ( rule ) => rule.required(),
    }),
    defineField({ name: 'order', title: 'Display Order', type: 'number', validation: ( rule ) => rule.required().integer() }),
    defineField({
      name: 'prices', title: 'Prices', type: 'array',
      description: 'One entry for a simple price; multiple for variants (e.g. Brazilian $65 / Manzilian $75)',
      of: [ defineArrayMember({
        type: 'object',
        name: 'priceVariant',
        fields: [
          defineField({ name: 'label', title: 'Variant Label', type: 'string', description: 'Empty for single-price services' }),
          defineField({ name: 'amount', title: 'Amount (USD)', type: 'number', validation: ( rule ) => rule.required().positive() }),
        ],
        preview: { select: { title: 'label', subtitle: 'amount' } },
      }) ],
      validation: ( rule ) => rule.required().min( 1 ),
    }),
    defineField({ name: 'priceNote', title: 'Price Note', type: 'string', description: 'e.g. "Toe hair removal is an additional $5"' }),
    defineField({ name: 'durationMinutes', title: 'Duration (minutes)', type: 'number', validation: ( rule ) => rule.integer().positive() }),
    defineField({ name: 'benefit', title: 'Benefit One-Liner', type: 'string', description: 'Menu-row summary, benefit-led', validation: ( rule ) => rule.required().max( 120 ) }),
    defineField({ name: 'description', title: 'Detail Description', type: 'blockContent' }),
    defineField({ name: 'featured', title: 'Featured', type: 'boolean', initialValue: false, description: 'Featured services get highlighted styling in the menu' }),
    defineField({ name: 'seasonal', title: 'Seasonal', type: 'boolean', initialValue: false, description: 'Rendered under a "Seasonal" subheading within the category' }),
  ],
  orderings: [ { title: 'Display Order', name: 'orderAsc', by: [ { field: 'order', direction: 'asc' } ] } ],
  preview: { select: { title: 'name', subtitle: 'category.title' } },
})
```

- [ ] **Step 5: Write `studio/schemaTypes/servicePackage.ts`**

```ts
import { defineArrayMember, defineField, defineType } from 'sanity'

export const servicePackageType = defineType({
  name: 'servicePackage',
  title: 'Package',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: ( rule ) => rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name', maxLength: 96 }, validation: ( rule ) => rule.required() }),
    defineField({ name: 'order', title: 'Display Order', type: 'number', validation: ( rule ) => rule.required().integer() }),
    defineField({
      name: 'prices', title: 'Prices', type: 'array',
      of: [ defineArrayMember({
        type: 'object',
        name: 'priceVariant',
        fields: [
          defineField({ name: 'label', title: 'Variant Label', type: 'string' }),
          defineField({ name: 'amount', title: 'Amount (USD)', type: 'number', validation: ( rule ) => rule.required().positive() }),
        ],
      }) ],
      validation: ( rule ) => rule.required().min( 1 ),
    }),
    defineField({ name: 'durationMinutes', title: 'Duration (minutes)', type: 'number', validation: ( rule ) => rule.integer().positive() }),
    defineField({ name: 'benefit', title: 'Benefit One-Liner', type: 'string', validation: ( rule ) => rule.required().max( 120 ) }),
    defineField({ name: 'description', title: 'Description', type: 'blockContent', validation: ( rule ) => rule.required() }),
  ],
  orderings: [ { title: 'Display Order', name: 'orderAsc', by: [ { field: 'order', direction: 'asc' } ] } ],
})
```

- [ ] **Step 6: Write `deal.ts`, `faq.ts`, `teamMember.ts`, `testimonial.ts`**

`studio/schemaTypes/deal.ts`:
```ts
import { defineField, defineType } from 'sanity'

export const dealType = defineType({
  name: 'deal',
  title: 'Deal / Special',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: ( rule ) => rule.required() }),
    defineField({ name: 'details', title: 'Details', type: 'text', rows: 3, validation: ( rule ) => rule.required() }),
    defineField({ name: 'finePrint', title: 'Fine Print', type: 'string', description: 'e.g. "Cannot be combined with other deals"' }),
    defineField({ name: 'order', title: 'Display Order', type: 'number', validation: ( rule ) => rule.required().integer() }),
  ],
  orderings: [ { title: 'Display Order', name: 'orderAsc', by: [ { field: 'order', direction: 'asc' } ] } ],
})
```

`studio/schemaTypes/faq.ts`:
```ts
import { defineField, defineType } from 'sanity'

export const faqType = defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'document',
  fields: [
    defineField({ name: 'question', title: 'Question', type: 'string', validation: ( rule ) => rule.required() }),
    defineField({ name: 'answer', title: 'Answer', type: 'blockContent', validation: ( rule ) => rule.required() }),
    defineField({ name: 'order', title: 'Display Order', type: 'number', validation: ( rule ) => rule.required().integer() }),
  ],
  orderings: [ { title: 'Display Order', name: 'orderAsc', by: [ { field: 'order', direction: 'asc' } ] } ],
})
```

`studio/schemaTypes/teamMember.ts`:
```ts
import { defineField, defineType } from 'sanity'

export const teamMemberType = defineType({
  name: 'teamMember',
  title: 'Team Member',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: ( rule ) => rule.required() }),
    defineField({ name: 'role', title: 'Role', type: 'string', description: 'e.g. "Owner & Esthetician"', validation: ( rule ) => rule.required() }),
    defineField({ name: 'bio', title: 'Bio', type: 'blockContent', validation: ( rule ) => rule.required() }),
    defineField({
      name: 'photo', title: 'Photo', type: 'image', options: { hotspot: true },
      fields: [ defineField({ name: 'alt', title: 'Alternative Text', type: 'string', validation: ( rule ) => rule.required() }) ],
    }),
    defineField({ name: 'order', title: 'Display Order', type: 'number', validation: ( rule ) => rule.required().integer() }),
  ],
  orderings: [ { title: 'Display Order', name: 'orderAsc', by: [ { field: 'order', direction: 'asc' } ] } ],
})
```

`studio/schemaTypes/testimonial.ts`:
```ts
import { defineField, defineType } from 'sanity'

export const testimonialType = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    defineField({ name: 'quote', title: 'Quote', type: 'text', rows: 3, validation: ( rule ) => rule.required() }),
    defineField({ name: 'attribution', title: 'Attribution', type: 'string', description: 'e.g. "Yasmina S."', validation: ( rule ) => rule.required() }),
    defineField({ name: 'location', title: 'Location', type: 'string', description: 'e.g. "Northgate"' }),
    defineField({ name: 'order', title: 'Display Order', type: 'number', validation: ( rule ) => rule.required().integer() }),
  ],
  orderings: [ { title: 'Display Order', name: 'orderAsc', by: [ { field: 'order', direction: 'asc' } ] } ],
})
```

- [ ] **Step 7: Write `studio/schemaTypes/homePage.ts`**

```ts
import { defineField, defineType } from 'sanity'

export const homePageType = defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  fields: [
    defineField({ name: 'heroHeading', title: 'Hero Heading', type: 'string', validation: ( rule ) => rule.required() }),
    defineField({ name: 'heroSubheading', title: 'Hero Subheading', type: 'text', rows: 3, validation: ( rule ) => rule.required() }),
    defineField({
      name: 'heroImage', title: 'Hero Image', type: 'image', options: { hotspot: true },
      fields: [ defineField({ name: 'alt', title: 'Alternative Text', type: 'string', validation: ( rule ) => rule.required() }) ],
    }),
    defineField({ name: 'welcomeHeading', title: 'Welcome Heading', type: 'string', validation: ( rule ) => rule.required() }),
    defineField({ name: 'welcomeBody', title: 'Welcome Body', type: 'blockContent', validation: ( rule ) => rule.required() }),
    defineField({ name: 'seoTitle', title: 'SEO Title', type: 'string', validation: ( rule ) => rule.required().max( 60 ) }),
    defineField({ name: 'seoDescription', title: 'SEO Description', type: 'text', rows: 2, validation: ( rule ) => rule.required().max( 160 ) }),
  ],
})
```

- [ ] **Step 8: Write `studio/schemaTypes/index.ts`** and restore the import in `sanity.config.ts`

```ts
import { blockContentType } from './blockContent'
import { dealType } from './deal'
import { faqType } from './faq'
import { homePageType } from './homePage'
import { serviceCategoryType } from './serviceCategory'
import { servicePackageType } from './servicePackage'
import { serviceType } from './service'
import { siteSettingsType } from './siteSettings'
import { teamMemberType } from './teamMember'
import { testimonialType } from './testimonial'

export const schemaTypes = [
  blockContentType,
  dealType,
  faqType,
  homePageType,
  serviceCategoryType,
  servicePackageType,
  serviceType,
  siteSettingsType,
  teamMemberType,
  testimonialType,
]
```

- [ ] **Step 9: Verify schemas compile and deploy Studio**

Run: `cd studio && npx sanity schema validate && npx sanity build`
Expected: "No errors found" from schema validate; build succeeds.
Then `[HUMAN]` ask the user to pick a Studio hostname and run: `! cd studio && npx sanity deploy` (suggest hostname `treatyourselfstudios`).

- [ ] **Step 10: Commit**

```bash
git add studio && git commit -m "feat: add Sanity document schemas"
```

---

### Task 4: Data layer — `src/lib/sanity.ts` + `src/lib/image.ts`

**Files:**
- Create: `src/lib/sanity.ts`, `src/lib/image.ts`

**Interfaces:**
- Consumes: schema type/field names from Task 3.
- Produces (used by every page task): `sanityClient`; types `SanitySlug`, `SanityImage`, `PortableText`, `PriceVariant`, `SiteSettings`, `HomePage`, `ServiceCategory`, `Service`, `ServicePackage`, `Deal`, `Faq`, `TeamMember`, `Testimonial`; functions `getSiteSettings(): Promise<SiteSettings>`, `getHomePage(): Promise<HomePage>`, `getServiceCategories(): Promise<ServiceCategory[]>`, `getServicesByCategory( categorySlug: string ): Promise<Service[]>`, `getAllServices(): Promise<Service[]>`, `getServicePackages(): Promise<ServicePackage[]>`, `getDeals(): Promise<Deal[]>`, `getFaqs(): Promise<Faq[]>`, `getTeamMembers(): Promise<TeamMember[]>`, `getTestimonials(): Promise<Testimonial[]>`, and `assertPresent<Value>( value: Value | null | undefined, label: string ): Value`. From `image.ts`: `urlFor( source: SanityImageSource )`.

- [ ] **Step 1: Write `src/lib/sanity.ts`**

```ts
import { createClient } from "@sanity/client";

const SANITY_PROJECT_ID = import.meta.env.SANITY_PROJECT_ID;
const SANITY_DATASET = import.meta.env.SANITY_DATASET;
const SANITY_API_TOKEN = import.meta.env.SANITY_API_TOKEN;

if( !SANITY_PROJECT_ID ) throw new Error( "Missing SANITY_PROJECT_ID env var" );
if( !SANITY_DATASET ) throw new Error( "Missing SANITY_DATASET env var" );
if( !SANITY_API_TOKEN ) throw new Error( "Missing SANITY_API_TOKEN env var" );

export const sanityClient = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: "2026-07-09",
  useCdn: false,
  token: SANITY_API_TOKEN,
});

// --- Shared types ---

export interface SanitySlug {
  current: string;
}

export interface SanityImage {
  asset: {
    _id?: string;
    _ref?: string;
    url?: string;
    metadata?: unknown;
  };
  alt: string;
  crop?: unknown;
  hotspot?: unknown;
}

export interface PortableTextBlock {
  _type: string;
  _key?: string;
  [key: string]: unknown;
}

export type PortableText = PortableTextBlock[];

export interface PriceVariant {
  label?: string;
  amount: number;
}

// --- Build-time validation ---

export function assertPresent<Value>( value: Value | null | undefined, label: string ): Value {
  if( value === null || value === undefined ) {
    throw new Error( `Sanity data missing: ${label}. Fix the document in Studio, then rebuild.` );
  }
  return value;
}

function assertServiceComplete( service: Service ): Service {
  if( !service.prices?.length ) {
    throw new Error( `Sanity data missing: service "${service.name}" has no prices. Fix it in Studio.` );
  }
  return service;
}

// --- Documents ---

export interface SiteSettings {
  siteTitle: string;
  tagline?: string;
  siteDescription: string;
  logo?: SanityImage;
  phone: string;
  phoneE164: string;
  email?: string;
  address: { street: string; city: string; state: string; zip: string };
  geo: { lat: number; lng: number };
  hoursNote: string;
  priceRange: string;
  bookingUrl: string;
  giftCardUrl: string;
  shopUrl?: string;
  firstVisitOffer?: string;
  socialLinks?: { instagram?: string; facebook?: string; twitter?: string; yelp?: string };
}

export interface HomePage {
  heroHeading: string;
  heroSubheading: string;
  heroImage?: SanityImage;
  welcomeHeading: string;
  welcomeBody: PortableText;
  seoTitle: string;
  seoDescription: string;
}

export interface EducationBlock {
  heading: string;
  body: PortableText;
}

export interface ServiceCategory {
  _id: string;
  title: string;
  slug: SanitySlug;
  menuLabel?: string;
  order: number;
  isAddOnCategory?: boolean;
  seoTitle: string;
  seoDescription: string;
  intro: PortableText;
  educationBlocks?: EducationBlock[];
  preCare?: PortableText;
  postCare?: PortableText;
  heroImage?: SanityImage;
}

export interface Service {
  _id: string;
  name: string;
  slug: SanitySlug;
  categorySlug: string;
  order: number;
  prices: PriceVariant[];
  priceNote?: string;
  durationMinutes?: number;
  benefit: string;
  description?: PortableText;
  featured?: boolean;
  seasonal?: boolean;
}

export interface ServicePackage {
  _id: string;
  name: string;
  slug: SanitySlug;
  order: number;
  prices: PriceVariant[];
  durationMinutes?: number;
  benefit: string;
  description: PortableText;
}

export interface Deal {
  _id: string;
  title: string;
  details: string;
  finePrint?: string;
  order: number;
}

export interface Faq {
  _id: string;
  question: string;
  answer: PortableText;
  order: number;
}

export interface TeamMember {
  _id: string;
  name: string;
  role: string;
  bio: PortableText;
  photo?: SanityImage;
  order: number;
}

export interface Testimonial {
  _id: string;
  quote: string;
  attribution: string;
  location?: string;
  order: number;
}

// --- Queries ---

const SERVICE_PROJECTION = `{
  _id, name, slug, "categorySlug": category->slug.current, order,
  prices[]{ label, amount }, priceNote, durationMinutes,
  benefit, description, featured, seasonal
}`;

export async function getSiteSettings(): Promise<SiteSettings> {
  const settings = await sanityClient.fetch<SiteSettings | null>(
    `*[_type == "siteSettings"][0]{
      siteTitle, tagline, siteDescription,
      logo{ asset->, alt, crop, hotspot },
      phone, phoneE164, email, address, geo, hoursNote, priceRange,
      bookingUrl, giftCardUrl, shopUrl, firstVisitOffer, socialLinks
    }`,
  );
  return assertPresent( settings, "siteSettings singleton" );
}

export async function getHomePage(): Promise<HomePage> {
  const homePage = await sanityClient.fetch<HomePage | null>(
    `*[_type == "homePage"][0]{
      heroHeading, heroSubheading,
      heroImage{ asset->, alt, crop, hotspot },
      welcomeHeading, welcomeBody, seoTitle, seoDescription
    }`,
  );
  return assertPresent( homePage, "homePage singleton" );
}

export async function getServiceCategories(): Promise<ServiceCategory[]> {
  return sanityClient.fetch<ServiceCategory[]>(
    `*[_type == "serviceCategory"] | order(order asc){
      _id, title, slug, menuLabel, order, isAddOnCategory,
      seoTitle, seoDescription, intro, educationBlocks[]{ heading, body },
      preCare, postCare,
      heroImage{ asset->, alt, crop, hotspot }
    }`,
  );
}

export async function getAllServices(): Promise<Service[]> {
  const services = await sanityClient.fetch<Service[]>(
    `*[_type == "service"] | order(order asc) ${SERVICE_PROJECTION}`,
  );
  return services.map( assertServiceComplete );
}

export async function getServicesByCategory( categorySlug: string ): Promise<Service[]> {
  const services = await sanityClient.fetch<Service[]>(
    `*[_type == "service" && category->slug.current == $categorySlug] | order(order asc) ${SERVICE_PROJECTION}`,
    { categorySlug },
  );
  return services.map( assertServiceComplete );
}

export async function getServicePackages(): Promise<ServicePackage[]> {
  return sanityClient.fetch<ServicePackage[]>(
    `*[_type == "servicePackage"] | order(order asc){
      _id, name, slug, order, prices[]{ label, amount },
      durationMinutes, benefit, description
    }`,
  );
}

export async function getDeals(): Promise<Deal[]> {
  return sanityClient.fetch<Deal[]>(
    `*[_type == "deal"] | order(order asc){ _id, title, details, finePrint, order }`,
  );
}

export async function getFaqs(): Promise<Faq[]> {
  return sanityClient.fetch<Faq[]>(
    `*[_type == "faq"] | order(order asc){ _id, question, answer, order }`,
  );
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  return sanityClient.fetch<TeamMember[]>(
    `*[_type == "teamMember"] | order(order asc){
      _id, name, role, bio, photo{ asset->, alt, crop, hotspot }, order
    }`,
  );
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return sanityClient.fetch<Testimonial[]>(
    `*[_type == "testimonial"] | order(order asc){ _id, quote, attribution, location, order }`,
  );
}
```

- [ ] **Step 2: Write `src/lib/image.ts`** (identical to nw-local)

```ts
import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";
import { sanityClient } from "./sanity";

const builder = createImageUrlBuilder( sanityClient );

export function urlFor( source: SanityImageSource ) {
  return builder.image( source );
}
```

- [ ] **Step 3: Verify types**

Ensure `.env` has `SANITY_PROJECT_ID`, `SANITY_DATASET`, `SANITY_API_TOKEN` (`[HUMAN]`: user creates a **read+write** token at sanity.io/manage → API → Tokens and writes it into `.env` directly — write access is needed for seeding in Task 5; never paste it in chat).
Run: `make check`
Expected: 0 type errors; build still succeeds (pages don't consume the lib yet).

- [ ] **Step 4: Commit**

```bash
git add src/lib && git commit -m "feat: add Sanity data layer with build-time validation"
```

---

### Task 5: Seed infrastructure + settled content (settings, deals, FAQs, testimonials, team, home)

**Files:**
- Create: `scripts/seed.ts`, `scripts/seed-data/helpers.ts`, `scripts/seed-data/siteSettings.ts`, `scripts/seed-data/homePage.ts`, `scripts/seed-data/deals.ts`, `scripts/seed-data/faqs.ts`, `scripts/seed-data/testimonials.ts`, `scripts/seed-data/teamMembers.ts`

**Interfaces:**
- Consumes: schema names from Task 3. Runs under `tsx` (Node), so it reads env via `process.env`, NOT `import.meta.env`.
- Produces: deterministic document `_id`s (`siteSettings`, `homePage`, `deal-first-visit`, `faq-cancellation`, …) so re-running the seed is idempotent (`createOrReplace`). `scripts/seed-data/helpers.ts` exports `richText( paragraphs: string[] ): PortableTextBlock[]` and `uploadImage( client, filePath, altText )` used by Task 6.

- [ ] **Step 1: Write `scripts/seed-data/helpers.ts`**

```ts
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { basename } from "node:path";
import type { SanityClient } from "@sanity/client";

interface SeedTextBlock {
  _type: "block";
  _key: string;
  style: "normal" | "h2" | "h3";
  markDefs: never[];
  children: Array<{ _type: "span"; _key: string; text: string; marks: never[] }>;
}

function stableKey( text: string, index: number ): string {
  return createHash( "sha1" ).update( `${index}:${text}` ).digest( "hex" ).slice( 0, 12 );
}

/** Convert plain paragraphs into Portable Text blocks with stable keys. */
export function richText( paragraphs: string[] ): SeedTextBlock[] {
  return paragraphs.map( ( paragraph, index ) => ({
    _type: "block",
    _key: stableKey( paragraph, index ),
    style: "normal",
    markDefs: [],
    children: [ { _type: "span", _key: stableKey( paragraph, index + 1000 ), text: paragraph, marks: [] } ],
  }) );
}

/** Upload an image once; reuse by deterministic filename check. Returns an image field value. */
export async function uploadImage( client: SanityClient, filePath: string, altText: string ) {
  const fileName = basename( filePath );
  const existing = await client.fetch<{ _id: string } | null>(
    `*[_type == "sanity.imageAsset" && originalFilename == $fileName][0]{ _id }`,
    { fileName },
  );
  const assetId = existing
    ? existing._id
    : ( await client.assets.upload( "image", readFileSync( filePath ), { filename: fileName } ) )._id;
  return { _type: "image", asset: { _type: "reference", _ref: assetId }, alt: altText };
}
```

- [ ] **Step 2: Write `scripts/seed.ts`**

```ts
import { createClient } from "@sanity/client";
import { buildDeals } from "./seed-data/deals";
import { buildFaqs } from "./seed-data/faqs";
import { buildHomePage } from "./seed-data/homePage";
import { buildServiceContent } from "./seed-data/services";
import { buildSiteSettings } from "./seed-data/siteSettings";
import { buildTeamMembers } from "./seed-data/teamMembers";
import { buildTestimonials } from "./seed-data/testimonials";

const SANITY_PROJECT_ID = process.env.SANITY_PROJECT_ID;
const SANITY_DATASET = process.env.SANITY_DATASET;
const SANITY_API_TOKEN = process.env.SANITY_API_TOKEN;

if( !SANITY_PROJECT_ID ) throw new Error( "Missing SANITY_PROJECT_ID env var" );
if( !SANITY_DATASET ) throw new Error( "Missing SANITY_DATASET env var" );
if( !SANITY_API_TOKEN ) throw new Error( "Missing SANITY_API_TOKEN env var (needs write access for seeding)" );

const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: "2026-07-09",
  useCdn: false,
  token: SANITY_API_TOKEN,
});

async function seed() {
  const documents = [
    await buildSiteSettings( client ),
    await buildHomePage( client ),
    ...buildDeals(),
    ...buildFaqs(),
    ...buildTestimonials(),
    ...( await buildTeamMembers( client ) ),
    ...( await buildServiceContent( client ) ),
  ];

  let transaction = client.transaction();
  for( const document of documents ) {
    transaction = transaction.createOrReplace( document );
  }
  await transaction.commit();
  console.log( `Seeded ${documents.length} documents into ${SANITY_DATASET}` );
}

seed().catch( ( error ) => {
  console.error( error );
  process.exit( 1 );
} );
```

Note: `./seed-data/services` is created in Task 6. Until then, stub it as `export async function buildServiceContent() { return []; }` in this task and replace in Task 6.

- [ ] **Step 3: Write `scripts/seed-data/siteSettings.ts`** (complete — this IS the final data)

```ts
import type { SanityClient } from "@sanity/client";
import { uploadImage } from "./helpers";

export async function buildSiteSettings( client: SanityClient ) {
  return {
    _id: "siteSettings",
    _type: "siteSettings",
    siteTitle: "Treat YourSelf Studios",
    tagline: "The best journey in life is the journey back to yourself.",
    siteDescription:
      "Appointment-only esthetics studio in Seattle offering custom facials, waxing, lash & brow services, and body treatments. Treat yourself — book online today.",
    phone: "(206) 717-4843",
    phoneE164: "+12067174843",
    address: { street: "3902 S Ferdinand St Unit 101", city: "Seattle", state: "WA", zip: "98118" },
    geo: { _type: "geopoint", lat: 47.559, lng: -122.2855 },
    hoursNote: "By appointment only",
    priceRange: "$15-$140",
    bookingUrl: "https://squareup.com/appointments/book/E92Q1CBDSF7V8/treat-yourself-studios-seattle-wa",
    giftCardUrl: "https://squareup.com/gift/1R0F1BKX04VN4/order",
    firstVisitOffer: "First-time clients: mention this offer when booking for 15% off your first service",
    socialLinks: {
      instagram: "https://www.instagram.com/treatyourselfstudios",
      facebook: "https://www.facebook.com/239257876595827",
      twitter: "https://www.x.com/studios_treat",
      yelp: "https://www.yelp.com/biz/treat-yourself-studios-seattle",
    },
  };
}
```

(`shopUrl` intentionally omitted until the owner confirms the Square Online store URL — Task 15 checklist. The Shop nav link renders only when `shopUrl` is set. `logo` intentionally omitted — no logo asset exists; see the image inventory table.)

- [ ] **Step 4: Write `scripts/seed-data/homePage.ts`** (complete)

```ts
import type { SanityClient } from "@sanity/client";
import { richText, uploadImage } from "./helpers";

export async function buildHomePage( client: SanityClient ) {
  return {
    _id: "homePage",
    _type: "homePage",
    heroHeading: "Take a well-deserved break — treat yourself.",
    heroSubheading:
      "Custom facials, expert waxing, and restorative body treatments in a calm, one-on-one studio in Seattle. By appointment only.",
    heroImage: await uploadImage( client, "docs/content-audit/images/E998EFC5-BF68-45F2-8B0E-56BC3026C222.png", "Smiling client with a fresh facial masque at Treat YourSelf Studios" ),
    welcomeHeading: "The best journey in life is the journey back to yourself",
    welcomeBody: richText( [
      "Step away from the stress of your busy day and focus on you. At Treat YourSelf Studios, every visit is one-on-one: your esthetician's full attention, a full range of professional treatments, and products that are all-natural, cruelty-free, and free of parabens, synthetic dyes, and fragrances.",
      "Whether you're here for a custom facial, silky-smooth waxing, or a head-to-toe body treatment, you'll leave rejuvenated, glowing, and already planning your next visit.",
    ] ),
    seoTitle: "Facials, Waxing & Spa Treatments in Seattle",
    seoDescription:
      "Treat YourSelf Studios is an appointment-only esthetics studio in Seattle. Custom facials, Brazilian waxing, lash & brow services, and body treatments. Book online.",
  };
}
```

- [ ] **Step 5: Write `deals.ts`, `faqs.ts`, `testimonials.ts`, `teamMembers.ts`** (complete — final rewritten copy)

`scripts/seed-data/deals.ts`:
```ts
export function buildDeals() {
  return [
    {
      _id: "deal-first-visit",
      _type: "deal",
      title: "15% off your first visit",
      details: "New to the studio? Mention this offer when you book and take 15% off your first service.",
      finePrint: "Cannot be combined with other deals.",
      order: 1,
    },
    {
      _id: "deal-rebook",
      _type: "deal",
      title: "10% off when you rebook",
      details: "Book your next appointment before you leave and save 10% on it.",
      order: 2,
    },
    {
      _id: "deal-package-sixth-free",
      _type: "deal",
      title: "Buy 5, get the 6th free",
      details: "Purchase any package of five of the same service and your sixth is on us.",
      order: 3,
    },
  ];
}
```

`scripts/seed-data/faqs.ts`:
```ts
import { richText } from "./helpers";

export function buildFaqs() {
  return [
    {
      _id: "faq-cancellation",
      _type: "faq",
      question: "What is the cancellation policy?",
      answer: richText( [
        "We ask for 24 hours' notice to change or cancel an appointment. Without proper notice, a fee of 50% of the appointment charge applies; no-shows are charged 100%.",
        "Arriving more than 15 minutes late (10 minutes for shorter appointments) counts as a no-show, and we won't be able to see you. When booking, you'll be asked for a credit card to hold your reservation — that information stays private.",
      ] ),
      order: 1,
    },
    {
      _id: "faq-arrival",
      _type: "faq",
      question: "How early should I arrive for my appointment?",
      answer: richText( [
        "Please arrive no earlier than 10 minutes before your session, out of consideration for your esthetician and fellow clients. Sessions include the full advertised treatment time plus 10 minutes for first-time paperwork, dressing, and consultation.",
        "Sessions can't be extended for late arrivals.",
      ] ),
      order: 2,
    },
    {
      _id: "faq-payment",
      _type: "faq",
      question: "What forms of payment are accepted?",
      answer: richText( [
        "All major debit and credit cards, and cash. Personal checks are not accepted.",
      ] ),
      order: 3,
    },
    {
      _id: "faq-gratuity",
      _type: "faq",
      question: "Is gratuity required?",
      answer: richText( [
        "No — gratuity is never required. If you'd like to leave one, 15–20% is customary.",
      ] ),
      order: 4,
    },
  ];
}
```

`scripts/seed-data/testimonials.ts`:
```ts
export function buildTestimonials() {
  return [
    { _id: "testimonial-yasmina", _type: "testimonial", quote: "Nichele has really helped to turn my skin around. She is truly the best.", attribution: "Yasmina S.", location: "Northgate", order: 1 },
    { _id: "testimonial-melnie", _type: "testimonial", quote: "My skin feels refreshed and revived after each facial with Nichele.", attribution: "Melnie B.", location: "Aliso Viejo, CA", order: 2 },
    { _id: "testimonial-byron", _type: "testimonial", quote: "Best facial I've ever had — nothing short of wonderful.", attribution: "Byron M.", location: "West Seattle", order: 3 },
    { _id: "testimonial-lisa-wax", _type: "testimonial", quote: "She never misses a spot when waxing me.", attribution: "Lisa S.", location: "Seattle", order: 4 },
    { _id: "testimonial-lisa-brazilian", _type: "testimonial", quote: "She is so quick and efficient performing my Brazilian, I refuse to go anywhere else.", attribution: "Lisa S.", location: "Seattle", order: 5 },
  ];
}
```

`scripts/seed-data/teamMembers.ts`:
```ts
import type { SanityClient } from "@sanity/client";
import { richText, uploadImage } from "./helpers";

export async function buildTeamMembers( client: SanityClient ) {
  return [
    {
      _id: "team-nichele",
      _type: "teamMember",
      name: "Nichele",
      role: "Owner & Esthetician",
      bio: richText( [
        "A Seattle native and licensed esthetician, Nichele makes it her top priority to balance and enhance your skin's natural radiance. Working with today's top tools, techniques, and product lines, she can help reduce — or completely eliminate — problem skin.",
        "Hair removal needs? Brow, bikini, or back, there's no surface too big or too small. With a \"no hair left behind\" mindset, Nichele prides herself on quick, intuitive, and accurate service. Custom facials, hair removal, body treatments, and more — Nichele is the esthetician to see.",
      ] ),
      photo: await uploadImage( client, "docs/content-audit/images/FF0554C5-E643-49EE-9520-12A4283B4E26.jpg", "Nichele, owner and esthetician at Treat YourSelf Studios" ),
      order: 1,
    },
    {
      _id: "team-saphiyah",
      _type: "teamMember",
      name: "Saphiyah",
      role: "Esthetician & Lash Specialist",
      bio: richText( [
        "Hi, I'm Saphiyah! I'm a licensed esthetician who loves helping people look and feel their best. My goal is to provide relaxing, results-driven treatments tailored to each client's unique skincare needs — leaving you refreshed, confident, and glowing.",
      ] ),
      photo: await uploadImage( client, "docs/content-audit/images/49AF74D4-DC29-4BDD-9DD7-03D105311934.png", "Saphiyah, esthetician and lash specialist at Treat YourSelf Studios" ),
      order: 2,
    },
  ];
}
```

**Image-to-person check:** resolved by controller visual inspection — Saphiyah's photo (`49AF74D4`) is confirmed by the name embroidered on her scrubs; Nichele's (`FF0554C5`) is the only professional headshot remaining and is user-confirmed. The image inventory table at the top of this plan is authoritative.

- [ ] **Step 6: Run the seed and verify counts**

Run: `make seed`
Expected: `Seeded 16 documents into production` (1 settings + 1 home + 3 deals + 4 faqs + 5 testimonials + 2 team; services come in Task 6).
Verify in Studio (`make studio`) that Site Settings renders with logo, and spot-check one FAQ.

- [ ] **Step 7: Commit**

```bash
git add scripts && git commit -m "feat: add idempotent Sanity seed with settings, deals, FAQs, testimonials, team"
```

---

### Task 6: Seed services, categories, and packages (the copy rewrite)

**Files:**
- Create: `scripts/seed-data/services.ts` (replaces the Task 5 stub)

**Interfaces:**
- Consumes: `richText`, `uploadImage` from `helpers.ts`; source copy in `docs/content-audit/{hair-removal,facials,lash-and-brow,body-treatments,service-add-ons,packages}.txt`.
- Produces: 5 `serviceCategory` docs (`_id: category-hair-removal` etc.), ~61 `service` docs (`_id: service-<slug>`), 6 `servicePackage` docs (`_id: package-<slug>`), exported via `buildServiceContent( client )`.

This task is copy authoring against a fixed structure. The REWRITE RULES and two fully-worked examples below are the specification; apply them to every remaining item in the source files. Do not skip items. Counted from the source files (a variant-priced pair like "Brows / Uni-Brow only — $25/$15" is ONE service with two labeled prices): 22 hair-removal services, 9 facials (7 core + 2 seasonal), 12 lash & brow, 6 body treatments, 8 add-ons = **57 services**, plus 6 packages. "Beyond BodyWrap" legitimately appears in BOTH body treatments and packages on the old site — keep it in both (one `service`, one `servicePackage`; distinct `_id`s).

**Rewrite rules:**
1. Keep every fact (price, duration, what's included) exactly as the source states it. Prices are data (`prices[]`), never prose.
2. `benefit` = one sentence, ≤120 chars, benefit-led, no price/duration.
3. `description` = 1–2 short paragraphs, warm second person, typos fixed. Where the source has none (most waxing line items), omit `description` — the menu row stands alone.
4. Care guidance (pre-care, post-care, maintenance, "please note") belongs to the CATEGORY (`preCare`/`postCare`), not to individual services — except service-specific notes like the Brazilian re-book advice, which stay in that service's `description`.
5. Education content ("What Is A Lash Lift?" etc.) becomes the category's `educationBlocks`, headings rewritten as questions where they aren't already.
6. Variant pricing uses labeled `prices` entries, e.g. Bikini/Brazilian Facial → `[ { label: "Bikini", amount: 70 }, { label: "Brazilian", amount: 85 } ]`.
7. `order` follows the source page's order. `featured: true` for each category's "#1" service named at the bottom of each source page (Brazilian; Power Hour; Brow Lamination with Brow Shaping; Brazilian Facial; Warm Paraffin Hand Treatment). The old site also flags Beach Body as "#1 Package" — `servicePackage` has no featured field, so give it `order: 1` instead.
8. Seasonal facials get `seasonal: true`.

- [ ] **Step 1: Write the category documents** — complete example for one category; author the other four (facials, lash-and-brow, body-treatments, add-ons) from their source files following the same shape:

```ts
import type { SanityClient } from "@sanity/client";
import { richText, uploadImage } from "./helpers";

export async function buildServiceContent( client: SanityClient ) {
  const categories = [
    {
      _id: "category-hair-removal",
      _type: "serviceCategory",
      title: "Hair Removal & Waxing",
      slug: { _type: "slug", current: "hair-removal" },
      menuLabel: "Hair Removal",
      order: 1,
      isAddOnCategory: false,
      seoTitle: "Waxing & Hair Removal in Seattle",
      seoDescription:
        "Expert waxing in Seattle — brows to Brazilians, with a \"no hair left behind\" touch. See prices and book your appointment online.",
      intro: richText( [
        "From a quick brow cleanup to a full Brazilian, every wax here is quick, thorough, and as comfortable as we can make it. Prices below — pick your service and book in minutes.",
      ] ),
      educationBlocks: [],
      preCare: richText( [
        "Taking an anti-inflammatory (like ibuprofen) twenty minutes before your service helps reduce discomfort.",
        "Skip self-tanners, body sprays, deodorant, and other topical creams before your appointment.",
        "If you've been shaving, allow 2–3 weeks of growth — about a quarter inch — for a clean removal.",
        "Exfoliate the area gently 24 hours beforehand to clear dead skin cells, and wear loose, comfortable clothing to prevent irritation afterward.",
      ] ),
      postCare: richText( [
        "For 48 hours after hair removal: no tanning, sunbathing, hot tubs, or saunas — a fresh layer of skin burns easily. No hot baths or exercise for 2 hours after your treatment.",
        "If your skin feels sensitive, a cold compress or hydrocortisone cream calms redness and irritation. Resume gentle daily exfoliation 48 hours after your treatment.",
        "Plan to come back every 3–5 weeks. Regular maintenance lets your skin acclimate, slows regrowth, and makes each visit more comfortable than the last.",
        "Please note: epilation during your period may heighten discomfort, and sensitive skin can experience minor breakouts. If you notice signs of infection, have it evaluated by a doctor promptly.",
      ] ),
      heroImage: await uploadImage( client, "docs/content-audit/images/9833A5C9-9F7E-47CB-980A-219960F3B827_1_105_c.jpeg", "Esthetician applying a wax strip during a leg waxing service" ),
    },
    // ... category-facials (order 2), category-lash-and-brow (order 3),
    // category-body-treatments (order 4), category-add-ons (order 5, isAddOnCategory: true)
    // authored the same way from docs/content-audit/*.txt
  ];
```

Category SEO titles to use: `"Custom Facials in Seattle"`, `"Lash Lifts & Brow Services in Seattle"`, `"Body Treatments & Wraps in Seattle"`, `"Service Add-Ons"` (add-ons category has no standalone page but keeps fields valid). The facials category `intro` must retain the all-natural/cruelty-free product story from `facials.txt`; its `postCare` carries the "don't freak out about purging" note rewritten warmly. Lash & brow education blocks: "What is a lash lift?", "What is henna?", "What is tinting?", "What is brow lamination?" — bodies rewritten from `lash-and-brow.txt`.

- [ ] **Step 2: Write the service documents** — two fully-worked examples; author all remaining ~59 the same way:

```ts
  const services = [
    {
      _id: "service-brazilian",
      _type: "service",
      name: "Brazilian",
      slug: { _type: "slug", current: "brazilian" },
      category: { _type: "reference", _ref: "category-hair-removal" },
      order: 21,
      prices: [ { _key: "base", amount: 65 } ],
      benefit: "Completely smooth or styled your way — happy trail and tail feathers included.",
      description: richText( [
        "Go completely bare, or keep a neat triangle, strip, or square — the style is up to you. Happy trail and tail feathers are always included.",
        "Rebook a Maintenance Brazilian within 3–5 weeks: regular maintenance keeps discomfort down and results smooth.",
      ] ),
      featured: true,
      seasonal: false,
    },
    {
      _id: "service-power-hour",
      _type: "service",
      name: "Power Hour",
      slug: { _type: "slug", current: "power-hour" },
      category: { _type: "reference", _ref: "category-facials" },
      order: 2,
      prices: [ { _key: "base", amount: 90 } ],
      durationMinutes: 60,
      benefit: "A full hour of custom facial care — neck and décolleté included.",
      featured: true,
      seasonal: false,
    },
    // ... all remaining services from the five source files, in page order
  ];
```

Every `prices` array entry needs a `_key` (use the label, or `"base"` when unlabeled). Give each document a deterministic `_id` of `service-<slug>`.

- [ ] **Step 3: Write the package documents** — one worked example; author the other five (`Beyond BodyWrap`, `Modern Man`, `Pampered Pregnancy`, `Teen Time`, `Up Grade Hour`) from `packages.txt`:

```ts
  const packages = [
    {
      _id: "package-beach-body",
      _type: "servicePackage",
      name: "Beach Body",
      slug: { _type: "slug", current: "beach-body" },
      order: 1,
      prices: [ { _key: "brazilian", label: "Brazilian", amount: 120 }, { _key: "manzilian", label: "Manzilian", amount: 130 } ],
      durationMinutes: 60,
      benefit: "Beach-ready from wax to glow: your choice of Brazilian or Manzilian plus a full-body exfoliation.",
      description: richText( [
        "Stay beach ready. Start with your choice of a Brazilian or Manzilian wax, then unwind with a full-body dry-brush exfoliation finished with rich body butter massaged into the skin.",
      ] ),
    },
    // ... remaining five packages
  ];

  return [ ...categories, ...services, ...packages ];
}
```

Also include the "package names are just names — book any service for any human you'd like" line as the closing paragraph of the packages page intro (Task 10 hardcodes the page heading; this sentence lives in the first package page section — put it in `deal`-free static copy in `packages.astro`, noted there).

- [ ] **Step 4: Run the full seed and verify**

Run: `make seed`
Expected: `Seeded 84 documents into production` (16 from Task 5 + 5 categories + 57 services + 6 packages). If your service count differs, recount against the source files — every priced line item on the old site must exist as a document (variant pairs count once).
Spot-check in Studio: Brazilian shows $65 + featured; Bikini/Brazilian Facial shows two labeled prices.

- [ ] **Step 5: Commit**

```bash
git add scripts && git commit -m "feat: seed all services, categories, and packages with rewritten copy"
```

---

### Task 7: Design system + base layout (Layout, BaseHead, Nav, Footer, LocalBusiness JSON-LD)

**Files:**
- Create: `src/styles/global.css` (replace placeholder), `src/layouts/Layout.astro`, `src/components/BaseHead.astro`, `src/components/Nav.astro`, `src/components/Footer.astro`, `src/components/JsonLd.astro`, `src/lib/format.ts`, `public/favicon.svg`
- Modify: `src/pages/index.astro` (wrap placeholder in Layout)

**Interfaces:**
- Consumes: `getSiteSettings`, types from Task 4.
- Produces: `Layout` props `{ title: string; description: string; settings: SiteSettings }` — every page fetches settings itself and passes them down (build-time only, so the duplicate fetches are cheap and keep pages self-contained). `JsonLd` props `{ data: object }`. `src/lib/format.ts` exports `formatPrice( variants: PriceVariant[] ): string` (e.g. `"$65"`, `"$70 / $85"`) and `formatDuration( minutes: number ): string` (`"50 min"`). `Nav`/`Footer` consume `settings` prop.

**Read the `frontend-design:frontend-design` skill before styling** — it governs the aesthetic execution; the constraints below are the contract.

- [ ] **Step 1: Write `src/styles/global.css`** — the full theme. Complete custom-property contract (values are final; components must use only these tokens, no raw hex in components):

```css
/* Fontsource imports happen in BaseHead via JS imports; this file is tokens + base. */
:root {
  /* Palette — modern organic spa */
  --color-cream: #faf6f0;        /* page background */
  --color-ivory: #fffdf9;        /* card background */
  --color-espresso: #3b2f2a;     /* primary text */
  --color-bark: #6b5d54;         /* secondary text */
  --color-sage: #7c8b6f;         /* primary accent (buttons, links) */
  --color-sage-deep: #5a6950;    /* hover / active — AA on cream */
  --color-terracotta: #c47e5a;   /* secondary accent (highlights, deals) */
  --color-blush: #f3e5dc;        /* soft section tint */
  --color-line: #e5dcd1;         /* borders, dividers */

  --font-display: "Fraunces Variable", Georgia, serif;
  --font-body: "Inter Variable", system-ui, sans-serif;

  /* Type scale (fluid) */
  --text-xs: 0.8rem;
  --text-sm: 0.9rem;
  --text-base: 1.0625rem;
  --text-lg: clamp(1.15rem, 1rem + 0.6vw, 1.35rem);
  --text-xl: clamp(1.4rem, 1.2rem + 1vw, 1.8rem);
  --text-2xl: clamp(1.9rem, 1.5rem + 2vw, 2.8rem);
  --text-hero: clamp(2.4rem, 1.8rem + 3vw, 4rem);

  --space-1: 0.25rem; --space-2: 0.5rem; --space-3: 1rem;
  --space-4: 1.5rem; --space-5: 2.5rem; --space-6: 4rem; --space-7: 6rem;

  --radius-card: 14px;
  --radius-pill: 999px;
  --shadow-card: 0 2px 16px rgb(59 47 42 / 0.07);
  --content-max: 72rem;
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
body {
  margin: 0;
  background: var(--color-cream);
  color: var(--color-espresso);
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: 1.65;
}
h1, h2, h3 { font-family: var(--font-display); font-weight: 550; line-height: 1.15; text-wrap: balance; }
h1 { font-size: var(--text-2xl); }
h2 { font-size: var(--text-xl); }
h3 { font-size: var(--text-lg); }
a { color: var(--color-sage-deep); }
a:hover { color: var(--color-espresso); }
img { max-width: 100%; height: auto; display: block; }
:focus-visible { outline: 3px solid var(--color-terracotta); outline-offset: 2px; }

.container { max-width: var(--content-max); margin-inline: auto; padding-inline: var(--space-4); }
.section { padding-block: var(--space-6); }
.button {
  display: inline-block; padding: 0.8em 1.8em; border-radius: var(--radius-pill);
  background: var(--color-sage-deep); color: var(--color-ivory);
  font-weight: 600; text-decoration: none; border: none; cursor: pointer;
  transition: background 150ms ease;
}
.button:hover { background: var(--color-espresso); color: var(--color-ivory); }
.button--outline { background: transparent; color: var(--color-sage-deep); box-shadow: inset 0 0 0 2px var(--color-sage-deep); }
.button--outline:hover { background: var(--color-sage-deep); color: var(--color-ivory); }
.card {
  background: var(--color-ivory); border: 1px solid var(--color-line);
  border-radius: var(--radius-card); box-shadow: var(--shadow-card);
}
.eyebrow {
  font-size: var(--text-xs); font-weight: 700; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--color-terracotta);
}
.visually-hidden {
  position: absolute; width: 1px; height: 1px; margin: -1px;
  clip-path: inset(50%); overflow: hidden; white-space: nowrap;
}
```

Verify contrast before committing: `--color-sage-deep` on `--color-cream`, `--color-bark` on `--color-ivory`, and button text combinations must all pass WCAG AA (4.5:1 for body text, 3:1 for large text). Check with a contrast calculation, adjust the lightness values if any pair fails, and note the final ratios in the commit message.

- [ ] **Step 2: Write `src/lib/format.ts`**

```ts
import type { PriceVariant } from "./sanity";

export function formatPrice( variants: PriceVariant[] ): string {
  if( !variants.length ) throw new Error( "formatPrice called with no price variants" );
  return variants.map( ( variant ) => `$${variant.amount}` ).join( " / " );
}

export function formatPriceLabels( variants: PriceVariant[] ): string | undefined {
  const labels = variants.map( ( variant ) => variant.label ).filter( ( label ): label is string => Boolean( label ) );
  return labels.length ? labels.join( " / " ) : undefined;
}

export function formatDuration( minutes: number ): string {
  return `${minutes} min`;
}
```

- [ ] **Step 3: Write `src/components/JsonLd.astro`**

```astro
---
interface Props {
  data: object;
}
const { data } = Astro.props;
---
<script type="application/ld+json" set:html={ JSON.stringify( data ) } />
```

- [ ] **Step 4: Write `src/components/BaseHead.astro`**

```astro
---
import "@fontsource-variable/fraunces";
import "@fontsource-variable/inter";
import "../styles/global.css";
import type { SiteSettings } from "../lib/sanity";
import { urlFor } from "../lib/image";
import JsonLd from "./JsonLd.astro";

interface Props {
  title: string;
  description: string;
  settings: SiteSettings;
}
const { title, description, settings } = Astro.props;
const canonicalUrl = new URL( Astro.url.pathname, Astro.site );
const ogImageUrl = settings.logo ? urlFor( settings.logo ).width( 1200 ).height( 630 ).fit( "crop" ).url() : undefined;

const localBusiness = {
  "@context": "https://schema.org",
  "@type": "DaySpa",
  name: settings.siteTitle,
  description: settings.siteDescription,
  telephone: settings.phoneE164,
  url: String( Astro.site ),
  image: ogImageUrl,
  priceRange: settings.priceRange,
  address: {
    "@type": "PostalAddress",
    streetAddress: settings.address.street,
    addressLocality: settings.address.city,
    addressRegion: settings.address.state,
    postalCode: settings.address.zip,
    addressCountry: "US",
  },
  geo: { "@type": "GeoCoordinates", latitude: settings.geo.lat, longitude: settings.geo.lng },
  sameAs: Object.values( settings.socialLinks ?? {} ).filter( Boolean ),
};
---
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>{ title }</title>
<meta name="description" content={ description } />
<link rel="canonical" href={ canonicalUrl } />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="sitemap" href="/sitemap-index.xml" />
<meta property="og:type" content="website" />
<meta property="og:title" content={ title } />
<meta property="og:description" content={ description } />
<meta property="og:url" content={ canonicalUrl } />
{ ogImageUrl && <meta property="og:image" content={ ogImageUrl } /> }
<meta name="twitter:card" content="summary_large_image" />
<JsonLd data={ localBusiness } />
```

- [ ] **Step 5: Write `src/components/Nav.astro`** — sticky header: brand mark linking home (the `settings.logo` image when present, else `settings.siteTitle` as styled display-serif text — the seed provides no logo, so the text path is the one that ships), links `Services` (CSS-hover/focus dropdown of the four non-add-on categories + "All Services"), `Packages & Deals` → `/packages/`, `About` → `/about/`, `FAQ` → `/faq/`, `Contact` → `/contact/`, utility row with `Gift Cards` (external, `settings.giftCardUrl`), `Shop` (external, rendered only if `settings.shopUrl`), phone link, and a `.button` "Book Now" → `settings.bookingUrl`. Mobile: hamburger `<button aria-expanded>` toggling a full-width menu via ~10 lines of inline `<script>`; menu is plain stacked links (no dropdown nesting on mobile). If `settings.firstVisitOffer` is set, render it as a slim announcement bar above the header. Fetch categories inside the component with `getServiceCategories()` and filter out `isAddOnCategory`. All external links get `rel="noopener"`. Complete code is the executor's to write within these constraints; keep it under ~120 lines including styles (scoped `<style>`).

- [ ] **Step 6: Write `src/components/Footer.astro`** — three columns: (1) logo + tagline + social links; (2) NAP block — business name, full address, phone `tel:` link, hours note, all as plain text matching `siteSettings` exactly, wrapped in `<address>`; (3) quick links (all nav pages + Gift Cards + Shop + Terms). Bottom line: `© 2017–{currentYear} Treat YourSelf Studios`. Consumes `settings` prop.

- [ ] **Step 7: Write `src/layouts/Layout.astro`**

```astro
---
import BaseHead from "../components/BaseHead.astro";
import Footer from "../components/Footer.astro";
import Nav from "../components/Nav.astro";
import type { SiteSettings } from "../lib/sanity";

interface Props {
  title: string;
  description: string;
  settings: SiteSettings;
}
const { title, description, settings } = Astro.props;
---
<!doctype html>
<html lang="en">
  <head>
    <BaseHead title={ title } description={ description } settings={ settings } />
  </head>
  <body>
    <a class="visually-hidden" href="#main">Skip to content</a>
    <Nav settings={ settings } />
    <main id="main">
      <slot />
    </main>
    <Footer settings={ settings } />
  </body>
</html>
```

- [ ] **Step 8: Write `public/favicon.svg`** — a simple monogram: cream circle, espresso "TY" in the display serif stack. Inline SVG, no external refs.

- [ ] **Step 9: Update `src/pages/index.astro`** to use the layout (still placeholder content — real home page is Task 8):

```astro
---
import Layout from "../layouts/Layout.astro";
import { getSiteSettings } from "../lib/sanity";

const settings = await getSiteSettings();
---
<Layout title="Treat YourSelf Studios" description={ settings.siteDescription } settings={ settings }>
  <section class="section container"><h1>Home page lands in Task 8</h1></section>
</Layout>
```

- [ ] **Step 10: Verify**

Run: `make check && grep -o 'application/ld+json' dist/index.html | wc -l && grep -o '<title>[^<]*</title>' dist/index.html`
(Occurrence counts always use `grep -o … | wc -l`, never `grep -c` — built HTML can be a single line, and `grep -c` counts lines.)
Expected: build green; at least 1 JSON-LD block; title renders. Also `grep -o '3902 S Ferdinand' dist/index.html` → NAP present in footer.

- [ ] **Step 11: Commit**

```bash
git add -A && git commit -m "feat: add design system, base layout, nav, footer, LocalBusiness JSON-LD"
```

---

### Task 8: Home page

**Files:**
- Create: `src/components/Hero.astro`, `src/components/CategoryCard.astro`, `src/components/DealBanner.astro`, `src/components/TestimonialCard.astro`, `src/components/GiftCardCallout.astro`, `src/components/HoursLocation.astro`, `src/components/PortableText.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `getSiteSettings`, `getHomePage`, `getServiceCategories`, `getDeals`, `getTestimonials`; `urlFor`; Layout from Task 7.
- Produces: `PortableText.astro` with props `{ value: PortableText }` (thin wrapper around `astro-portabletext`'s `PortableText` component) — reused by every later page. `CategoryCard` props `{ category: ServiceCategory }`; `TestimonialCard` props `{ testimonial: Testimonial }`; `DealBanner` props `{ deals: Deal[] }`; `Hero` props `{ homePage: HomePage; bookingUrl: string }`; `HoursLocation` props `{ settings: SiteSettings }`; `GiftCardCallout` props `{ giftCardUrl: string }`.

- [ ] **Step 1: Write `src/components/PortableText.astro`**

```astro
---
import { PortableText as PortableTextRenderer } from "astro-portabletext";
import type { PortableText as PortableTextValue } from "../lib/sanity";

interface Props {
  value: PortableTextValue;
}
const { value } = Astro.props;
---
<PortableTextRenderer value={ value } />
```

- [ ] **Step 2: Build the home page** in this section order (each section a component, composed in `index.astro`):
  1. `Hero` — full-width warm image (Sanity, `urlFor(...).width(1600)` with `srcset` widths 800/1200/1600, `fetchpriority="high"` and NO `loading="lazy"` since it's the LCP element, explicit width/height), `heroHeading` as `h1`, `heroSubheading`, primary "Book Now" button + secondary "View Services" `.button--outline` → `/services/`
  2. Welcome — `welcomeHeading` + `PortableText welcomeBody`, eyebrow "Welcome"
  3. Service categories — grid of `CategoryCard` (image, title, 1-line teaser from `seoDescription`, link `/services/{slug}/`), excluding `isAddOnCategory`
  4. `DealBanner` — blush-tinted strip listing the three deals compactly, link → `/packages/#deals`
  5. Testimonials — horizontal row of 3 `TestimonialCard` (quote, attribution + location, decorative quotation mark)
  6. `GiftCardCallout` — card: "Give the gift of self-care", outbound button to Square gift cards; image side: copy `docs/content-audit/images/IMG_4750.jpg` to `public/images/gift-cards.jpg` and render it (it's the studio's own gift-card box photo)
  7. `HoursLocation` — address block, "By appointment only", phone, "Get Directions" link to `https://maps.google.com/?q=3902+S+Ferdinand+St+Unit+101+Seattle+WA+98118` (build the query string from `settings.address` fields, URL-encoded — never hardcode)

All images from Sanity get explicit `width`/`height` attributes and below-the-fold ones `loading="lazy"`. Page title/description come from `homePage.seoTitle`/`homePage.seoDescription` (title suffixed ` | Treat YourSelf Studios` in the page, not the layout).

- [ ] **Step 3: Verify**

Run: `make check && grep -o '<h1[^>]*>[^<]*' dist/index.html && grep -o 'squareup.com' dist/index.html | wc -l`
Expected: exactly one `h1` (the hero heading); ≥2 Square link occurrences (booking + gift card). View `make preview` at mobile width 375px and desktop 1280px — no horizontal scroll, hero readable. **Do not start a second dev server — the user keeps one running; ask them to check visuals there.**

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: build home page"
```

---

### Task 9: Services overview + category pages

**Files:**
- Create: `src/pages/services/index.astro`, `src/pages/services/[slug].astro`, `src/components/ServiceMenu.astro`, `src/components/ServiceRow.astro`, `src/components/CareAccordion.astro`, `src/components/BookNowCta.astro`

**Interfaces:**
- Consumes: `getServiceCategories`, `getServicesByCategory`, `getAllServices`, `formatPrice`, `formatDuration`, `PortableText.astro`, `JsonLd.astro`, Layout.
- Produces: `ServiceMenu` props `{ services: Service[]; headingId: string }` (renders `ServiceRow` list, splitting `seasonal` services under a "Seasonal" subheading); `ServiceRow` props `{ service: Service }`; `CareAccordion` props `{ label: string; content: PortableText }`; `BookNowCta` props `{ bookingUrl: string }`.

- [ ] **Step 1: Write `src/components/ServiceRow.astro`** — the workhorse. A definition-list-style row:

```astro
---
import { formatDuration, formatPrice } from "../lib/format";
import type { Service } from "../lib/sanity";
import PortableText from "./PortableText.astro";

interface Props {
  service: Service;
}
const { service } = Astro.props;
const hasDetail = Boolean( service.description?.length || service.priceNote );
---
<div class:list={ [ "service-row", { "service-row--featured": service.featured } ] }>
  <div class="service-row__header">
    <h3 class="service-row__name">
      { service.name }
      { service.featured && <span class="service-row__badge">Client favorite</span> }
    </h3>
    <span class="service-row__dots" aria-hidden="true"></span>
    <span class="service-row__price">
      { formatPrice( service.prices ) }
      { service.durationMinutes && <span class="service-row__duration"> · { formatDuration( service.durationMinutes ) }</span> }
    </span>
  </div>
  <p class="service-row__benefit">{ service.benefit }</p>
  { hasDetail && (
    <details class="service-row__detail">
      <summary>Details</summary>
      { service.description && <PortableText value={ service.description } /> }
      { service.priceNote && <p class="service-row__note">{ service.priceNote }</p> }
    </details>
  ) }
</div>
<style>
  .service-row { padding-block: var(--space-3); border-bottom: 1px solid var(--color-line); }
  .service-row__header { display: flex; align-items: baseline; gap: var(--space-2); }
  .service-row__name { font-size: var(--text-lg); margin: 0; }
  .service-row__badge {
    font-family: var(--font-body); font-size: var(--text-xs); font-weight: 700;
    color: var(--color-terracotta); text-transform: uppercase; letter-spacing: 0.08em;
    margin-left: var(--space-2);
  }
  .service-row__dots { flex: 1; border-bottom: 2px dotted var(--color-line); }
  .service-row__price { font-weight: 650; white-space: nowrap; }
  .service-row__duration { color: var(--color-bark); font-weight: 400; }
  .service-row__benefit { margin: var(--space-1) 0 0; color: var(--color-bark); font-size: var(--text-sm); }
  .service-row__detail summary { cursor: pointer; color: var(--color-sage-deep); font-size: var(--text-sm); }
  .service-row__note { font-style: italic; font-size: var(--text-sm); }
</style>
```

When prices have labels (`formatPriceLabels` returns a value), render the labels under the price, e.g. `Bikini / Brazilian` under `$70 / $85` — add that to the price `<span>` as a small block.

- [ ] **Step 2: Write `ServiceMenu.astro`, `CareAccordion.astro`, `BookNowCta.astro`**

`ServiceMenu`: `<section aria-labelledby={ headingId }>` wrapping non-seasonal rows then, if any seasonal exist, `<h3>Seasonal</h3>` + seasonal rows.

`CareAccordion`: a `.card`-styled `<details>` with `<summary>{ label }</summary>` + `PortableText`. Zero JS.

`BookNowCta`: a `.button` link; on viewports ≤ 640px it becomes `position: fixed; bottom: 0` full-width bar (safe-area padding). Rendered once per category page.

- [ ] **Step 3: Write `src/pages/services/index.astro`** — overview: h1 "Services", intro sentence, then one `.card` per non-add-on category (hero image, title, intro excerpt, "View menu & prices" link `/services/{slug}/`), plus a final smaller card linking to `/packages/` for add-ons & packages. Title: `Spa Services & Prices in Seattle | Treat YourSelf Studios`; description summarizing categories.

- [ ] **Step 4: Write `src/pages/services/[slug].astro`**

```astro
---
import BookNowCta from "../../components/BookNowCta.astro";
import CareAccordion from "../../components/CareAccordion.astro";
import JsonLd from "../../components/JsonLd.astro";
import PortableText from "../../components/PortableText.astro";
import ServiceMenu from "../../components/ServiceMenu.astro";
import Layout from "../../layouts/Layout.astro";
import { getServiceCategories, getServicesByCategory, getSiteSettings } from "../../lib/sanity";
import type { Service, ServiceCategory } from "../../lib/sanity";

export async function getStaticPaths() {
  const categories = await getServiceCategories();
  return categories
    .filter( ( category ) => !category.isAddOnCategory )
    .map( ( category ) => ({ params: { slug: category.slug.current }, props: { category } }) );
}

interface Props {
  category: ServiceCategory;
}
const { category } = Astro.props;
const settings = await getSiteSettings();
const services: Service[] = await getServicesByCategory( category.slug.current );

if( !services.length ) {
  throw new Error( `No services found for category "${category.title}" — seed data incomplete or reference broken.` );
}

const servicesJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: services.map( ( service, index ) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "Service",
      name: service.name,
      description: service.benefit,
      provider: { "@type": "DaySpa", name: settings.siteTitle },
      offers: service.prices.map( ( price ) => ({
        "@type": "Offer",
        price: price.amount,
        priceCurrency: "USD",
        ...( price.label ? { name: price.label } : {} ),
      }) ),
    },
  }) ),
};
---
<Layout title={ category.seoTitle } description={ category.seoDescription } settings={ settings }>
  <article class="container section">
    <header>
      <p class="eyebrow">Services</p>
      <h1>{ category.title }</h1>
      <PortableText value={ category.intro } />
    </header>

    { category.educationBlocks?.map( ( block ) => (
      <CareAccordion label={ block.heading } content={ block.body } />
    ) ) }

    <ServiceMenu services={ services } headingId={ `menu-${category.slug.current}` } />

    { category.preCare && <CareAccordion label="Before your appointment" content={ category.preCare } /> }
    { category.postCare && <CareAccordion label="Aftercare & maintenance" content={ category.postCare } /> }

    <BookNowCta bookingUrl={ settings.bookingUrl } />
  </article>
  <JsonLd data={ servicesJsonLd } />
</Layout>
```

- [ ] **Step 5: Verify**

Run: `make check`, then:
- `ls dist/services/` → `index.html hair-removal facials lash-and-brow body-treatments` (4 category dirs — add-ons excluded)
- `grep -o 'service-row__name' dist/services/hair-removal/index.html | wc -l` → 22
- `grep -o '"@type":"Service"' dist/services/facials/index.html | wc -l` → 9
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: build services overview and category pages with Service JSON-LD"
```

---

### Task 10: Packages & Deals page

**Files:**
- Create: `src/pages/packages.astro`, `src/components/PackageCard.astro`

**Interfaces:**
- Consumes: `getServicePackages`, `getDeals`, `getServicesByCategory( "add-ons" )`, `formatPrice`, `ServiceRow`, `PortableText`, Layout.
- Produces: `/packages/` with anchors `#packages`, `#add-ons`, `#deals` (DealBanner on home links to `#deals`).

- [ ] **Step 1: Write `PackageCard.astro`** — `.card` with name, `formatPrice` (+ labels line when variants), duration, benefit line, `PortableText` description. Grid 2-up desktop / 1-up mobile.

- [ ] **Step 2: Write `packages.astro`** — h1 "Packages & Deals". Section `#packages`: intro paragraph including the owner's line rewritten: "Package names are just names — feel free to book any service you'd like, for any human you'd like." then `PackageCard` grid. Section `#add-ons`: "Service Add-Ons" heading, one-line intro ("Add any of these to a facial or body treatment"), `ServiceRow` list from the add-ons category. Section `#deals`: "Standing Deals" heading + the three deals as cards (title, details, fine print small). Title: `Spa Packages & Deals in Seattle | Treat YourSelf Studios`.

- [ ] **Step 3: Verify**

Run: `make check && grep -o 'id="deals"' dist/packages/index.html | wc -l && grep -o 'service-row__name' dist/packages/index.html | wc -l`
Expected: 1 deals anchor; 8 add-on rows.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: build packages and deals page"
```

---

### Task 11: About + FAQ pages

**Files:**
- Create: `src/pages/about.astro`, `src/pages/faq.astro`, `src/components/TeamMemberCard.astro`, `src/components/FaqItem.astro`

**Interfaces:**
- Consumes: `getTeamMembers`, `getTestimonials`, `getFaqs`, `PortableText`, `TestimonialCard` (Task 8), `JsonLd`, Layout.
- Produces: `/about/`, `/faq/` with `FAQPage` JSON-LD.

- [ ] **Step 1: Write `about.astro`** — h1 "Meet Your Estheticians". Studio story section (2 short paragraphs rewritten from the home.txt welcome + appointment-only positioning, hardcoded in the page — it's page furniture, not owner-editable data). `TeamMemberCard` per member (photo left / bio right, stacking on mobile). Then "Kind words" section: all testimonials as `TestimonialCard` grid with `Review` JSON-LD:

```ts
const reviewsJsonLd = {
  "@context": "https://schema.org",
  "@type": "DaySpa",
  name: settings.siteTitle,
  review: testimonials.map( ( testimonial ) => ({
    "@type": "Review",
    reviewBody: testimonial.quote,
    author: { "@type": "Person", name: testimonial.attribution },
  }) ),
};
```

Title: `About Us — Meet the Team | Treat YourSelf Studios`.

- [ ] **Step 2: Write `faq.astro`** — h1 "Frequently Asked Questions", `FaqItem` per FAQ (a `<details>` card: `<summary>` question, PortableText answer), plus a closing card "Still have a question?" linking to `/contact/` and the phone number. `FAQPage` JSON-LD:

```ts
import { toPlainText } from "astro-portabletext";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map( ( faq ) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: toPlainText( faq.answer ) },
  }) ),
};
```

(If `toPlainText` isn't exported by the installed `astro-portabletext` version, write a 6-line local `portableTextToPlain( blocks )` in `src/lib/format.ts` that joins span texts — check the package's exports first.)

Title: `FAQ — Policies & What to Expect | Treat YourSelf Studios`.

- [ ] **Step 3: Verify**

Run: `make check && grep -o 'FAQPage' dist/faq/index.html | wc -l && grep -o '"@type":"Review"' dist/about/index.html | wc -l`
Expected: 1 and 5.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: build about and FAQ pages with Review and FAQPage JSON-LD"
```

---

### Task 12: Contact + Terms pages

**Files:**
- Create: `src/pages/contact.astro`, `src/pages/terms.astro`, `src/components/ContactForm.astro`, `src/components/LocationMap.astro`

**Interfaces:**
- Consumes: `getSiteSettings`, Layout; env `PUBLIC_FORMSPREE_ENDPOINT` (asserted in `ContactForm`).
- Produces: `/contact/`, `/terms/`.

- [ ] **Step 1 [HUMAN]: Formspree setup** — ask the user to create a free Formspree form (destination: the studio's email), then write `PUBLIC_FORMSPREE_ENDPOINT=https://formspree.io/f/<formId>` into `.env` themselves and add it as a GitHub Actions secret later (Task 15). The form ID is not sensitive (it's in the shipped HTML), so it may appear in chat if the user pastes it — but the flow shouldn't require it.

- [ ] **Step 2: Write `ContactForm.astro`**

```astro
---
const PUBLIC_FORMSPREE_ENDPOINT = import.meta.env.PUBLIC_FORMSPREE_ENDPOINT;
if( !PUBLIC_FORMSPREE_ENDPOINT ) throw new Error( "Missing PUBLIC_FORMSPREE_ENDPOINT env var" );

interface Props {
  phone: string;
  phoneE164: string;
  bookingUrl: string;
}
const { phone, phoneE164, bookingUrl } = Astro.props;
---
<form class="card contact-form" method="POST" action={ PUBLIC_FORMSPREE_ENDPOINT }>
  <label for="contact-name">Name</label>
  <input id="contact-name" name="name" type="text" autocomplete="name" required />
  <label for="contact-email">Email</label>
  <input id="contact-email" name="email" type="email" autocomplete="email" required />
  <label for="contact-message">How can we help?</label>
  <textarea id="contact-message" name="message" rows="5" required></textarea>
  <button class="button" type="submit">Send message</button>
  <p class="contact-form__status" role="status" aria-live="polite"></p>
  <p class="contact-form__fallback" hidden>
    Something went wrong sending your message. Call us at <a href={ `tel:${phoneE164}` }>{ phone }</a>
    or <a href={ bookingUrl } rel="noopener">book directly</a>.
  </p>
</form>
<script>
  const form = document.querySelector( ".contact-form" );
  if( form instanceof HTMLFormElement ) {
    form.addEventListener( "submit", async ( submitEvent ) => {
      submitEvent.preventDefault();
      const statusLine = form.querySelector( ".contact-form__status" );
      const fallbackLine = form.querySelector( ".contact-form__fallback" );
      if( !( statusLine instanceof HTMLElement ) || !( fallbackLine instanceof HTMLElement ) ) return;
      statusLine.textContent = "Sending…";
      try {
        const response = await fetch( form.action, {
          method: "POST",
          body: new FormData( form ),
          headers: { Accept: "application/json" },
        } );
        if( !response.ok ) throw new Error( `Formspree responded ${response.status}` );
        form.reset();
        statusLine.textContent = "Thanks! Your message is on its way — we'll get back to you soon.";
        fallbackLine.hidden = true;
      } catch {
        statusLine.textContent = "";
        fallbackLine.hidden = false;
      }
    } );
  }
</script>
```

(Plain `method="POST" action=…` keeps the form functional even with JS disabled — Formspree shows its hosted thank-you page in that case.)

- [ ] **Step 3: Write `LocationMap.astro`** — a `.card` containing an accessible address block and a "Get Directions" `.button--outline` linking to the Google Maps query URL built from `settings.address`. Image: copy `docs/content-audit/images/IMG_2745.jpeg` to `public/images/studio-exterior.jpg` and render it above the address block (it's the studio's building, Columbia City Abbey — exactly what someone navigating there needs to recognize). No third-party map embeds.

- [ ] **Step 4: Write `contact.astro`** — two-column (stacking): left `ContactForm` + note "Prefer to talk? Call or text (206) 717-4843" + email link if set; right `LocationMap` + hours card ("By appointment only — book online any time" + Book Now button). Title: `Contact & Location | Treat YourSelf Studios`.

- [ ] **Step 5: Write `terms.astro`** — h1 "Terms & Conditions". Rewrite `docs/content-audit/terms-and-conditions.txt` from ALL-CAPS legalese into sentence-case sections with headings: Cancellations & Changes (24-hour notice, 50% fee), No-Shows (100% fee, 15-minute rule), Card on File (held privately), Retail Returns (store credit only). Keep every policy fact identical. Hardcoded in the page (legal copy shouldn't drift casually; owner edits go through a PR). Title: `Terms & Conditions | Treat YourSelf Studios`.

- [ ] **Step 6: Verify**

Run: `make check && grep -o 'formspree.io' dist/contact/index.html | wc -l && grep -oi 'no-show' dist/terms/index.html | wc -l`
Expected: ≥1 form action reference; ≥1 no-show mention.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: build contact and terms pages with Formspree form"
```

---

### Task 13: 404 page + legacy URL redirects

**Files:**
- Create: `src/pages/404.astro`, `src/pages/[...legacyPath].astro`, `src/lib/redirects.ts`

**Interfaces:**
- Consumes: Layout, `getSiteSettings`.
- Produces: `dist/404.html` (GitHub Pages serves it automatically); one meta-refresh page per old-site URL.

- [ ] **Step 1: Write `src/lib/redirects.ts`** — the complete old→new map (old paths from the scraped site; `&` appears literally in old paths — browsers send `%26`, GitHub Pages decodes to the literal directory name). The `home-care` target is resolved from settings at build time — when the owner sets `shopUrl` in Studio, the redirect follows automatically with no code change:

```ts
import type { SiteSettings } from "./sanity";

const LEGACY_REDIRECTS: Record<string, string> = {
  "hair-removal": "/services/hair-removal/",
  "facials": "/services/facials/",
  "lash-&-brow": "/services/lash-and-brow/",
  "body-treatments": "/services/body-treatments/",
  "packages": "/packages/",
  "service-add-ons": "/packages/#add-ons",
  "deals-&-specials": "/packages/#deals",
  "q-&-a": "/faq/",
  "personal-testimonies": "/about/",
  "terms-and-conditions": "/terms/",
};

export function legacyRedirectTargets( settings: SiteSettings ): Record<string, string> {
  return { ...LEGACY_REDIRECTS, "home-care": settings.shopUrl ?? "/contact/" };
}
```

- [ ] **Step 2: Write `src/pages/[...legacyPath].astro`**

```astro
---
import { getSiteSettings } from "../lib/sanity";
import { legacyRedirectTargets } from "../lib/redirects";

export async function getStaticPaths() {
  const settings = await getSiteSettings();
  const targets = legacyRedirectTargets( settings );
  return Object.entries( targets ).map( ( [ legacyPath, target ] ) => ({
    params: { legacyPath },
    props: { target },
  }) );
}

interface Props {
  target: string;
}
const { target } = Astro.props;
const absoluteTarget = target.startsWith( "http" ) ? target : new URL( target, Astro.site ).href;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Moved — Treat YourSelf Studios</title>
    <meta http-equiv="refresh" content={ `0; url=${absoluteTarget}` } />
    <link rel="canonical" href={ absoluteTarget } />
    <meta name="robots" content="noindex" />
  </head>
  <body>
    <p>This page has moved. <a href={ absoluteTarget }>Continue to the new page</a>.</p>
  </body>
</html>
```

- [ ] **Step 3: Write `src/pages/404.astro`** — Layout-wrapped: h1 "Page not found", friendly line, buttons to `/services/` and Book Now, link home. Title `Page Not Found | Treat YourSelf Studios`.

- [ ] **Step 4: Verify**

Run: `make check && ls "dist/lash-&-brow/" && grep -o 'url=[^"]*' "dist/q-&-a/index.html" && ls dist/404.html`
Expected: redirect dirs exist including the `&` ones; `q-&-a` points at `/faq/`; `404.html` present. Confirm the sitemap excludes redirect pages: `grep -o 'q-%26-a' dist/sitemap-0.xml | wc -l` → 0 (if they leak in, exclude the legacy paths via the sitemap integration's `filter` option in `astro.config.mjs`).

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add 404 page and legacy URL redirects"
```

---

### Task 14: CI/CD workflows + Lighthouse budgets

**Files:**
- Create: `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`, `.github/workflows/audit.yml`, `.github/workflows/nightly.yml`, `lighthouserc.json`

**Interfaces:**
- Consumes: `make check`-equivalent commands; secrets `SANITY_PROJECT_ID`, `SANITY_DATASET`, `SANITY_API_TOKEN`, `PUBLIC_FORMSPREE_ENDPOINT` (configured in Task 15).
- Produces: deploy on push-to-main / `repository_dispatch` type `sanity-content-update` / manual `workflow_dispatch` / weekly cron.

- [ ] **Step 1: Write `.github/workflows/deploy.yml`** (nw-local pattern + weekly safety-net cron)

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  repository_dispatch:
    types: [sanity-content-update]
  workflow_dispatch:
  schedule:
    # Weekly safety-net rebuild in case a Sanity webhook delivery is missed.
    # 09:43 UTC Monday — off-hour minute per GitHub's cron guidance.
    - cron: "43 9 * * 1"

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v6
      - name: Install, build, and upload site
        uses: withastro/action@v6
        env:
          SANITY_PROJECT_ID: ${{ secrets.SANITY_PROJECT_ID }}
          SANITY_DATASET: ${{ secrets.SANITY_DATASET }}
          SANITY_API_TOKEN: ${{ secrets.SANITY_API_TOKEN }}
          PUBLIC_FORMSPREE_ENDPOINT: ${{ secrets.PUBLIC_FORMSPREE_ENDPOINT }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v5
```

- [ ] **Step 2: Write `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  check:
    name: Types + lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: "22.13"
          cache: yarn
      - run: yarn install --frozen-lockfile
      # `yarn run check`, not `yarn check` — the bare form is yarn v1's built-in
      # integrity command and silently skips the package script.
      - run: yarn run check
        env:
          SANITY_PROJECT_ID: ${{ secrets.SANITY_PROJECT_ID }}
          SANITY_DATASET: ${{ secrets.SANITY_DATASET }}
          SANITY_API_TOKEN: ${{ secrets.SANITY_API_TOKEN }}
          PUBLIC_FORMSPREE_ENDPOINT: ${{ secrets.PUBLIC_FORMSPREE_ENDPOINT }}
      - run: yarn lint

  audit:
    name: Audit
    uses: ./.github/workflows/audit.yml
    secrets: inherit
```

- [ ] **Step 3: Write `.github/workflows/audit.yml`** — copy nw-local's reusable audit verbatim (build → artifact upload → sitemap xmllint job → lychee link-check job → Lighthouse job), with two changes: the env blocks use this project's four secrets, and the Lighthouse job is NOT `continue-on-error` (budgets are enforced here; a busted score should block the merge).

- [ ] **Step 4: Write `.github/workflows/nightly.yml`** — copy nw-local's verbatim (cron `27 8 * * *`, `workflow_dispatch`, calls `audit.yml` with `secrets: inherit`).

- [ ] **Step 5: Write `lighthouserc.json`** with assertions

```json
{
  "ci": {
    "collect": {
      "staticDistDir": "./dist",
      "url": [
        "/",
        "/services/hair-removal/",
        "/faq/",
        "/contact/"
      ],
      "numberOfRuns": 1
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.95 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:seo": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }]
      }
    },
    "upload": { "target": "temporary-public-storage" }
  }
}
```

- [ ] **Step 6: Verify locally** — run what CI will run: `make check` green, then `npx @lhci/cli autorun --config=lighthouserc.json` and fix anything under budget (images without dimensions and missing meta descriptions are the usual culprits).

- [ ] **Step 7: Commit**

```bash
git add .github lighthouserc.json && git commit -m "ci: add deploy, CI, and audit workflows with Lighthouse budgets"
```

---

### Task 15: README + repo/hosting/webhook launch setup

**Files:**
- Create: `README.md`
- Repo settings (GitHub UI / `gh` CLI), Sanity webhook (manage.sanity.io), DNS (owner's registrar)

**Interfaces:**
- Consumes: everything prior; `gh` CLI authenticated as the user.
- Produces: live site on GitHub Pages; content publishes trigger rebuilds.

- [ ] **Step 1: Write `README.md`** (~120 lines max — quick summary, setup, usage; details live in docs/):
  - What: marketing site for Treat YourSelf Studios (Seattle esthetics studio); Astro + Sanity + GitHub Pages; booking/payments on Square
  - Setup: clone → `make install` → copy `.env.example` to `.env` and fill it in (link to sanity.io/manage for tokens) → `make dev`
  - Commands table mirroring the Makefile help output
  - Content editing: Studio URL, publish → auto-deploy in ~2 min
  - Architecture pointer to `docs/superpowers/specs/2026-07-09-treatyourselfstudios-redesign-design.md`
  - Deployment section: workflows summary, secrets list (names only), webhook description

- [ ] **Step 2: Create the GitHub repo and push** (confirm repo name/owner with the user first; public is required for free GitHub Pages)

```bash
gh repo create treatyourselfstudios --public --source=. --push
```

- [ ] **Step 3: Configure Pages + secrets**

```bash
gh api -X POST repos/{owner}/treatyourselfstudios/pages -f build_type=workflow
```

`[HUMAN]` The user sets each secret themselves via `! gh secret set SANITY_API_TOKEN` (gh prompts for the value with hidden input — the token never enters chat). Same pattern for `SANITY_PROJECT_ID`, `SANITY_DATASET`, and `PUBLIC_FORMSPREE_ENDPOINT` (those three aren't sensitive, but one flow for all four is simplest).

- [ ] **Step 4 [HUMAN]: Sanity webhook** — walk the user through sanity.io/manage → project → API → Webhooks → Create:
  - URL: `https://api.github.com/repos/<owner>/treatyourselfstudios/dispatches`
  - Trigger on: create, update, delete (published documents); filter empty
  - HTTP method POST; headers: `Authorization: Bearer <fine-grained GitHub PAT>` and `Accept: application/vnd.github+json`. The user creates the PAT at github.com/settings/personal-access-tokens scoped to ONLY this repo; `repository_dispatch` requires the Contents read-and-write permission (verify the minimal scope against current GitHub docs at execution time).
  - Projection: `{"event_type": "sanity-content-update"}`
  - Test: publish a trivial edit in Studio → `gh run list --workflow=deploy.yml` shows a new `repository_dispatch` run.

- [ ] **Step 5 [HUMAN]: DNS cutover** — sequence it so the site is verified before the domain flips:
  1. First deploy WITHOUT `public/CNAME` (delete it temporarily in the launch PR if needed) and verify everything at `https://<owner>.github.io/treatyourselfstudios/`.
  2. When the owner is ready: restore `public/CNAME`, set the Pages custom domain (`gh api -X PUT repos/{owner}/treatyourselfstudios/pages --input - <<< '{"cname":"treatyourselfstudios.net"}'`), and the user updates DNS at the registrar — apex A records `185.199.108.153` / `185.199.109.153` / `185.199.110.153` / `185.199.111.153` (verify current IPs against GitHub Pages docs at execution time) and `www` CNAME → `<owner>.github.io`.
  3. Wait for the HTTPS cert to provision, then enable "Enforce HTTPS" in repo settings.

- [ ] **Step 6 [HUMAN]: Post-cutover** — Google Search Console: verify the domain via DNS TXT record, submit `https://treatyourselfstudios.net/sitemap-index.xml`. Confirm the Square Online store URL with the owner and set `shopUrl` in Studio Site Settings — that automatically reveals the Shop nav link and fixes the `home-care` legacy redirect on the next build. Remind the owner: keep the GoDaddy domain registration; only the website-builder subscription becomes cancellable.

- [ ] **Step 7: Commit README + open the PR**

```bash
git add README.md && git commit -m "docs: add README"
git push -u origin <branch>
gh pr create --fill
```

---

### Task 16: Pre-launch verification pass

**Files:** none created — verification only. Use the `superpowers:verification-before-completion` skill.

- [ ] **Step 1: Full local check** — `make check` green; `make seed` idempotent (run twice; the second run must neither error nor duplicate documents).
- [ ] **Step 2: Link crawl** — `npx lychee --root-dir "$(pwd)/dist" --no-progress 'dist/**/*.html'` → zero broken internal links; external Square/social links return 2xx/3xx.
- [ ] **Step 3: Rich results** — test the built HTML of `/`, one category page, `/faq/`, and `/about/` in Google's Rich Results Test (search.google.com/test/rich-results). Expected: LocalBusiness/DaySpa, Service list, FAQPage, and Review all detected with zero errors.
- [ ] **Step 4: Content parity audit** — for each file in `docs/content-audit/*.txt`, confirm every priced line item, FAQ, deal, testimonial, team member, and policy fact appears on the new site. Fast mechanical check: every `$NN` amount in `hair-removal.txt` appears in `dist/services/hair-removal/index.html`, and so on per category.
- [ ] **Step 5 [HUMAN]: Visual walkthrough** — ask the user to browse every page in their running dev server at mobile and desktop widths, click every Square outbound link, submit the contact form once (real Formspree delivery), and confirm the two team photos are correctly matched to Nichele and Saphiyah.
- [ ] **Step 6: Fix anything found, re-run the affected checks, commit fixes.**

---

## Execution Notes

- Tasks 1–7 are strictly sequential. Tasks 8–13 touch mostly disjoint files and can be parallelized after Task 8 Step 1 lands (`PortableText.astro` is consumed by Tasks 9–11); when in doubt run them sequentially — they're small.
- Never boot a dev server (`deny-dev-servers.sh` enforces this); verify with `make build` + grep assertions, and ask the user for browser checks in their running server.
- If any package version pinned in this plan no longer resolves, use the latest stable major and say so in the commit message.
- All copy decisions trace to `docs/content-audit/*.txt` plus the spec's rewrite principles. When a copy judgment call is ambiguous (tone, emphasis), make the call and flag it in the PR description for the owner's review — don't block on it.
