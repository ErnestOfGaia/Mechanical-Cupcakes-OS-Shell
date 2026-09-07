import { readFileSync } from 'node:fs'
import path from 'node:path'

/**
 * OCHI's development + architecture writeup, read at build time.
 *
 * One source, two surfaces: WRITEUP.md in this app folder IS the page at
 * /under-the-hood. If you find yourself typing prose into the page component,
 * stop. Same arrangement as The Penny Post and the shell, on purpose.
 *
 * ⚠️ SERVER ONLY. Importing this from a "use client" component fails the build
 * with `Can't resolve 'fs'`, which is a free boundary check.
 *
 * Three rules, each load-bearing (Last Mile Plan § 4b):
 * 1. `process.cwd()`, never `__dirname` — bundled server code lives under
 *    `.next/server/`. In the Docker build cwd is /app, which is this folder.
 * 2. NO try/catch. A missing WRITEUP.md must fail the build, not publish an
 *    empty page on a green one.
 * 3. This app's .dockerignore does not exclude *.md, so the file is in the build
 *    context. If /under-the-hood ever dies with ENOENT in Docker while building
 *    locally, check that first.
 */
export function readWriteup(): string {
  return readFileSync(path.join(process.cwd(), 'WRITEUP.md'), 'utf8')
}
