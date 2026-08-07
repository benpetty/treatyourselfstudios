# Real Logo Rollout Design

**Date:** 2026-08-07
**Status:** Approved
**Origin:** Client provided the original logo artwork (`logo.pdf`) — replace the interim painted-sign logo and the placeholder "TY" favicon.

## Source material

The PDF wraps a single 1000×1000 raster image (RGB + alpha smask; no vector art, no fonts): a green succulent rosette line-drawing inside a brushstroke ring, with "Treat YourSelf Studios" and "NOT YOUR AVERAGE SPA!" beneath, on a baked-in pale field `#f1f5f7` (transparent only at the rounded corners). Rosette green: `#199131`. A true SVG is only obtainable by tracing.

Decisions made with Benny (visual companion session, choices confirmed in browser events):

1. **Nav treatment: rosette mark + site name as text** — not the full badge (name illegible at 48px) and not a wordmark crop (drops the mark, raster text).
2. **Favicon: thickened potrace trace** — strokes dilated before tracing so the petal structure survives 16px; not the faithful-weight trace (blurs at 16px) and not the blush-disc variant.
3. **og:image: the full badge** — the complete lockup is what a share card wants; static file, no longer derived from `settings.logo`.

## Assets

All derived from the extracted 1000×1000 image (background removed via 6%-fuzz transparency keying — halo-safe because the site's cream/blush grounds are near the removed `#f1f5f7`):

| Asset | Content | Destination |
|---|---|---|
| `rosette.png` | Transparent rosette crop, 235×243 native (crop box `320x320+340+280` + trim) | Sanity `settings.logo` via `make set-logo` |
| `public/favicon.svg` | Thickened trace (`-morphology Erode Disk:3` on the bilevel before potrace), single fill `#199131`, square viewBox | Replaces placeholder "TY" SVG |
| `public/og-image.png` | Full transparent badge centered on `#f1f5f7`, 1200×630 | Static og:image |

The intermediate build pipeline (pdfimages extraction, alpha recombination, crops, trace) ran in the session scratchpad; the spec records the recipe above so it is reproducible, but only the three final assets enter the repo/Sanity.

## Component changes

### `src/components/Nav.astro`

Brand row renders mark + name together (currently either/or):

- `<img src={ logoUrl } alt="" height="44" />` when `settings.logo` is set — `alt=""` because the site name sits adjacent as real text; announcing both is screen-reader noise.
- `<span class="brand-mark">{ settings.siteTitle }</span>` renders **always** (no-logo fallback keeps working; with logo, it is the accessible + visible name).
- `logoUrl` keeps the `urlFor(...).height( 96 )` retina sizing.

### `src/components/Footer.astro`

Mirrors the nav brand row (same mark + name structure, `alt=""`, title always). Kelly green on moss-deep is ~3:1 — acceptable for a decorative mark and cohesive with the footer's botanical texture.

### `src/components/BaseHead.astro`

`ogImageUrl` stops deriving from `settings.logo`; og:image becomes the static `/og-image.png` (absolute URL against `SITE_URL`, matching however BaseHead builds absolute URLs today). The Sanity-logo-derived og:image was a stopgap; a share card should show the full lockup, not a 1200×630 crop of whatever the nav logo is.

### `.gitignore`

Add `.superpowers/` (visual-companion session artifacts land there; currently only ignored via this machine's `.git/info/exclude`).

## Sequencing

1. Code PR: Nav, Footer, BaseHead, favicon.svg, og-image.png, .gitignore.
2. `make set-logo LOGO=rosette.png` runs right before the PR is pushed (Sanity content mutation, reversible by re-running with another file).
3. Merge deploys code + content together. Gap risk: a webhook rebuild between set-logo and merge would briefly show the rosette without the adjacent title — harmless and self-healing at merge.

## Out of scope

- Sanity schema changes (no new fields; `settings.logo` semantics shift from "full logo" to "brand mark").
- The gift-band/footer `SucculentTexture` motif (coincidentally echoes the real rosette; no change requested).
- Seed-data baseline for the logo (same posture as the interim logo: `make seed` resets are a known bootstrap behavior, unchanged by this work).
- Apple touch icons / manifest icons — the site ships only `favicon.svg` today; adding an icon set is new scope.

## Verification

- `make check` green.
- Built `dist/index.html`: `<link rel="icon" … href="/favicon.svg" />` unchanged, og:image meta points at `/og-image.png`, nav and footer contain img + brand-mark text together.
- Favicon renders as the rosette (eyeball `public/favicon.svg`).
- Post-`set-logo`: nav/footer show the rosette in Benny's running dev server.
