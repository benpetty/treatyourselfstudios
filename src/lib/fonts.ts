// Single source for the site's fonts: astro.config.mjs turns these into Fonts
// API definitions, BaseHead renders a <Font> per entry, and global.css consumes
// the custom properties by name.
//
// Files are Fontsource's weight-axis-only latin builds. The Fontsource *provider*
// serves full-axis files instead (Fraunces 121KB vs 37KB), which pushed the
// hero's LCP past budget.
// A literal union, not `--${string}`: <Font>'s cssVariable prop is typed as the
// exact set of variables Astro generated from the config.
type FontCssVariable = "--font-body" | "--font-display" | "--font-display-condensed";

export interface SiteFont {
  name: string;
  cssVariable: FontCssVariable;
  file: string;
  weightRange: string;
  genericFamily: "sans-serif" | "serif";
  /** Above-the-fold fonts only; preloading everything delays the LCP font. */
  preload: boolean;
}

export const SITE_FONTS: readonly SiteFont[] = [
  {
    name: "Inter",
    cssVariable: "--font-body",
    file: "@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
    weightRange: "100 900",
    genericFamily: "sans-serif",
    preload: true,
  },
  {
    name: "Fraunces",
    cssVariable: "--font-display",
    file: "@fontsource-variable/fraunces/files/fraunces-latin-wght-normal.woff2",
    weightRange: "100 900",
    genericFamily: "serif",
    preload: true,
  },
  {
    name: "Oswald",
    cssVariable: "--font-display-condensed",
    file: "@fontsource-variable/oswald/files/oswald-latin-wght-normal.woff2",
    weightRange: "200 700",
    genericFamily: "sans-serif",
    preload: false,
  },
];
