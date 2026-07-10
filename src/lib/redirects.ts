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

/** Redirect-page paths, for excluding from the sitemap (astro.config.mjs). */
export const LEGACY_REDIRECT_PATHS = [ ...Object.keys( LEGACY_REDIRECTS ), "home-care" ];

export function legacyRedirectTargets( settings: SiteSettings ): Record<string, string> {
  return { ...LEGACY_REDIRECTS, "home-care": settings.shopUrl ?? "/contact/" };
}
