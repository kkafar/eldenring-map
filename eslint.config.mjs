import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-config-prettier";

export default defineConfig([
  {
    ignores: [
      "**/node_modules/",
      "**/dist/",
      "**/routeTree.gen.ts",
      "packages/server/storage/",
      "packages/client/src/assets/",
      "packages/client/src/data/",
      ".venv/",
      "scripts/",
    ],
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ["packages/client/src/**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooks },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  prettier,
]);
