# Moody Accents Design Iteration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add dark textured bands, curved dividers, condensed display headings, a marquee ticker, and a rating-forward testimonial band per the approved moody-accents spec.

**Architecture:** All styling flows through `global.css` tokens. Two new presentational components (`CurveDivider`, `SucculentTexture`) are consumed by the dark bands (footer, gift-card, testimonial). The rating is an optional owner-set Sanity field rendered conditionally. No content-model changes beyond two optional `siteSettings` fields.

**Tech Stack:** Astro 7 static site, Sanity, Fontsource variable fonts, scoped Astro component CSS.

**Spec:** `docs/superpowers/specs/2026-08-03-moody-accents-design.md`

## Global Constraints

- Descriptive variable names; no single-character identifiers; no TypeScript `as`.
- ESLint `space-in-parens: always` — write `fn( arg )`, `( rule ) => rule.required()`.
- Verification cycle per task: `yarn run check && yarn lint`; full `yarn build` where stated. No unit-test suite exists. NEVER run a dev server (hard-blocked).
- All on-dark text must pass WCAG AA against its ground (`#2e3529` moss, `#3b2f2a` espresso). `#faf6f0` cream and `#d8cec4` cream-muted both pass on both grounds (contrast > 9:1 and > 6:1 respectively).
- The reduced-motion kill-switch already exists globally (`global.css` `@media (prefers-reduced-motion: reduce)` sets `animation: none !important`) — do not duplicate it in components.
- Work from `/Users/benny/dev/treatyourselfstudios/.claude/worktrees/design-moody-accents`. First task runs `yarn install --frozen-lockfile` then `yarn add @fontsource-variable/oswald` (this is the one permitted lockfile change; latest stable, currently 5.x).
- An env file with Sanity credentials is present in the worktree; never reference `.env` literally in Bash commands (hook-blocked).

---

### Task 1: Tokens, condensed display font, heading styles

**Files:**
- Modify: `package.json` (dependency via `yarn add`), `src/components/BaseHead.astro:2-3`, `src/styles/global.css`

**Interfaces:**
- Produces CSS tokens later tasks rely on verbatim: `--color-moss-deep: #2e3529`, `--color-cream-muted: #d8cec4`, `--color-sage-mist: #b9c1ae`, `--font-display-condensed: "Oswald Variable", "Arial Narrow", sans-serif`.

- [ ] **Step 1: Install the font**

Run: `yarn install --frozen-lockfile && yarn add @fontsource-variable/oswald`
Expected: lockfile gains the package; no other changes.

- [ ] **Step 2: Import it in BaseHead**

In `src/components/BaseHead.astro`, after the two existing fontsource imports add:

```ts
import "@fontsource-variable/oswald/index.css";
```

- [ ] **Step 3: Add tokens and heading styles to global.css**

In `:root`, after `--color-line`:

```css
  --color-moss-deep: #2e3529;    /* dark band ground (footer) */
  --color-cream-muted: #d8cec4;  /* secondary text on dark grounds — AA on moss/espresso */
  --color-sage-mist: #b9c1ae;    /* line-art strokes / tertiary on dark */
```

After `--font-body`:

```css
  --font-display-condensed: "Oswald Variable", "Arial Narrow", sans-serif;
```

Replace the `h2 { font-size: var(--text-xl); }` rule with:

```css
h2 {
  font-family: var(--font-display-condensed);
  font-size: var(--text-2xl);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}
```

(`h1` and `h3` keep Fraunces via the existing grouped rule — do not touch it.)

- [ ] **Step 4: Verify**

Run: `yarn run check && yarn lint && yarn build`
Expected: clean; 22 pages. Headings across pages now render condensed uppercase.

- [ ] **Step 5: Commit**

```bash
git add package.json yarn.lock src/components/BaseHead.astro src/styles/global.css
git commit -m "feat: condensed display headings and dark-band design tokens"
```

---

### Task 2: CurveDivider and SucculentTexture components

**Files:**
- Create: `src/components/CurveDivider.astro`, `src/components/SucculentTexture.astro`

**Interfaces:**
- Produces: `<CurveDivider fill="var(--color-moss-deep)" direction="down" />` — props `fill: string` (CSS color/token), `direction?: "down" | "up"` (default `"down"`; `down` = arc bulges upward into the section above, filling toward the band below).
- Produces: `<SucculentTexture stroke="var(--color-sage-mist)" />` — absolutely-positioned pattern layer; parent must be `position: relative`; sibling content needs `position: relative` to sit above it.

- [ ] **Step 1: Write CurveDivider.astro**

```astro
---
interface Props {
  fill: string;
  direction?: "down" | "up";
}
const { fill, direction = "down" } = Astro.props;
const path = direction === "down"
  ? "M0,34 Q300,-20 600,34 L600,34 L0,34 Z"
  : "M0,0 Q300,54 600,0 L600,0 L0,0 Z";
---
<svg class="curve-divider" viewBox="0 0 600 34" preserveAspectRatio="none" aria-hidden="true">
  <path d={ path } fill={ fill } />
</svg>

<style>
  .curve-divider { display: block; width: 100%; height: clamp( 22px, 4vw, 44px ); }
</style>
```

- [ ] **Step 2: Write SucculentTexture.astro**

The rosette motif echoes the sign's succulent: three concentric petal rings drawn
as overlapping arcs. Pattern tiles at 96px, stroke-only, opacity kept subtle.

```astro
---
interface Props {
  stroke?: string;
}
const { stroke = "var(--color-sage-mist)" } = Astro.props;
const patternId = `succulent-${Math.random().toString( 36 ).slice( 2, 8 )}`;
---
<svg class="succulent-texture" aria-hidden="true">
  <defs>
    <pattern id={ patternId } width="96" height="96" patternUnits="userSpaceOnUse">
      <g fill="none" stroke={ stroke } stroke-width="1">
        <circle cx="48" cy="48" r="8" />
        <path d="M48,20 C54,32 54,40 48,48 C42,40 42,32 48,20 Z" />
        <path d="M76,48 C64,54 56,54 48,48 C56,42 64,42 76,48 Z" />
        <path d="M48,76 C42,64 42,56 48,48 C54,56 54,64 48,76 Z" />
        <path d="M20,48 C32,42 40,42 48,48 C40,54 32,54 20,48 Z" />
        <path d="M67,29 C63,39 58,44 48,48 C52,38 57,33 67,29 Z" />
        <path d="M67,67 C57,63 52,58 48,48 C58,52 63,57 67,67 Z" />
        <path d="M29,67 C33,57 38,52 48,48 C44,58 39,63 29,67 Z" />
        <path d="M29,29 C39,33 44,38 48,48 C38,44 33,39 29,29 Z" />
      </g>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill={ `url(#${patternId})` } />
</svg>

<style>
  .succulent-texture { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0.12; }
</style>
```

(The random suffix keeps pattern ids unique when the component renders twice on
one page — ids are global in HTML. `Math.random` at build time is fine here:
it runs in the static build, not the client.)

- [ ] **Step 3: Verify**

Run: `yarn run check && yarn lint`
Expected: clean. Components are not yet consumed; that is fine.

- [ ] **Step 4: Commit**

```bash
git add src/components/CurveDivider.astro src/components/SucculentTexture.astro
git commit -m "feat: curve divider and succulent texture components"
```

---

### Task 3: Dark banded footer

**Files:**
- Modify: `src/components/Footer.astro` (full rewrite of markup + styles; frontmatter props/data logic unchanged)

**Interfaces:**
- Consumes: `CurveDivider`, `SucculentTexture` from Task 2; tokens from Task 1.

- [ ] **Step 1: Rewrite the footer markup**

Keep the existing frontmatter (imports, Props, `logoUrl`, `currentYear`, `socialEntries`) and add the two component imports. Replace everything after the frontmatter with:

```astro
<CurveDivider fill="var(--color-moss-deep)" direction="down" />
<footer class="footer">
  <SucculentTexture stroke="var(--color-sage-mist)" />
  <div class="footer-inner container">
    <div class="footer-cards">
      <address class="footer-card">
        <p class="footer-card-label">Contact</p>
        <p>{ settings.address.street }<br />{ settings.address.city }, { settings.address.state } { settings.address.zip }</p>
        <p><a href={ `tel:${settings.phoneE164}` }>{ settings.phone }</a></p>
        { settings.email && <p><a href={ `mailto:${settings.email}` }>{ settings.email }</a></p> }
      </address>
      <div class="footer-brand-block">
        { logoUrl
          ? <img src={ logoUrl } alt={ settings.siteTitle } height="48" />
          : <p class="footer-brand">{ settings.siteTitle }</p> }
        { settings.tagline && <p class="footer-tagline">{ settings.tagline }</p> }
        <a class="button button--ghost" href={ settings.bookingUrl } rel="noopener">Book Now</a>
        <ul class="footer-social">
          { socialEntries.map( ( entry ) => (
            <li><a href={ entry.url } rel="noopener">{ entry.label }</a></li>
          ) ) }
        </ul>
      </div>
      <div class="footer-card">
        <p class="footer-card-label">Hours</p>
        <p>{ settings.hoursNote }</p>
        <p>Book online anytime</p>
      </div>
    </div>
    <nav aria-label="Footer">
      <ul class="footer-links">
        <li><a href="/services/">Services</a></li>
        <li><a href="/packages/">Packages &amp; Deals</a></li>
        <li><a href="/about/">About</a></li>
        <li><a href="/faq/">FAQ</a></li>
        <li><a href="/contact/">Contact</a></li>
        <li><a href={ settings.giftCardUrl } rel="noopener">Gift Cards</a></li>
        { settings.shopUrl && <li><a href={ settings.shopUrl } rel="noopener">Shop</a></li> }
        <li><a href="/terms/">Terms &amp; Conditions</a></li>
      </ul>
    </nav>
    <p class="footer-copyright">© 2017–{ currentYear } Treat YourSelf Studios</p>
  </div>
</footer>
```

- [ ] **Step 2: Replace the footer styles**

```css
  .footer {
    position: relative;
    margin-top: 0;
    padding-block: var(--space-6) var(--space-4);
    background: var(--color-moss-deep);
    color: var(--color-cream);
  }
  .footer-inner { position: relative; }
  .footer-cards {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-4);
    align-items: stretch;
    text-align: center;
  }
  @media (min-width: 48rem) {
    .footer-cards { grid-template-columns: 1fr 1.2fr 1fr; }
  }
  .footer-card {
    border: 1px solid rgb( 250 246 240 / 0.4 );
    border-radius: var(--radius-card);
    padding: var(--space-3) var(--space-4);
    font-style: normal;
    text-align: left;
  }
  .footer-card p { margin-block: var(--space-1); color: var(--color-cream-muted); }
  .footer-card a { color: var(--color-cream); }
  .footer-card-label {
    font-size: var(--text-xs); font-weight: 700; letter-spacing: 0.14em;
    text-transform: uppercase; color: var(--color-terracotta);
  }
  .footer-brand-block { display: grid; justify-items: center; align-content: center; gap: var(--space-2); }
  .footer-brand { margin: 0; font-family: var(--font-display); font-size: var(--text-lg); font-weight: 600; }
  .footer-tagline { margin: 0; font-style: italic; color: var(--color-cream-muted); }
  .button--ghost {
    background: transparent; color: var(--color-cream);
    box-shadow: inset 0 0 0 1px rgb( 250 246 240 / 0.55 );
  }
  .button--ghost:hover { background: var(--color-cream); color: var(--color-espresso); }
  .footer-social { list-style: none; margin: 0; padding: 0; display: flex; gap: var(--space-3); justify-content: center; }
  .footer-social a, .footer-links a { color: var(--color-cream); }
  .footer-links {
    list-style: none; margin: var(--space-5) 0 0; padding: 0;
    display: flex; flex-wrap: wrap; gap: var(--space-2) var(--space-4); justify-content: center;
    font-size: var(--text-sm);
  }
  .footer-copyright { margin-block: var(--space-4) 0; text-align: center; font-size: var(--text-sm); color: var(--color-cream-muted); }
```

Note the previous `margin-top: var(--space-7)` moves off `.footer` (the curve
provides the visual gap; pages end flush against it).

- [ ] **Step 3: Verify**

Run: `yarn run check && yarn lint && yarn build`
Expected: clean; footer renders dark on every page. The Footer JSON-LD is
untouched (it lives in Layout/JsonLd, not here) — address/phone stay in the
markup for parity.

- [ ] **Step 4: Commit**

```bash
git add src/components/Footer.astro
git commit -m "feat: dark banded footer with outlined info cards and texture"
```

---

### Task 4: Marquee ticker

**Files:**
- Create: `src/components/Ticker.astro`
- Modify: `src/pages/index.astro` (render under `<Hero …/>`)

**Interfaces:**
- Consumes: `SiteSettings` type.
- Produces: `<Ticker settings={ settings } />`.

- [ ] **Step 1: Write Ticker.astro**

```astro
---
import type { SiteSettings } from "../lib/sanity";

interface Props {
  settings: SiteSettings;
}
const { settings } = Astro.props;
const tickerItems = [ settings.tagline, settings.firstVisitOffer, settings.hoursNote ]
  .filter( ( item ): item is string => Boolean( item ) );
---
{ tickerItems.length > 0 && (
  <div class="ticker" role="presentation">
    <div class="ticker-track">
      <span class="ticker-run">{ tickerItems.map( ( item ) => <span class="ticker-item">{ item }</span> ) }</span>
      <span class="ticker-run" aria-hidden="true">{ tickerItems.map( ( item ) => <span class="ticker-item">{ item }</span> ) }</span>
    </div>
  </div>
) }

<style>
  .ticker { overflow: hidden; background: var(--color-espresso); color: var(--color-blush); }
  .ticker-track { display: flex; width: max-content; animation: ticker-scroll 30s linear infinite; }
  .ticker-run { display: flex; }
  .ticker-item { padding: var(--space-2) 0; font-size: var(--text-sm); white-space: nowrap; }
  .ticker-item::after { content: "·"; margin-inline: var(--space-4); color: var(--color-terracotta); }
  @keyframes ticker-scroll {
    from { transform: translateX( 0 ); }
    to { transform: translateX( -50% ); }
  }
</style>
```

(The global reduced-motion rule already freezes the animation; the frozen state
shows the first run's items, which is acceptable static content.)

- [ ] **Step 2: Render it on the homepage**

In `src/pages/index.astro`: add `import Ticker from "../components/Ticker.astro";`
and directly below `<Hero homePage={ homePage } bookingUrl={ settings.bookingUrl } />` add:

```astro
  <Ticker settings={ settings } />
```

- [ ] **Step 3: Verify**

Run: `yarn run check && yarn lint && yarn build`, then
`grep -c 'ticker-item' dist/index.html` — expected ≥ 6 (three items × two runs).

- [ ] **Step 4: Commit**

```bash
git add src/components/Ticker.astro src/pages/index.astro
git commit -m "feat: marquee ticker of brand copy under the hero"
```

---

### Task 5: Dark gift-card band with curves and texture

**Files:**
- Modify: `src/components/GiftCardCallout.astro` (dark restyle), `src/pages/index.astro` (band wrapper + section order)

**Interfaces:**
- Consumes: `CurveDivider`, `SucculentTexture`, tokens.

- [ ] **Step 1: Restyle GiftCardCallout to the dark language**

In `src/components/GiftCardCallout.astro` styles: replace the `.gift-callout` rule's card look with a transparent dark treatment (the band supplies the ground), and flip text colors:

```css
  .gift-callout { display: grid; overflow: hidden; position: relative; color: var(--color-cream); }
  .gift-callout-image { width: 100%; height: 100%; object-fit: cover; border-radius: var(--radius-card); }
  .gift-callout-body {
    display: grid; justify-items: start; align-content: center;
    gap: var(--space-3); padding: var(--space-5);
  }
  .gift-callout-body h2, .gift-callout-body p { margin: 0; }
  .gift-callout-body p { color: var(--color-cream-muted); }
  .gift-callout .eyebrow { color: var(--color-terracotta); }
  .gift-callout .button { background: var(--color-terracotta); color: var(--color-ivory); }
  .gift-callout .button:hover { background: var(--color-cream); color: var(--color-espresso); }
  @media (min-width: 48rem) {
    .gift-callout { grid-template-columns: 2fr 3fr; }
    .gift-callout-image { max-height: 26rem; }
  }
```

Remove the `card` class from the root div (`<div class="gift-callout">`); add `<p class="eyebrow">Gift Cards</p>` already exists — keep markup otherwise unchanged.

- [ ] **Step 2: Wrap it in a dark band on the homepage and set the section order**

In `src/pages/index.astro`, add imports for `CurveDivider` and `SucculentTexture`. Replace the current gift-card section (lines 61-63) and MOVE it so the homepage order becomes: Hero → Ticker → welcome → services → DealBanner → **gift band** → testimonials → HoursLocation:

```astro
  <CurveDivider fill="var(--color-espresso)" direction="down" />
  <section class="gift-band" aria-label="Gift cards">
    <SucculentTexture stroke="var(--color-terracotta)" />
    <div class="container gift-band-inner">
      <GiftCardCallout giftCardUrl={ settings.giftCardUrl } />
    </div>
  </section>
  <CurveDivider fill="var(--color-espresso)" direction="up" />
```

Page styles to add:

```css
  .gift-band { position: relative; background: var(--color-espresso); padding-block: var(--space-5); }
  .gift-band-inner { position: relative; }
```

- [ ] **Step 3: Verify**

Run: `yarn run check && yarn lint && yarn build`
Expected: clean build; homepage band order matches the approved composite.

- [ ] **Step 4: Commit**

```bash
git add src/components/GiftCardCallout.astro src/pages/index.astro
git commit -m "feat: gift-card callout on a dark textured band"
```

---

### Task 6: Rating-forward testimonial band + optional Sanity rating fields

**Files:**
- Modify: `studio/schemaTypes/siteSettings.ts`, `src/lib/sanity.ts:68-85` (type) and `src/lib/sanity.ts:186-191` (GROQ), `src/pages/index.astro` (testimonial section)

**Interfaces:**
- Consumes: `SiteSettings` gains `googleRating?: number; googleReviewUrl?: string;`

- [ ] **Step 1: Add the schema fields**

In `studio/schemaTypes/siteSettings.ts`, after the `firstVisitOffer` field:

```ts
    defineField({
      name: 'googleRating', title: 'Google Rating', type: 'number',
      description: 'Aggregate rating shown in the testimonial band; leave empty to hide the number',
      validation: ( rule ) => rule.min( 0 ).max( 5 ).precision( 1 ),
    }),
    defineField({
      name: 'googleReviewUrl', title: 'Google Reviews URL', type: 'url',
      description: 'Link to the Google Business reviews',
      validation: ( rule ) => rule.uri({ scheme: [ 'https' ] }),
    }),
```

- [ ] **Step 2: Extend the type and query**

In `src/lib/sanity.ts` `SiteSettings`, after `firstVisitOffer?: string;`:

```ts
  googleRating?: number;
  googleReviewUrl?: string;
```

In the `getSiteSettings` GROQ projection, after `firstVisitOffer`:

```
bookingUrl, giftCardUrl, shopUrl, firstVisitOffer, googleRating, googleReviewUrl, socialLinks
```

- [ ] **Step 3: Rework the homepage testimonial section into a blush band**

Replace the testimonial section in `src/pages/index.astro` with:

```astro
  { featuredTestimonials.length > 0 && (
    <section class="testimonial-band" aria-labelledby="testimonials-heading">
      <div class="container">
        <div class="rating-header">
          { settings.googleRating ? (
            <p class="rating-figure">
              <span class="rating-number">{ settings.googleRating.toFixed( 1 ) }</span>
              <span class="rating-stars" aria-hidden="true">★★★★★</span>
            </p>
          ) : (
            <p class="eyebrow">Kind Words</p>
          ) }
          <h2 id="testimonials-heading">What Clients Are Saying</h2>
          { settings.googleReviewUrl && (
            <a class="rating-link" href={ settings.googleReviewUrl } rel="noopener">Read our reviews on Google</a>
          ) }
        </div>
        <div class="testimonial-row">
          { featuredTestimonials.map( ( testimonial ) => <TestimonialCard testimonial={ testimonial } /> ) }
        </div>
      </div>
    </section>
  ) }
```

Page styles: replace `.testimonial-row`'s neighbors with:

```css
  .testimonial-band { background: var(--color-blush); padding-block: var(--space-6); }
  .rating-header { text-align: center; margin-block-end: var(--space-4); }
  .rating-figure { margin: 0; font-family: var(--font-display); font-size: var(--text-2xl); color: var(--color-espresso); }
  .rating-stars { color: var(--color-terracotta); margin-inline-start: var(--space-2); }
  .rating-link { font-size: var(--text-sm); }
  .testimonial-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
    gap: var(--space-4);
  }
```

The stars carry `aria-hidden` — the accessible text is the numeric rating.
Render stars ONLY inside the `settings.googleRating` branch (never
unconditioned), per the spec's honesty constraint.

- [ ] **Step 4: Verify**

Run: `yarn run check && yarn lint && yarn build`
Expected: clean; with `googleRating` unset in Sanity, built HTML shows the "Kind Words" eyebrow and no rendered stars: `grep -c '<span class="rating-stars"' dist/index.html` → 0 (match the element, not the bare class name — the CSS text may legitimately contain `rating-stars` even when nothing renders).

- [ ] **Step 5: Commit**

```bash
git add studio/schemaTypes/siteSettings.ts src/lib/sanity.ts src/pages/index.astro
git commit -m "feat: rating-forward testimonial band with optional owner-set Google rating"
```

---

### Task 7: Deal-card restyle (drop the top-accent border)

**Files:**
- Modify: `src/pages/packages.astro:95-98`

- [ ] **Step 1: Replace the deal-card treatment**

```css
  .deal-card {
    padding: var(--space-4);
    background: var(--color-blush);
    border: 1px solid var(--color-line);
  }
```

(The `border-top: 4px solid var(--color-terracotta)` line is deleted. If the
deal-card markup carries the `card` class, the blush background overrides the
ivory; border/shadow/radius still come from `.card`, so drop the `border`
line above if `.card` already provides it — keep exactly one border source.)

- [ ] **Step 2: Verify**

Run: `yarn run check && yarn lint && yarn build`

- [ ] **Step 3: Commit**

```bash
git add src/pages/packages.astro
git commit -m "feat: restyle deal cards to blush ground, drop top-accent border"
```

---

### Task 8: Full verification and PR

**Files:** none (operational)

- [ ] **Step 1: CI-equivalent check**

Run: `make check`
Expected: types, lint, 22-page build all green.

- [ ] **Step 2: Contrast spot-check**

Confirm in built HTML/CSS that on-dark text uses only `--color-cream` (9.5:1 on moss, 8.9:1 on espresso) or `--color-cream-muted` (6.6:1 / 6.2:1) — both AA at any size. `--color-sage-mist` is decoration-only (pattern strokes at 0.12 opacity), exempt from text contrast.

- [ ] **Step 3: Ask Benny to eyeball his running dev server**

Homepage rhythm (hero → ticker → light → dark gift band → blush rating band → light → dark footer), packages deal cards, any page's footer. Do NOT start a dev server.

- [ ] **Step 4: Push and open the PR**

```bash
git push -u origin design-moody-accents
gh pr create --head design-moody-accents --title "feat: moody-accents design iteration" --body "…"
```

PR body: summarize the seven elements, the client's reference sites, the deal-card feedback fix, the optional `googleRating`/`googleReviewUrl` fields (owner sets in Studio; nothing renders until then), the Oswald Variable addition (watch Lighthouse budget), and link the spec. Report the PR URL.
