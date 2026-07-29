# Studio Imagery Incorporation — Design

**Date:** 2026-07-28
**Status:** Approved

## Goal

Replace generic/placeholder imagery with real photos of Treat YourSelf Studios:
two professional building shots supplied by the developer and three photos
retrieved from the studio's own Google Business listing. Additionally, install a
cropped photo of the painted studio sign as an *interim* logo in Sanity until
the owner provides the original logo artwork.

## Source material

| Source | Content | Resolution |
|---|---|---|
| `~/Downloads/Treat-Yourself-Studios-Seattle-Columbia-City-Abbey-Building.jpg` | Daytime architectural shot of Columbia City Abbey | 1264×948 |
| `~/Downloads/Treat-Yourself-Studio-Building-Evening.webp` | Evening building shot | 1024×683 — **parked, unused** |
| Google listing photo 1 | Clean, well-lit painted sign (brand mark) | 2048×1153 |
| Google listing photo 2 | Treatment-room interior | 1536×2048 |
| Google listing photo 3 | Champagne & roses lounge detail | 1536×2048 |

Google photos are the studio's own business-listing photos, retrieved at full
resolution; scratchpad copies exist but the repo commits only processed
outputs.

## Deliverables

### 1. Processed assets

A one-off `sharp`-based script (sharp is already a dependency) produces, with
EXIF stripped, quality ~80, sized ~2x display size. The script itself runs from
the session scratchpad and is not committed — its inputs include files outside
the repo, so only the processed outputs are committed:

- `public/images/studio-exterior.jpg` — **replaced** with the daytime building
  shot. The `LocationMap` slot CSS-crops to 3:2 (`object-fit: cover`), so the
  4:3 source needs no pre-cropping.
- `public/images/gift-cards.jpg` — **replaced** with the champagne & roses
  photo (same 3:4 portrait orientation as the current file).
- `public/images/studio-interior.jpg` — **new**, the treatment-room photo.
- Interim logo crop — tight crop of the painted mark from the sign photo.
  Uploaded to Sanity only; **not** committed under `public/`. Mild keystone
  from the source angle is accepted at 48px nav display size.

### 2. Component changes

- `LocationMap.astro` — updated `width`/`height` (1264×948) and corrected alt
  text (current alt says "brick building"; the abbey is white stucco with a
  wood-clad modern addition). No layout change.
- `GiftCardCallout.astro` — updated `width`/`height` (1536×2048) and new alt
  text describing the champagne & roses scene. No layout change.
- `about.astro` — intro section becomes a two-column grid on desktop (story
  text beside `studio-interior.jpg`), stacking on mobile. Uses existing
  spacing/typography tokens; image is `loading="lazy"` with proper
  `width`/`height`.

### 3. Interim logo plumbing

- `scripts/set-logo.ts` — reuses `uploadImage` from
  `scripts/seed-data/helpers.ts` (shared mechanic; not duplicated) to upload
  the logo crop and patch **only** `siteSettings.logo`. No other content
  touched. Invoked as `yarn tsx scripts/set-logo.ts <path-to-logo-image>`,
  using the existing `SANITY_API_TOKEN` (write scope required, as for
  `make seed`).
- `scripts/seed-data/siteSettings.ts` — gains the same logo reference so a
  future `make seed` reset keeps the logo.
- No component changes: `Nav.astro` and `Footer.astro` already render
  `settings.logo` when present.
- `public/favicon.svg` keeps the "TY" placeholder; favicon work belongs to the
  future original-logo task.

## Out of scope

- Vectorizing/recreating the logo (waiting on the owner's original file).
- Using the evening building shot.
- Any gallery/lightbox feature.

## Verification

- `yarn run check`, `yarn lint`, `yarn build` locally (mirrors CI).
- Alt-text review for all swapped/added images.
- CI Lighthouse budgets on the PR guard image weight; the resize/recompress
  step is the mitigation.
- Browser check in the developer's already-running dev server (no new dev
  server per project rules).

## Delivery

Work happens on the `studio-imagery` branch (worktree off `main`, independent
of the open Astro-upgrade PR #7). Push and open a PR when checks are green.
