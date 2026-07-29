# Studio Imagery Incorporation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace generic site imagery with real studio photos and install an interim sign-photo logo in Sanity.

**Architecture:** Static content images are committed under `public/images/` and referenced directly by components (existing pattern). The interim logo is committed under `docs/content-audit/images/` (the seed-image home), uploaded to Sanity by a new targeted script that patches only `siteSettings.logo`, and added to the seed baseline so `make seed` resets keep it. `Nav`/`Footer` already render `settings.logo` — no component change needed for the logo.

**Tech Stack:** Astro 7 static site, Sanity content, `sharp` for image processing (already a dependency), `tsx` for scripts.

**Spec:** `docs/superpowers/specs/2026-07-28-studio-imagery-design.md`

## Global Constraints

- Descriptive variable names everywhere; no single-character identifiers (project rule).
- No env-var fallbacks — assert and throw on missing vars (project rule).
- No new dev server ever — verification is `yarn run check`, `yarn lint`, `yarn build` (project rule; `deny-dev-servers.sh` hard-blocks).
- Spacing in parens per ESLint config: `fn( arg )` style (enforced by `space-in-parens: always`).
- Source photos (not in repo): `~/Downloads/Treat-Yourself-Studios-Seattle-Columbia-City-Abbey-Building.jpg` (1264×948) and three scratchpad files `google-photo-1.jpg` (sign, 2048×1153), `google-photo-2.jpg` (interior, 1536×2048), `google-photo-3.jpg` (champagne, 1536×2048) in `/private/tmp/claude-501/-Users-benny-dev-treatyourselfstudios/ba2b33d8-c21b-4257-9f7a-86f8b5580734/scratchpad/`.
- The processing script lives in the scratchpad and is NOT committed; only outputs are committed.
- Run all commands from the worktree root: `/Users/benny/dev/treatyourselfstudios/.claude/worktrees/studio-imagery`.

---

### Task 1: Process source photos into committed assets

**Files:**
- Create (scratchpad, uncommitted): `<scratchpad>/process-images.ts`
- Create/replace (committed): `public/images/studio-exterior.jpg`, `public/images/gift-cards.jpg`, `public/images/studio-interior.jpg`, `docs/content-audit/images/treat-yourself-studios-sign-logo.jpg`

**Interfaces:**
- Consumes: source photos listed in Global Constraints.
- Produces: the four image files above. Later tasks rely on these exact paths and on output dimensions: exterior 1264×948, gift-cards 1200×1600, interior 1200×1600, logo ~615×800.

- [ ] **Step 1: Write the processing script in the scratchpad**

```ts
// <scratchpad>/process-images.ts — one-off; run from the worktree root so sharp resolves.
import sharp from "sharp";

const SCRATCHPAD = "/private/tmp/claude-501/-Users-benny-dev-treatyourselfstudios/ba2b33d8-c21b-4257-9f7a-86f8b5580734/scratchpad";
const DOWNLOADS = `${process.env.HOME}/Downloads`;
const JPEG_OPTIONS = { quality: 80, mozjpeg: true };

async function processImages(): Promise<void> {
  // Exterior: keep native 1264x948, recompress + strip metadata (sharp strips by default).
  await sharp( `${DOWNLOADS}/Treat-Yourself-Studios-Seattle-Columbia-City-Abbey-Building.jpg` )
    .jpeg( JPEG_OPTIONS )
    .toFile( "public/images/studio-exterior.jpg" );

  // Gift-card callout: champagne & roses, portrait 3:4 like the file it replaces.
  await sharp( `${SCRATCHPAD}/google-photo-3.jpg` )
    .resize( { width: 1200, height: 1600 } )
    .jpeg( JPEG_OPTIONS )
    .toFile( "public/images/gift-cards.jpg" );

  // About page: treatment-room interior, portrait 3:4.
  await sharp( `${SCRATCHPAD}/google-photo-2.jpg` )
    .resize( { width: 1200, height: 1600 } )
    .jpeg( JPEG_OPTIONS )
    .toFile( "public/images/studio-interior.jpg" );

  // Interim logo: tight crop of the painted mark (brush circle + succulent + wordmark).
  // Crop box was tuned by visual inspection in Step 3; adjust there if the mark is clipped.
  await sharp( `${SCRATCHPAD}/google-photo-1.jpg` )
    .extract( { left: 540, top: 10, width: 850, height: 1105 } )
    .resize( { height: 800 } )
    .jpeg( JPEG_OPTIONS )
    .toFile( "docs/content-audit/images/treat-yourself-studios-sign-logo.jpg" );

  console.log( "Processed 4 images" );
}

processImages().catch( ( error ) => {
  console.error( error );
  process.exit( 1 );
} );
```

- [ ] **Step 2: Install dependencies (fresh worktree) and run the script**

Run: `yarn install --frozen-lockfile` (first time in this worktree), then
`yarn tsx <scratchpad>/process-images.ts`
Expected: install succeeds from the committed lockfile; script prints `Processed 4 images`, exit 0.

- [ ] **Step 3: Visually inspect all four outputs and iterate on the logo crop**

Use the Read tool on each output file. Verify:
- `studio-exterior.jpg`: full building visible, no distortion.
- `gift-cards.jpg`: bottle + both glasses + roses in frame.
- `studio-interior.jpg`: bed, desk, and shelves in frame.
- `treat-yourself-studios-sign-logo.jpg`: the ENTIRE green circle and the full
  "TREAT YOURSELF STUDIOS" wordmark are inside the crop with a small margin,
  and no window frame or background appears. If clipped or over-cropped,
  adjust `extract` values and re-run Steps 2-3 until right.

- [ ] **Step 4: Verify file sizes are web-appropriate**

Run: `ls -lh public/images/*.jpg docs/content-audit/images/treat-yourself-studios-sign-logo.jpg`
Expected: every file under ~500KB (Lighthouse budget guard).

- [ ] **Step 5: Commit**

```bash
git add public/images/studio-exterior.jpg public/images/gift-cards.jpg public/images/studio-interior.jpg docs/content-audit/images/treat-yourself-studios-sign-logo.jpg
git commit -m "feat: add real studio photos as site image assets"
```

---

### Task 2: Swap image metadata in LocationMap and GiftCardCallout

**Files:**
- Modify: `src/components/LocationMap.astro:13-20`
- Modify: `src/components/GiftCardCallout.astro:8-15`

**Interfaces:**
- Consumes: `public/images/studio-exterior.jpg` (1264×948) and `public/images/gift-cards.jpg` (1200×1600) from Task 1.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Update LocationMap.astro img attributes**

Replace the `<img>` element (the file content changed under the same path, so only metadata updates):

```astro
  <img
    class="location-map__photo"
    src="/images/studio-exterior.jpg"
    alt="Exterior of the Columbia City Abbey — a white former church with a modern wood-clad addition — home to Treat YourSelf Studios"
    width="1264"
    height="948"
    loading="lazy"
  />
```

- [ ] **Step 2: Update GiftCardCallout.astro img attributes**

```astro
  <img
    class="gift-callout-image"
    src="/images/gift-cards.jpg"
    alt="Champagne and roses set out on the lounge table at Treat YourSelf Studios"
    width="1200"
    height="1600"
    loading="lazy"
  />
```

- [ ] **Step 3: Verify with the project checks**

Run: `yarn run check && yarn lint`
Expected: 0 errors / 0 warnings; lint clean.

- [ ] **Step 4: Commit**

```bash
git add src/components/LocationMap.astro src/components/GiftCardCallout.astro
git commit -m "feat: use real building and lounge photos in find-us and gift-card sections"
```

---

### Task 3: Two-column about-page intro with interior photo

**Files:**
- Modify: `src/pages/about.astro:30-46` (markup) and `src/pages/about.astro:68-85` (styles)

**Interfaces:**
- Consumes: `public/images/studio-interior.jpg` (1200×1600) from Task 1.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Wrap the story in a grid with the interior photo**

Replace the `about-intro` section body (keep the existing two paragraphs verbatim inside `.about-story`):

```astro
  <section class="section container about-intro">
    <p class="eyebrow">Our Studio</p>
    <h1>Meet Your Estheticians</h1>
    <div class="about-intro-grid">
      <div class="about-story">
        <p>
          The best journey in life is the journey back to yourself. Treat YourSelf Studios was built
          around that idea — a calm Seattle studio where you can set aside the stresses of a busy day
          and spend an hour focused entirely on you, with a full range of professional facial, waxing,
          and body treatments.
        </p>
        <p>
          We see every client by appointment only, one at a time. That means no crowded waiting room
          and no rushed services — just unhurried, one-on-one care from an esthetician whose full
          attention is on you from the moment you walk in the door.
        </p>
      </div>
      <img
        class="about-intro-photo"
        src="/images/studio-interior.jpg"
        alt="Treatment room at Treat YourSelf Studios, with a facial bed, plants, and skincare products on wall shelves"
        width="1200"
        height="1600"
        loading="lazy"
      />
    </div>
  </section>
```

- [ ] **Step 2: Add the grid styles**

In the `<style>` block, replace `.about-story { max-width: 44rem; }` with:

```css
  .about-intro-grid { display: grid; gap: var(--space-4); align-items: start; }
  .about-story { max-width: 44rem; }
  .about-intro-photo {
    width: 100%;
    height: auto;
    border-radius: var(--radius-card);
    box-shadow: var(--shadow-card);
  }
  @media (min-width: 48rem) {
    .about-intro-grid { grid-template-columns: 3fr 2fr; gap: var(--space-5); }
  }
```

- [ ] **Step 3: Verify with the project checks and build**

Run: `yarn run check && yarn lint && yarn build`
Expected: all clean; build completes with 22 pages.

- [ ] **Step 4: Ask the user to eyeball /about in their running dev server**

Report: "About page now has the interior photo beside the intro — please glance at /about in your dev server." Do NOT start a dev server.

- [ ] **Step 5: Commit**

```bash
git add src/pages/about.astro
git commit -m "feat: add treatment-room photo to about page intro"
```

---

### Task 4: Shared Sanity write client, set-logo script, seed baseline, Makefile target

**Files:**
- Create: `scripts/sanity-client.ts`
- Create: `scripts/set-logo.ts`
- Modify: `scripts/seed.ts:1-24`
- Modify: `scripts/seed-data/siteSettings.ts`
- Modify: `Makefile` (after the `seed` target), `README.md` (Commands table)

**Interfaces:**
- Consumes: `uploadImage( client, filePath, altText )` from `scripts/seed-data/helpers.ts` (returns `{ _type: "image", asset: { _type: "reference", _ref }, alt }`); logo file `docs/content-audit/images/treat-yourself-studios-sign-logo.jpg` from Task 1.
- Produces: `createWriteClient(): SanityClient` in `scripts/sanity-client.ts`; `make set-logo` target.

- [ ] **Step 1: Extract the env-asserted write client (shared mechanic)**

Create `scripts/sanity-client.ts`:

```ts
import { createClient, type SanityClient } from "@sanity/client";

const SANITY_PROJECT_ID = process.env.SANITY_PROJECT_ID;
const SANITY_DATASET = process.env.SANITY_DATASET;
const SANITY_API_TOKEN = process.env.SANITY_API_TOKEN;

if( !SANITY_PROJECT_ID ) throw new Error( "Missing SANITY_PROJECT_ID env var" );
if( !SANITY_DATASET ) throw new Error( "Missing SANITY_DATASET env var" );
if( !SANITY_API_TOKEN ) throw new Error( "Missing SANITY_API_TOKEN env var (needs write access)" );

/** Client for write-capable content scripts (seed, set-logo). */
export function createWriteClient(): SanityClient {
  return createClient( {
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    apiVersion: "2026-07-09",
    useCdn: false,
    token: SANITY_API_TOKEN,
  } );
}
```

- [ ] **Step 2: Refactor seed.ts to use it**

In `scripts/seed.ts`, delete lines 10-24 (the env asserts and `createClient` call, and the `createClient` import — keep the `IdentifiedSanityDocumentStub` type import) and replace with:

```ts
import { type IdentifiedSanityDocumentStub } from "@sanity/client";
import { createWriteClient } from "./sanity-client";
// ... existing seed-data imports unchanged ...

const client = createWriteClient();
```

Note: `seed.ts` logs `SANITY_DATASET` in its success message; change that line to use `client.config().dataset`:

```ts
console.log( `Seeded ${documents.length} documents into ${client.config().dataset}` );
```

- [ ] **Step 3: Add the logo to the seed baseline**

In `scripts/seed-data/siteSettings.ts`, rename the unused `_client` parameter to `client` and add a `logo` field to the returned object:

```ts
export async function buildSiteSettings( client: SanityClient ) {
  return {
    _id: "siteSettings",
    _type: "siteSettings",
    logo: await uploadImage(
      client,
      "docs/content-audit/images/treat-yourself-studios-sign-logo.jpg",
      "Treat YourSelf Studios logo — a green succulent inside a brush-stroke circle",
    ),
    // ... all existing fields unchanged ...
```

Add the import at the top: `import { uploadImage } from "./helpers";`

- [ ] **Step 4: Write set-logo.ts**

```ts
import { uploadImage } from "./seed-data/helpers";
import { createWriteClient } from "./sanity-client";

const logoPath = process.argv[ 2 ];
if( !logoPath ) throw new Error( "Usage: yarn tsx scripts/set-logo.ts <path-to-logo-image>" );

const client = createWriteClient();

async function setLogo(): Promise<void> {
  const logo = await uploadImage(
    client,
    logoPath,
    "Treat YourSelf Studios logo — a green succulent inside a brush-stroke circle",
  );
  await client.patch( "siteSettings" ).set( { logo } ).commit();
  console.log( `siteSettings.logo now points at ${logoPath}` );
}

setLogo().catch( ( error ) => {
  console.error( error );
  process.exit( 1 );
} );
```

- [ ] **Step 5: Add the Makefile target and README row**

Makefile, after the `seed` target (Makefile exports `.env` vars via `-include .env` / `export`, so the token is available):

```makefile
set-logo: ## Upload an image and set it as the Sanity site logo (usage: make set-logo LOGO=path/to/file.jpg)
	yarn tsx scripts/set-logo.ts $(LOGO)
```

README Commands table, after the `make seed` row:

```markdown
| `make set-logo LOGO=<file>` | Upload an image and set it as the site logo in Sanity |
```

- [ ] **Step 6: Verify with the project checks**

Run: `yarn run check && yarn lint`
Expected: clean. (`astro check` type-checks `scripts/` too via the project tsconfig; lint covers the new files.)

- [ ] **Step 7: Commit**

```bash
git add scripts/sanity-client.ts scripts/set-logo.ts scripts/seed.ts scripts/seed-data/siteSettings.ts Makefile README.md
git commit -m "feat: add set-logo script with shared Sanity write client; seed baseline logo"
```

---

### Task 5: Upload the interim logo and final verification

**Files:** none (operational task)

**Interfaces:**
- Consumes: `make set-logo` from Task 4; committed logo from Task 1.

- [ ] **Step 1: Run the logo upload**

Run: `make set-logo LOGO=docs/content-audit/images/treat-yourself-studios-sign-logo.jpg`
Expected: prints `siteSettings.logo now points at ...`, exit 0. On missing env vars it throws loudly — the `.env` file must exist in the worktree (copy from the main checkout via glob pattern if absent, without reading it).

- [ ] **Step 2: Rebuild and confirm the logo renders**

Run: `yarn build && grep -c 'cdn.sanity.io' dist/index.html`
Expected: build succeeds; grep count increases vs. before (the nav/footer now emit `<img src="https://cdn.sanity.io/...">` for the logo). Then grep specifically: `grep -o 'alt="Treat YourSelf Studios"[^>]*' dist/index.html | head -2` should show the nav/footer logo imgs.

- [ ] **Step 3: Full CI-equivalent check**

Run: `make check`
Expected: types, lint, build all pass (mirrors CI exactly).

- [ ] **Step 4: Ask the user to eyeball the site in their dev server**

Nav + footer logo, homepage gift-card section, find-us photo, /about interior. Do NOT start a dev server.

- [ ] **Step 5: Push and open the PR**

```bash
git push -u origin studio-imagery
gh pr create --head studio-imagery --title "feat: real studio photography + interim sign logo" --body "..."
```

PR body summarizes: three swapped/new static images (sources: owner's building photo + the studio's own Google Business listing photos), about-page layout addition, interim logo pipeline (`make set-logo`), seed baseline updated, and notes the logo is interim pending the owner's original artwork. Then report the PR link to the user.
