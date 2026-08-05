import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // The globs above only match at the ROOT. Sub-apps carry their own build
    // artifacts (apps/pennypost/.next alone is >100MB), and without these the
    // root `npx eslint .` gate crawls generated bundles for minutes. Sub-app
    // SOURCE still gets linted; each app also has its own local eslint config.
    "apps/**/.next/**",
    "apps/**/out/**",
    "apps/**/build/**",
    "apps/**/next-env.d.ts",
    // Stale git worktree — a full duplicate of the repo; never lint it.
    ".claude/**",
  ]),
]);

export default eslintConfig;
