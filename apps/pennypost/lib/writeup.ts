import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * Read `WRITEUP.md` so the Under the Hood page can render it.
 *
 * The writeup is the single source: it is the file in the repo, and it is the page
 * at /under-the-hood/. There is no second copy to drift.
 *
 * ⚠️ SERVER ONLY. Never import this from a `"use client"` component. Doing so fails
 * the build with `Module not found: Can't resolve 'fs'`, which is a free boundary
 * check — no `server-only` dependency needed to enforce it.
 *
 * Three things here are deliberate:
 *
 * 1. Reading the filesystem is legal in this app, and it is the MIRROR IMAGE of the
 *    rule in `session.ts`, not a violation of it. `output: "export"` does not change
 *    where Server Components run: `next build` still executes them in Node, and the
 *    export is a post-pass over the result. That same fact is why `sessionStorage`
 *    must never be touched during render, and why `fs` is available here.
 *
 * 2. The path is anchored on `process.cwd()`, never `__dirname` or `import.meta.url`.
 *    Bundled server code lives under `.next/server/`, so a module-relative path
 *    resolves somewhere that is not the app root. In the container `cwd` is `/app`
 *    and the Dockerfile's `COPY . .` puts the file at `/app/WRITEUP.md`.
 *
 * 3. THERE IS NO try/catch, and that is the point. A missing or unreadable
 *    `WRITEUP.md` must abort the build. Catching `ENOENT` and returning "" would
 *    publish an empty page on a green build, which is the worst available outcome
 *    and exactly the failure `src/scripts/ingest-brain.ts` already guards against
 *    for `brain.json`. If this file cannot be read, nothing should ship.
 *    → the check that proves it: rename WRITEUP.md, run `npm run build`, watch it fail.
 */
export function readWriteup(): string {
  return readFileSync(path.join(process.cwd(), "WRITEUP.md"), "utf8");
}
