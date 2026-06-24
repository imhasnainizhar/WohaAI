// eslint.config.ts
import nextVitals from "eslint-config-next/core-web-vitals";
import tseslint from "typescript-eslint";


/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  ...nextVitals,
  ...tseslint.configs.recommended,
  
  // Custom rules
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-unused-expressions": "warn",
    },
  },
];
