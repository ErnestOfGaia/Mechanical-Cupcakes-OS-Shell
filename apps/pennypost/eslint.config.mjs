import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * The repo root has an identical config, but its ignore globs resolve relative to
 * the ROOT — so `.next/**` there does not cover `apps/pennypost/.next/**`. Running
 * `eslint .` from this directory without a local config lints the minified build
 * output and reports ten thousand phantom problems at column 8484 of line 1.
 *
 * (`apps/workshop` and `apps/ochi` have the same latent issue; their lint scripts
 * are presumably only ever run clean.)
 */
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "node_modules/**", "next-env.d.ts"]),
]);

export default eslintConfig;
