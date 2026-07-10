// @ts-check
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import { LEGACY_REDIRECT_PATHS } from "./src/lib/redirects";

export default defineConfig( {
  site: "https://treatyourselfstudios.net",
  integrations: [
    sitemap( {
      filter: ( page ) =>
        !LEGACY_REDIRECT_PATHS.some( ( legacyPath ) => new URL( page ).pathname === `/${legacyPath}/` ),
    } ),
  ],
} );
