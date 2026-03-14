import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default tseslint.config(
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    rules: {
      // HTTP fetch/scraping returns dynamic data; any is acceptable here
      "@typescript-eslint/no-explicit-any": "warn",
      // Allow _-prefixed parameters to mark intentionally unused args
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
  {
    ignores: ["dist/", "lib/", "out-test/", "node_modules/"],
  },
);
