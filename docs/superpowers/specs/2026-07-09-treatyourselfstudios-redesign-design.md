# Treat YourSelf Studios — Website Redesign Design

**Date:** 2026-07-09
**Status:** Approved pending user review
**Replaces:** https://treatyourselfstudios.net/ (GoDaddy Website Builder)

## Overview

Rebuild treatyourselfstudios.net — the site for Treat YourSelf Studios, an
appointment-only spa/esthetics studio in West Seattle (3902 S Ferdinand St
Unit 101, Seattle WA 98118) — as a modern static site with strong UX, SEO,
and free hosting. All transactional features (booking, payments, gift cards,
retail) stay on Square. Content is owner-editable via Sanity CMS.

**Decisions locked during brainstorming:**

- Full copy rewrite (scraped copy is source material, not final text)
- Retail ("Home Care") links out to the Square Online store — no on-site cart
- Visual direction: modern organic spa (warm neutrals, sage/terracotta
  accents, serif + sans type), keeping the existing logo
- Framework: Astro (chosen over Next.js static export and Eleventy)
- Sanity CMS with webhook-triggered rebuilds, mirroring `../nw-local.com`

## Architecture

**Stack:** Astro (latest stable) + strict TypeScript + Sanity CMS. Yarn.
Structure mirrors nw-local.com:

- `src/lib/sanity.ts` — Sanity client, all GROQ queries, central data types,
  module-level env-var assertions
- `src/lib/image.ts` — Sanity image CDN URL builder
- `studio/` — Sanity Studio + document schemas, deployed to
  `*.sanity.studio` (free hosting)
- `Makefile` — env-loaded targets (`make dev`, `make build`, `make studio`,
  `make check`, `make deploy-studio`)
- `src/styles/global.css` — full theme as CSS custom properties

**Content flow:** Sanity is the single source of truth — no content files in
the repo. Pages fetch via GROQ at build time and render fully static HTML.
Zero client-side JavaScript except two tiny opt-ins — the mobile nav toggle
and contact-form submission feedback; accordions use native `<details>`.

**Owner edit flow:** Studio → edit → Publish → Sanity webhook POSTs to
GitHub's `workflow_dispatch` endpoint (fine-grained PAT, Actions read/write)
→ Actions rebuilds → live in ~2 minutes.

**Deployment:** GitHub Actions → GitHub Pages on push to `main` and on
`workflow_dispatch`. Custom domain `treatyourselfstudios.net` via `CNAME`
file + DNS at the owner's registrar (A/AAAA for apex, CNAME for `www`);
HTTPS automatic via GitHub.

**Secrets:** `SANITY_PROJECT_ID`, `SANITY_DATASET`, `SANITY_API_TOKEN`
(read-only) as Actions secrets and `.env` locally (strict — no fallbacks).
Sanity-side webhook auth uses a fine-grained GitHub PAT.

**External services (all free / already owned):**

- Square Appointments — existing booking page
  (`squareup.com/appointments/book/E92Q1CBDSF7V8/...`)
- Square Gift Cards — existing gift page
- Square Online — home-care retail store (outbound links only)
- Formspree free tier — contact form POST target (50 submissions/month)

All Square/social URLs live in the `siteSettings` document so URL changes
are owner-level edits.

**Deliberately not built:** no database, no serverless functions, no on-site
cart, no booking widget embed (link out to Square).

## Sanity Content Model

| Document type | Purpose |
|---|---|
| `service` | Name, slug, price (single or variants, e.g. Brazilian $65 / Manzilian $75), duration, category ref, benefit one-liner, detail description, featured flag, optional image |
| `serviceCategory` | Hair Removal, Facials, Lash & Brow, Body Treatments, Add-Ons: intro copy, education blocks ("What is henna?"), pre/post-care guides, display order |
| `package` | Bundled offerings: name, price (or variants), duration, description |
| `deal` | Standing promotions (15% off first visit, 10% rebook, 6th-free) |
| `faq` | Question/answer pairs, display order |
| `teamMember` | Name, role, bio, photo |
| `testimonial` | Quote, attribution, location |
| `page` | Singletons (home, about) with flexible portable-text content |
| `siteSettings` | Logo, phone, email, address, geo coordinates, hours, Square booking/gift-card/shop URLs, social links, default SEO meta |

Image fields require alt text. Content seeded by a scripted import via the
Sanity client API (~60 services/packages/add-ons, FAQs, deals, testimonials,
team bios) — no hand-entry.

## Site Structure

Current 12 flat pages become 8 focused ones:

```
/                          Home — hero + booking CTA, category cards, deals
                           banner, testimonials strip, hours/location,
                           gift card callout
/services/                 Services overview (all categories)
/services/hair-removal/    Category pages: intro + education copy, price
/services/facials/         menu, pre/post-care accordions, add-on
/services/lash-and-brow/   cross-sell, sticky Book Now (mobile)
/services/body-treatments/
/packages/                 Packages + service add-ons + standing deals
/about/                    Team bios, studio story, testimonials
/faq/                      FAQ incl. cancellation, payments, gratuity
/contact/                  Address, static map, hours, phone, contact form
/terms/                    Terms & conditions
```

Nav: **Services** (dropdown) · **Packages & Deals** · **About** · **FAQ** ·
**Contact** · **[Book Now]** button. Shop and Gift Cards are outbound Square
links in the header utility area and footer.

## Copy Rewrite

Full rewrite using scraped copy (archived in session scratchpad) as source:

- Preserve the warm personal voice and "Treat YourSelf" identity; fix typos
  and inconsistencies ("Estetician" → "Esthetician")
- Uniform service structure: benefit-led one-liner + detail paragraph +
  duration + price
- Retain all education content (lash lift, henna, lamination, pre/post-care)
  restructured as expandable sections — long-tail SEO landing content
- Headlines target local intent ("Facials in West Seattle") without keyword
  stuffing
- All rewritten copy seeds Sanity so the owner can tune afterward

## Design System

- **Palette:** warm cream/ivory base, espresso-brown text, muted sage
  primary, terracotta/blush secondary — harmonized with existing logo, as
  CSS custom properties
- **Type:** Fraunces (display serif, headings) + Inter (humanist sans,
  body), self-hosted via Fontsource
- **Imagery:** reuse the studio's ~12 real photos where quality allows; the
  one Getty stock image is dropped (GoDaddy-scoped license does not
  transfer) and replaced with owner-supplied or properly licensed imagery
- **Motion:** CSS-only transitions, `prefers-reduced-motion` respected
- **Accessibility:** semantic HTML, WCAG AA contrast, keyboard-navigable nav
  and accordions, visible focus states, required alt text

**Component inventory** (all Props typed from `src/lib/sanity.ts`):
`Layout`, `BaseHead`, `Nav`, `Footer`, `Hero`, `CategoryCard`,
`ServiceMenu`/`ServiceRow`, `PriceTag` (variant pricing), `CareAccordion`
(native `<details>`), `FaqItem`, `DealBanner`, `PackageCard`,
`TestimonialCard`, `TeamMemberCard`, `BookNowCta` (sticky on mobile service
pages), `GiftCardCallout`, `ContactForm`, `HoursTable`, `LocationMap`
(static map image linking to Google Maps — no API key, no cookies).

## SEO

**Technical:** per-page title/description from Sanity fields, canonical
URLs, OpenGraph/Twitter cards with branded share image, `@astrojs/sitemap`,
`robots.txt`, clean slugs, responsive images with explicit dimensions
(no CLS), static HTML for strong Core Web Vitals.

**Structured data (JSON-LD):**

- `LocalBusiness` (subtype `DaySpa`) sitewide: name, address, geo, phone,
  hours, price range
- `Service` + price markup generated from Sanity documents
- `FAQPage` on `/faq/`
- `Review` markup on attributed testimonials

**Local SEO:** H1s/titles target service + West Seattle/Seattle intent;
NAP in footer sitewide, matching the Google Business Profile exactly.

**Migration safety:** GitHub Pages has no server-side redirects, so each old
URL (`/hair-removal`, `/q-%26-a`, `/facials`, …) gets a minimal static page
with `<meta http-equiv="refresh">` + `rel="canonical"` to its new URL.
At launch: Google Search Console verification + sitemap submission.

**Flagged to owner (out of scope):** Google Business Profile optimization
and review generation.

## Error Handling

- **Fail loud at build time:** module-level env assertions; GROQ results
  validated against expected shape before rendering — a service missing a
  price or a broken image reference fails the build naming the offending
  document. Deploys replace the site only on green builds, so a bad Sanity
  edit blocks the next deploy rather than breaking production.
- **Runtime edge cases:** custom `404.html` with nav back to services and
  booking; contact form success/error states with phone + booking fallback
  on Formspree failure; legacy-URL redirect pages for stale inbound links.

## CI & Verification

- `ci.yml` — `astro check`, ESLint, formatter check; `make check` runs the
  identical set locally
- `deploy.yml` — build + deploy on push to `main` and `workflow_dispatch`
- `audit.yml` — Lighthouse CI with performance/accessibility/SEO budgets
- Scheduled weekly rebuild as webhook-miss safety net
- Pre-launch: crawl built `dist/` for broken internal links, validate
  JSON-LD via Google Rich Results test, mobile walkthrough of every page,
  click-test every Square outbound link
- No unit-test framework (same call as nw-local.com): types + build-time
  data validation + Lighthouse cover a content site's failure modes

## Launch Checklist (handoff items)

1. Owner creates/confirms Sanity account; project + dataset provisioned
2. Seed content import; owner reviews rewritten copy in Studio
3. GitHub repo + Pages + Actions secrets; Sanity webhook with PAT
4. DNS cutover at owner's registrar; verify HTTPS
5. Google Search Console: verify, submit sitemap
6. Confirm Square booking/gift/shop links; Formspree destination email
7. Flag Google Business Profile consistency to owner
