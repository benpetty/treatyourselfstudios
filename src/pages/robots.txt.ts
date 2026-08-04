import type { APIRoute } from "astro";

// Replaces the former static public/robots.txt so the sitemap URL follows the
// env-driven site URL, and so staging (NOINDEX=true) blocks crawling entirely.
export const GET: APIRoute = ( { site } ) => {
  if( !site ) throw new Error( "robots.txt requires astro.config `site`" );
  const noindex = process.env.NOINDEX === "true";
  const body = noindex
    ? "User-agent: *\nDisallow: /\n"
    : `User-agent: *\nAllow: /\nDisallow: /legacy/\n\nSitemap: ${new URL( "sitemap-index.xml", site ).href}\n`;
  return new Response( body, { headers: { "Content-Type": "text/plain; charset=utf-8" } } );
};
