# Moody Accents Design Iteration — Design

**Date:** 2026-08-03
**Status:** Approved (visual companion session; composite homepage mockup approved by Benny)

## Goal

Evolve the site's visual design toward the client's two references — [The Skin
Firm](https://www.theskinfirmseattle.com/meet-the-team) and
[Dermaspace](https://www.dermaspace.com/) — without a rebrand. Keep the
cream/airy foundation; add dark textured "moody" bands, curved section
transitions, bolder display typography, and stronger social proof.

## Approved element set

Selected by Benny in the visual companion (all mocked in the real palette):

1. **Dark banded footer** — deep-moss ground, ghost-outline Contact/Hours
   cards flanking the brand block, cream pill CTA. Site-wide.
2. **Curved section dividers** — reusable SVG arc component for light↔dark
   band transitions.
3. **Gift-card callout on a dark ground** — espresso band, terracotta
   accents, cream type; keeps the champagne photo.
4. **Succulent line-art texture bands** — hand-drawn SVG rosette motif
   (derived from the sign's logo mark) tiled at low opacity over dark bands
   (footer + gift-card band).
5. **Condensed all-caps display headings** — new Fontsource variable font
   (Oswald Variable) for section-level `h2`s. Fraunces stays for the
   wordmark, hero, pull-quotes, and the rating number.
6. **Scrolling marquee ticker** — thin espresso strip under the hero;
   items are exactly the existing Sanity settings values, each included only
   when set: `tagline`, `firstVisitOffer`, `hoursNote`. No new schema. Must
   pause for `prefers-reduced-motion` and duplicate content with
   `aria-hidden` for the seamless loop.
7. **Rating-forward testimonial band** — testimonials section leads with an
   aggregate rating + link to the Google listing.

## Feedback folded in

- **No top-accent-bar cards.** The `border-top: 4px solid terracotta` deal
  cards (`src/pages/packages.astro:97`) read as templated. Remove that
  treatment; deal cards restyle to the new language (blush ground, terracotta
  eyebrow label, standard card border/shadow).

## Honesty constraint on the rating

Never hardcode a rating. New **optional** Sanity `siteSettings` fields:
`googleRating` (number) and `googleReviewUrl` (url). Stars + numeric rating
render only when `googleRating` is set by the owner in Studio; otherwise the
band header reads "Loved by our clients" with the review link (if set). Seed
baseline leaves `googleRating` unset.

## Palette additions (tokens, `global.css`)

- `--color-moss-deep: #2e3529` — dark band ground (footer)
- Dark gift-card band uses existing `--color-espresso`
- `--color-cream-muted: #d8cec4` and `--color-sage-mist: #b9c1ae` — on-dark
  secondary text/line-art strokes (final values may be tuned for AA contrast
  on their grounds; all on-dark text must pass AA)

## Scope

- Homepage: ticker, dark gift-card band with texture, curved transitions,
  rating band, condensed section headings.
- Site-wide: footer, condensed `h2` styles, deal-card restyle (packages
  page), heading changes on other pages inherit automatically.
- NOT in scope: hero redesign, logo work (awaiting owner artwork), any
  dark-first full-page treatment, live third-party review embeds, in-site
  Products page (separate feature if wanted).

## Out of scope but adjacent (tracked elsewhere)

- Nav dropdown bullet fix — shipped separately (PR #9).
- Deep legacy store paths (`/home-care/ols/products` etc.) → add to
  `LEGACY_REDIRECT_PATHS` as part of the DNS-cutover checklist.

## Verification

- `make check` (types, lint, build) green; CI Lighthouse budgets on the PR
  (new font adds weight — Oswald Variable subset via Fontsource; watch the
  performance budget).
- Reduced-motion behavior of the ticker verified via CSS review.
- On-dark text contrast checked against AA.
- Visual pass by Benny in his running dev server.

## Delivery

Branch `design-moody-accents` (worktree off main). Spec → plan
(superpowers:writing-plans) → subagent-driven implementation → PR.
