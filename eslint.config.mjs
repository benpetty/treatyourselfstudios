// @ts-check
import eslintJs from "@eslint/js";
import eslintPluginAstro from "eslint-plugin-astro";
import typescriptEslint from "typescript-eslint";

export default typescriptEslint.config(
  // TEMPORARY: .github/diagnostics/ holds the PR #26 CLS probe; remove with it.
  { ignores: ["dist/", ".astro/", "node_modules/", "studio/", ".github/diagnostics/"] },
  eslintJs.configs.recommended,
  ...typescriptEslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  {
    files: ["*.mjs"],
    languageOptions: { globals: { URL: "readonly", console: "readonly", process: "readonly" } }
  },
  {
    rules: {
      "space-in-parens": ["error", "always"],
      "id-length": ["error", { "min": 2, "exceptions": ["_"] }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }
      ]
    }
  }
);
