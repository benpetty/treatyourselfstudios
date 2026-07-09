// @ts-check
import eslintJs from "@eslint/js";
import eslintPluginAstro from "eslint-plugin-astro";
import typescriptEslint from "typescript-eslint";

export default typescriptEslint.config(
  { ignores: ["dist/", ".astro/", "node_modules/", "studio/"] },
  eslintJs.configs.recommended,
  ...typescriptEslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
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
