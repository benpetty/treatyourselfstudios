# Light Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage hero's dark no-photo state (moss→espresso gradient + terracotta rosette) with a flat blush ground and no decoration, keeping the photo state intact.

**Architecture:** Single-component CSS/markup change in `src/components/Hero.astro` plus a one-line token removal in `src/styles/global.css`. The styling base case inverts: light-ground styles become the defaults, and the photo state's dark-ground styles (overlay, ivory text, ivory outline button) move under `.hero:has(.hero-image)` scoping.

**Tech Stack:** Astro 7 static site; no test framework — verification is `make check` (astro check + eslint + full build) plus grep assertions against the built `dist/index.html`.

**Spec:** `docs/superpowers/specs/2026-08-05-light-hero-design.md`

## Global Constraints

- Hero no-photo ground: flat `var(--color-blush)` (#f3e5dc) — no gradient.
- Rosette SVG and its CSS: deleted. Gift-band and footer succulent textures untouched.
- Photo state preserved exactly: photo + `linear-gradient(rgb(59 47 42 / 0.55), rgb(59 47 42 / 0.35))` overlay + ivory heading/subheading + ivory outline button.
- Token `--color-espresso-warm` deleted from `global.css` (hero gradient was its only consumer). All other tokens stay.
- Contrast gate (already computed 2026-08-05, WCAG relative-luminance formula): bark on blush 5.14:1, sage-deep on blush 4.77:1, espresso on blush 10.49:1, ivory on sage-deep 5.79:1 — all ≥ 4.5:1, so the spec's first-choice colors apply with no fallbacks.
- Never run the dev server (`deny-dev-servers.sh` enforces); browser-level review happens in Benny's running server.

---

### Task 1: Light hero ground + photo-state scoping

**Files:**
- Modify: `src/components/Hero.astro` (markup lines 39–51, style block lines 64–133)
- Modify: `src/styles/global.css` (delete the `--color-espresso-warm` line)

**Interfaces:**
- Consumes: global `.button` / `.button--outline` styles from `global.css` (sage-deep treatments) — the no-photo hero now falls through to them with no overrides.
- Produces: nothing consumed by other tasks (single-task plan).

- [ ] **Step 1: Confirm green baseline**

Run: `make check`
Expected: astro check 0 errors, eslint clean, build completes (80 pages). If the baseline is red, stop and report.

- [ ] **Step 2: Delete the rosette markup**

In `src/components/Hero.astro`, delete this entire block (lines 39–51):

```astro
  { !homePage.heroImage && (
    <svg class="hero-rosette" viewBox="0 0 100 100" aria-hidden="true" fill="none" stroke="var(--color-terracotta-bright)" stroke-width="0.6">
      <circle cx="50" cy="50" r="8" />
      <path d="M50,20 C56,32 56,42 50,50 C44,42 44,32 50,20 Z" />
      <path d="M80,50 C68,56 58,56 50,50 C58,44 68,44 80,50 Z" />
      <path d="M50,80 C44,68 44,58 50,50 C56,58 56,68 50,80 Z" />
      <path d="M20,50 C32,44 42,44 50,50 C42,56 32,56 20,50 Z" />
      <path d="M71,29 C67,40 60,46 50,50 C54,40 61,33 71,29 Z" />
      <path d="M71,71 C60,67 54,60 50,50 C60,54 67,61 71,71 Z" />
      <path d="M29,71 C33,60 40,54 50,50 C46,60 39,67 29,71 Z" />
      <path d="M29,29 C40,33 46,40 50,50 C40,46 33,39 29,29 Z" />
    </svg>
  ) }
```

The `{ homePage.heroImage && (<img class="hero-image" …/>) }` block and the `.hero-overlay` markup stay exactly as they are.

- [ ] **Step 3: Replace the style block**

Replace the entire `<style>` block in `src/components/Hero.astro` with:

```css
  .hero {
    position: relative;
    display: grid;
    min-height: clamp(24rem, 60vh, 38rem);
    background: var(--color-blush);
    overflow: hidden;
  }
  .hero-image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .hero-overlay {
    position: relative;
    display: grid;
    align-content: center;
    width: 100%;
  }
  .hero-content {
    width: 100%;
    padding-block: var(--space-6);
    text-align: center;
  }
  .hero-content h1 {
    margin: 0;
    font-size: var(--text-hero);
    color: var(--color-espresso);
  }
  .hero-subheading {
    max-width: 38rem;
    margin: var(--space-3) auto var(--space-5);
    font-size: var(--text-lg);
    color: var(--color-bark);
  }
  .hero-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--space-3);
  }
  /* Photo state: dark overlay ground, so text and the outline button take ivory. */
  .hero:has(.hero-image) .hero-overlay {
    background: linear-gradient(rgb(59 47 42 / 0.55), rgb(59 47 42 / 0.35));
  }
  .hero:has(.hero-image) .hero-content h1,
  .hero:has(.hero-image) .hero-subheading {
    color: var(--color-ivory);
  }
  .hero:has(.hero-image) .hero-actions .button--outline {
    color: var(--color-ivory);
    box-shadow: inset 0 0 0 2px var(--color-ivory);
  }
  .hero:has(.hero-image) .hero-actions .button--outline:hover {
    background: var(--color-ivory);
    color: var(--color-espresso);
  }
```

This inverts the old base case: light-ground colors (espresso h1 at 10.49:1, bark subheading at 5.14:1, global sage-deep outline button at 4.77:1 — all AA on blush) are now the defaults, and every dark-ground rule lives under `.hero:has(.hero-image)`. The old `:not(:has(.hero-image))` rules and the "hero ground is dark in both states" comment disappear with the replacement.

- [ ] **Step 4: Delete the dead token**

In `src/styles/global.css`, delete this line:

```css
  --color-espresso-warm: #4a3c33; /* warm gradient end for the designed hero */
```

- [ ] **Step 5: Verify no remaining consumers of the deleted token**

Run: `grep -rn "espresso-warm" src`
Expected: no output. Any hit means a consumer was missed — stop and fix before proceeding.

- [ ] **Step 6: Run checks and build**

Run: `make check`
Expected: astro check 0 errors, eslint clean, 80-page build completes.

- [ ] **Step 7: Assert the built homepage**

Three assertions against the built output (Astro inlines scoped component CSS into the page, so `dist/index.html` is the surface to grep):

1. Rosette gone — Run: `grep -c "hero-rosette" dist/index.html` — Expected: `0` (grep exits non-zero on zero matches; that is the pass condition).
2. Gradient gone — Run: `grep -c "linear-gradient(135deg" dist/index.html` — Expected: `0`. The hero was the only `135deg` gradient in the site, so any hit is a regression.
3. Blush ground present — Run: `grep -c "background:var(--color-blush)" dist/index.html` — Expected: `1` or more (the hero rule; minified CSS drops the space after the colon).

- [ ] **Step 8: Commit**

```bash
git add src/components/Hero.astro src/styles/global.css
git commit -m "feat: light blush hero — flat ground, rosette removed, photo state preserved

Client-requested color change: the no-photo hero swaps its moss→espresso
gradient + terracotta rosette for a flat blush ground. Light-ground styles
are now the CSS base case (espresso h1, bark subheading, global sage
buttons — all AA on blush); the photo state's dark overlay + ivory
treatments are scoped under .hero:has(.hero-image). Removes the
--color-espresso-warm token, whose only consumer was the deleted gradient.
Spec: docs/superpowers/specs/2026-08-05-light-hero-design.md"
```
