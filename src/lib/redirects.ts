import type { SiteSettings } from "./sanity";

// The old site's /packages URL needs no entry: it matches the new URL, and
// Astro's static-route priority would drop the redirect page anyway.
const LEGACY_REDIRECTS: Record<string, string> = {
  "hair-removal": "/services/hair-removal/",
  "facials": "/services/facials/",
  "lash-&-brow": "/services/lash-and-brow/",
  "body-treatments": "/services/body-treatments/",
  "service-add-ons": "/packages/#add-ons",
  "deals-&-specials": "/packages/#deals",
  "q-&-a": "/faq/",
  "personal-testimonies": "/about/",
  "terms-and-conditions": "/terms/",
};

// Square Online store URLs indexed on the old site, captured verbatim from
// its sitemap.ols.xml on 2026-08-04 (1 index + 46 products + 10 categories).
// Every one 404s after DNS cutover unless pre-rendered as a redirect page.
// All share one target: the Square-hosted store (settings.shopUrl) once the
// owner sets it, /contact/ until then. "home-care/ols/products" is the same
// store index reached through the old site's page nesting — links in the
// wild use both forms.
const LEGACY_STORE_PATHS = [
  "home-care/ols/products",
  "ols/categories/bath--body",
  "ols/categories/cleansers",
  "ols/categories/exfoliants",
  "ols/categories/eye--lip-care",
  "ols/categories/masks",
  "ols/categories/moisturizers",
  "ols/categories/serums",
  "ols/categories/sunscreens",
  "ols/categories/toners",
  "ols/categories/treatments-kits",
  "ols/products",
  "ols/products/acai-berry-moisturizer",
  "ols/products/ageless-hydrating-serum",
  "ols/products/ageless-skin-moisturizer",
  "ols/products/babe-lash-mini-essential-serum",
  "ols/products/beta-carotenepapain-renewal-serum",
  "ols/products/blemish-spot-treatment",
  "ols/products/cacteen-balancing-moisturizer",
  "ols/products/citrus-c-nourishing-cream",
  "ols/products/clarifying-toner-pads",
  "ols/products/collagen-sheet-mask-10-pack",
  "ols/products/collagen-sheet-mask-single",
  "ols/products/cucumber-hydration-toner",
  "ols/products/dry-skin-kit",
  "ols/products/eco-friendly-spa-headband",
  "ols/products/glycolic-and-retinol-pads",
  "ols/products/glycolic-cleanser",
  "ols/products/green-tea-citrus-cleanser",
  "ols/products/hydrating-moisturizer",
  "ols/products/hydro-sun",
  "ols/products/hyperpigmentation-kit-aka-prepost-peel-care-kit",
  "ols/products/light-aloe-moisturizer",
  "ols/products/lip-balm-spf-15",
  "ols/products/mild-acne-kit",
  "ols/products/minimal",
  "ols/products/mint-lip-hydrator",
  "ols/products/mint-refining-toner",
  "ols/products/moderate-acne-kit",
  "ols/products/oily-skin-kit",
  "ols/products/peptide-eye-serum",
  "ols/products/peptide-restoration-moisturizer",
  "ols/products/plump-protect-lite-kit",
  "ols/products/pomegranate-antioxidant-cleanser",
  "ols/products/raspberry-refining-cleanser",
  "ols/products/raspberry-refining-scrub",
  "ols/products/refine-renew",
  "ols/products/retinaldehyde-serum-with-iconica",
  "ols/products/retinol-2-exfoliating-scrubmask",
  "ols/products/rosaceasensitive-skin-kit",
  "ols/products/satin-pillow-eye-mask-black",
  "ols/products/satin-pillow-eye-mask-blush",
  "ols/products/sheer-protection-spf-30",
  "ols/products/the-creamy-restore-four",
  "ols/products/the-lite-restore-four",
  "ols/products/tri-peptide-eye-cream",
  "ols/products/vitamin-cgreen-tea-serum",
  "ols/products/wash",
];

/** Redirect-page paths, for excluding from the sitemap (astro.config.mjs). */
export const LEGACY_REDIRECT_PATHS = [
  ...Object.keys( LEGACY_REDIRECTS ),
  "home-care",
  ...LEGACY_STORE_PATHS,
];

export function legacyRedirectTargets( settings: SiteSettings ): Record<string, string> {
  const shopTarget = settings.shopUrl ?? "/contact/";
  const storeEntries = Object.fromEntries(
    LEGACY_STORE_PATHS.map( ( storePath ) => [ storePath, shopTarget ] ),
  );
  return { ...LEGACY_REDIRECTS, ...storeEntries, "home-care": shopTarget };
}
