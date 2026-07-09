// @ts-check
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

export default defineConfig( {
  site: "https://treatyourselfstudios.net",
  integrations: [ sitemap() ],
} );
