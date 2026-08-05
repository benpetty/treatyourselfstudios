# Light Hero Design

**Date:** 2026-08-05
**Status:** Approved
**Origin:** Client request — replace the dark hero background with the site's light color and remove the flower.

## Decision summary

The homepage hero's no-photo state changes from the dark moss→espresso gradient with the terracotta rosette to a flat blush ground with no decoration. The photo state is unchanged.

Decisions made with Benny during brainstorming:

1. **Hero color: blush** (`--color-blush`, #f3e5dc) — not cream or ivory. Keeps the hero distinct from the cream nav above it instead of merging into one flat field.
2. **Flower scope: hero rosette only.** The repeating succulent textures in the gift-card band and footer stay.
3. **Treatment: flat.** No light-tone gradient; blush is used flat everywhere else on the site (deal banner, testimonial band, announcement bar), and with the rosette gone there is no competing decoration.

## Changes

### `src/components/Hero.astro`

- **Background:** `.hero` background becomes `var(--color-blush)`; the `linear-gradient(135deg, moss-deep, espresso, espresso-warm)` is deleted.
- **Rosette:** the `{ !homePage.heroImage && (<svg class="hero-rosette">…) }` block and the `.hero-rosette` CSS rule are deleted.
- **Styling default inverts.** The current CSS treats the dark ground as the base case (ivory heading/subheading, ivory outline button) because both hero states were dark. Now the light state is the base:
  - Heading: `--color-espresso`.
  - Subheading: `--color-bark` (subject to the contrast gate below).
  - Buttons: no hero-specific overrides — fall through to the global `.button` (sage-deep ground, ivory text) and `.button--outline` (sage-deep outline/text) treatments.
  - The photo state — photo, dark overlay, ivory heading/subheading, ivory outline button — is preserved as the exception, scoped under `.hero:has(.hero-image)`. The owner can upload a hero image in Studio at any time, so this path must keep working.

### `src/styles/global.css`

- Delete `--color-espresso-warm`; the hero gradient was its only consumer.
- All other tokens stay: `--color-moss-deep` (footer), `--color-cream-muted` and `--color-terracotta-bright` (gift callout and other on-dark uses).

## Contrast gate (hard requirement)

bark-on-blush (#6b5d54 on #f3e5dc) and sage-deep-on-blush (#5a6950 on #f3e5dc) are near the 4.5:1 AA boundary by estimate. Compute the actual WCAG ratios during implementation:

- If bark-on-blush < 4.5:1 → subheading uses `--color-espresso`.
- If sage-deep-on-blush < 4.5:1 → the hero's outline button uses espresso for its outline and text, with hover filling espresso behind ivory text (mirroring the global button's hover inversion).

This repo has failed AA on tinted grounds twice before (terracotta on dark, caught in review both times) — the check is explicit, not optional.

## Out of scope

- Gift-band and footer succulent textures (client keeps them).
- The ticker, nav, and announcement bar (the espresso ticker below the hero provides the light hero's bottom edge — same blush-against-espresso adjacency the testimonial band already uses).
- Any Sanity schema or content change; this is purely presentational.

## Verification

- `make check` (types, lint, 80-page build) green.
- Built `dist/index.html` contains no `hero-rosette` and no `linear-gradient` in the hero.
- Computed contrast ratios for the chosen text/button colors on blush are ≥ 4.5:1.
