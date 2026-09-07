import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * The shell's own development + architecture writeup, read at build time.
 *
 * One source, two surfaces: WRITEUP.md at the repo root IS the page at
 * /under-the-hood. If you find yourself typing prose into the page component, stop.
 *
 * ⚠️ SERVER ONLY. Importing this from a `"use client"` component fails the build
 * with `Module not found: Can't resolve 'fs'` — a free boundary check.
 *
 * Three rules, each load-bearing and each learned somewhere else in this project:
 *
 * 1. `process.cwd()`, never `__dirname`. Bundled server code lives under
 *    `.next/server/`, so a module-relative path resolves to the wrong place. In the
 *    container cwd is `/app`.
 *
 * 2. NO try/catch. A missing WRITEUP.md must abort the build rather than publish an
 *    empty page on a green one. This is the same failure the health check used to
 *    have in miniature: an existence test reports "fine" for the one state that is
 *    actually broken.
 *
 * 3. ⚠️ `.dockerignore` at the repo root excludes `*.md`. This file is only in the
 *    build context because of the explicit `!WRITEUP.md` negation next to it. If the
 *    page ever dies with ENOENT inside Docker while building fine locally, that
 *    negation is the first place to look — it is how the sibling app broke.
 */
export function readWriteup(): string {
  return readFileSync(path.join(process.cwd(), "WRITEUP.md"), "utf8");
}
