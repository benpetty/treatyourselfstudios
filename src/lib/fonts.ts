// Shared by astro.config.mjs (font definitions) and BaseHead (<Font> tags).
// global.css consumes these same custom properties by name.
export const FONT_CSS_VARIABLES = {
  body: "--font-body",
  display: "--font-display",
  displayCondensed: "--font-display-condensed",
} as const;
