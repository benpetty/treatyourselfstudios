// @ts-check
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import { loadEnv } from "vite";
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

export default defineConfig( {
  site: SITE_URL,
  integrations: [
    sitemap( {
      filter: ( page ) =>
        !LEGACY_REDIRECT_PATHS.some( ( legacyPath ) => new URL( page ).pathname === `/${legacyPath}/` ),
    } ),
  ],
} );
