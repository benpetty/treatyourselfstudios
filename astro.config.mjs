// @ts-check
import sitemap from "@astrojs/sitemap";
import { defineConfig, fontProviders } from "astro/config";
import { loadEnv } from "vite";
import { SITE_FONTS } from "./src/lib/fonts";
import { LEGACY_REDIRECT_PATHS } from "./src/lib/redirects";

// Env-driven so the same pipeline serves staging (staging.treatyourselfstudios.net,
// with NOINDEX=true) now and the apex domain after DNS cutover. CI provides
// these via repo Actions variables (process.env); local commands run without
// the Makefile's env export, so fall through to Vite's .env-file loading.
// Multi-source lookup, not a value fallback — a missing value still throws.
const fileEnv = loadEnv( process.env.NODE_ENV ?? "production", process.cwd(), "" );
const SITE_URL = process.env.SITE_URL ?? fileEnv.SITE_URL;
if( !SITE_URL ) throw new Error( "Missing SITE_URL env var" );
if( process.env.NOINDEX === undefined && fileEnv.NOINDEX !== undefined ) {
  process.env.NOINDEX = fileEnv.NOINDEX;
}

// Variable fonts via the Fonts API rather than raw Fontsource CSS: Astro
// generates a metric-matched fallback @font-face (size-adjust + ascent/descent
// overrides on the generic family's local font) for each, so text wraps the
// same before and after the web font swaps in. Without it, the swap reflowed
// the header on CI's DejaVu fallback and failed Lighthouse CLS (#26).
export default defineConfig( {
  site: SITE_URL,
  fonts: SITE_FONTS.map( ( font ) => ( {
    provider: fontProviders.local(),
    name: font.name,
    cssVariable: font.cssVariable,
    fallbacks: [ font.genericFamily ],
    options: { variants: [ { weight: font.weightRange, style: "normal", src: [ font.file ] } ] },
  } ) ),
  integrations: [
    sitemap( {
      filter: ( page ) =>
        !LEGACY_REDIRECT_PATHS.some( ( legacyPath ) => new URL( page ).pathname === `/${legacyPath}/` ),
    } ),
  ],
} );
