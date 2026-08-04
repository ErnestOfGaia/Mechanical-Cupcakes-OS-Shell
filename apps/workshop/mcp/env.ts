/**
 * Env for the MCP server.
 *
 * Claude Desktop spawns a server with a minimal environment — it will not have the
 * shell's variables and it does not run `next`, so nothing loads `.env.local` for us.
 * Read the two WORKSHOP_* vars out of it by hand rather than adding a dotenv
 * dependency for four lines of parsing.
 *
 * Anything already in `process.env` wins, so the `env` block in a Claude Desktop or
 * Claude Code config overrides the file rather than fighting it.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Where .env.local sits relative to this file, both as source and as a bundle. */
function envPaths(): string[] {
  const here = path.dirname(fileURLToPath(import.meta.url));
  return [
    path.join(here, "..", ".env.local"),        // running from mcp/ via tsx
    path.join(here, "..", "..", ".env.local"),  // running from mcp/dist/ as a bundle
  ];
}

export function loadEnv(): { loadedFrom: string | null } {
  for (const file of envPaths()) {
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
      const m = /^\s*(WORKSHOP_[A-Z_]+)\s*=\s*(.*?)\s*$/.exec(line);
      if (!m) continue;
      if (process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
    return { loadedFrom: file };
  }
  return { loadedFrom: null };
}
