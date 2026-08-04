/**
 * SERVER ONLY. Import this from route handlers and server components only — it reads
 * `node:fs` and would break a client bundle. (The `server-only` package isn't a
 * dependency of this repo, so the guarantee is this comment plus the node: imports,
 * which fail loudly at build time if this ever gets pulled into client code.)
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { normalise, slug } from "./board";
import { fieldIdentical } from "./compare";
import type { Board } from "./types";

/**
 * The vault adapter — the whole reason this app is worth moving out of a browser
 * artifact. An artifact cannot read a note or write a folder; a Next route handler can.
 *
 * It is deliberately OFF unless `WORKSHOP_VAULT_ROOT` is set, and read-only unless
 * `WORKSHOP_VAULT_WRITE=1`. A client-facing deployment sets neither and falls back to
 * browser storage, which is correct: a client has no vault, and this app must keep
 * working standalone per the MCOS invariant.
 */

export interface VaultStatus {
  enabled: boolean;
  writable: boolean;
  root: string | null;
  reason?: string;
}

export function vaultStatus(): VaultStatus {
  const root = process.env.WORKSHOP_VAULT_ROOT?.trim();
  if (!root) {
    return { enabled: false, writable: false, root: null, reason: "WORKSHOP_VAULT_ROOT is not set — using browser storage" };
  }

  /**
   * FAIL-SAFE. This app has no authentication. On a public subdomain an enabled vault
   * would be an open, unauthenticated read/write surface onto the Marketing department —
   * so in production the vault stays OFF unless someone deliberately says otherwise.
   *
   * The intended split: the public deployment runs browser-only (that is the client
   * product), and the vault-backed instance runs on Ernest's own machine, where the
   * vault actually lives. A guard is cheap; discovering this the other way is not.
   */
  if (process.env.NODE_ENV === "production" && process.env.WORKSHOP_ALLOW_VAULT_IN_PROD !== "1") {
    return {
      enabled: false,
      writable: false,
      root: null,
      reason: "vault refused in production — this app has no auth. Set WORKSHOP_ALLOW_VAULT_IN_PROD=1 only behind one.",
    };
  }

  return { enabled: true, writable: process.env.WORKSHOP_VAULT_WRITE === "1", root };
}

/**
 * Refuse any path that escapes the root. Called on every read and every write —
 * a board's `sourcePath` arrives from the client and is therefore untrusted input.
 */
export function resolveInRoot(root: string, candidate: string): string | null {
  const base = path.resolve(root);
  const full = path.resolve(base, candidate);
  const rel = path.relative(base, full);
  if (rel === "" || rel.startsWith("..") || path.isAbsolute(rel)) return null;
  return full;
}

/**
 * NOTE ON LONG PATHS. The committed-campaign folders run past 240 characters and a
 * temp-file suffix pushes them over Windows' classic 260-char MAX_PATH. This code does
 * NOT add a `\\?\` prefix, because it was measured rather than assumed: on Windows 11
 * with LongPathsEnabled=0, Node v24 handles paths to ~4000 chars because libuv applies
 * the prefix internally. Adding our own would be dead code that also breaks forward
 * slashes. `vault.write.test.ts` drives a >260-char path through saveBoard so that if a
 * runtime change ever reintroduces the limit, a test goes red instead of a save
 * silently failing.
 */

async function readJson(file: string): Promise<unknown | null> {
  try {
    const raw = await fs.readFile(file, "utf8");
    if (!raw.trim()) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function dirs(base: string): Promise<string[] | null> {
  try {
    const es = await fs.readdir(base, { withFileTypes: true });
    return es.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    return null;
  }
}

/** Folders whose names start with `_` are workspace plumbing (`_workshop-backups`), not boards. */
const isPlumbing = (name: string): boolean => name.startsWith("_");

/**
 * Scan the Marketing department for board.json files. Three places, matching the
 * folder contract:
 *   1. a campaign in its own folder under Potential Campaigns
 *   2. a channel in its numbered channel folder directly under Campaign Content
 *   3. a COMMITTED campaign, which sits one level deeper — inside the dated
 *      "01 Committed Blog Campaigns <week>" folder. A committed campaign has left the
 *      workshop, but the board stays readable as historical record, and Last Mile is a
 *      logged exception: a committed campaign still using the workshop as a tool.
 */
export async function listBoards(): Promise<{ boards: Board[]; scanned: string[]; errors: string[] }> {
  const st = vaultStatus();
  const boards: Board[] = [];
  const scanned: string[] = [];
  const errors: string[] = [];
  if (!st.enabled || !st.root) return { boards, scanned, errors: ["vault disabled"] };

  const root = st.root;
  const seen = new Set<string>();

  async function tryBoardAt(rel: string): Promise<void> {
    if (seen.has(rel)) return;
    seen.add(rel);
    const file = resolveInRoot(root, rel);
    if (!file) return;
    scanned.push(rel);
    const data = await readJson(file);
    if (!data) return;
    let mtimeMs: number | undefined;
    try { mtimeMs = (await fs.stat(file)).mtimeMs; } catch { mtimeMs = undefined; }
    const ws = data as { campaigns?: unknown[] };
    const list = Array.isArray(ws.campaigns) ? ws.campaigns : [data];
    list.forEach((raw) => {
      boards.push(normalise({ ...(raw as Partial<Board>), sourcePath: rel, mtimeMs }));
    });
  }

  // Tiers 1 and 2 — one level under each root.
  for (const r of ["Campaign Content/Potential Campaigns", "Campaign Content"]) {
    const full = resolveInRoot(root, r);
    if (!full) { errors.push(`refused path: ${r}`); continue; }
    const names = await dirs(full);
    if (!names) { errors.push(`unreadable: ${r}`); continue; }
    for (const name of names) {
      if (isPlumbing(name)) continue;
      await tryBoardAt(path.posix.join(r, name, "board.json"));
    }
  }

  // Tier 3 — committed campaigns, one level deeper than the rest.
  const ccFull = resolveInRoot(root, "Campaign Content");
  if (ccFull) {
    const top = (await dirs(ccFull)) ?? [];
    for (const name of top) {
      if (isPlumbing(name) || !/committed/i.test(name)) continue;
      const inner = resolveInRoot(root, path.posix.join("Campaign Content", name));
      if (!inner) continue;
      const subs = await dirs(inner);
      if (!subs) { errors.push(`unreadable: Campaign Content/${name}`); continue; }
      for (const sub of subs) {
        if (isPlumbing(sub)) continue;
        await tryBoardAt(path.posix.join("Campaign Content", name, sub, "board.json"));
      }
    }
  }

  return { boards, scanned, errors };
}

/* ------------------------------------------------------------------ saving */

export interface SaveOk {
  ok: true;
  path: string;
  /** Always true — the value of this flag is that it is only ever set after a read-back. */
  verified: true;
  mtimeMs: number;
  backup?: string;
}

export interface SaveFail {
  ok: false;
  error: string;
  /** Set when the refusal was "the file changed underneath you", not "the write broke". */
  conflict?: boolean;
  diskMtimeMs?: number;
  /** Which step failed, so a failure says where rather than only that. */
  step?: string;
}

export interface SaveOpts {
  /** The mtime the caller last saw. Absent means the caller never read this file. */
  expectedMtimeMs?: number;
  /** Overwrite regardless of what is on disk. The UI asks before setting this. */
  force?: boolean;
}

const AUTO_BACKUP_DIR = "Campaign Content/_workshop-backups/auto";
const KEEP_BACKUPS = 10;

/** Read a board file and hand back the board inside its envelope, or null. */
async function readBoardFile(file: string): Promise<Partial<Board> | null> {
  const data = await readJson(file);
  if (!data) return null;
  const ws = data as { campaigns?: unknown[] };
  const raw = Array.isArray(ws.campaigns) ? ws.campaigns[0] : data;
  return (raw ?? null) as Partial<Board> | null;
}

/**
 * Read a file back and confirm it holds the board we meant to write.
 *
 * This is the whole point of the phase. The browser mockup's backup button reported
 * success for a file that was never written, because a sandboxed download does not
 * throw — a check that cannot detect its own failure always reports the flattering
 * result. So the save path never trusts that a call returned: it reads the artifact
 * and compares it.
 */
export async function verifyOnDisk(file: string, expected: Board): Promise<{ ok: boolean; reason?: string }> {
  const got = await readBoardFile(file);
  if (!got) return { ok: false, reason: "file is missing, empty, or not parseable JSON" };
  if (!fieldIdentical(expected, got)) return { ok: false, reason: "file parsed, but its contents differ from the board that was saved" };
  return { ok: true };
}

/** Copy the current file aside before overwriting it, keeping the last KEEP_BACKUPS. */
async function backupExisting(root: string, file: string, board: Board, stamp: string): Promise<string | undefined> {
  const relDir = path.posix.join(AUTO_BACKUP_DIR, slug(board.name) || "untitled");
  const dirFull = resolveInRoot(root, relDir);
  if (!dirFull) return undefined;
  try {
    await fs.mkdir(dirFull, { recursive: true });
    const rel = path.posix.join(relDir, `${stamp}.board.json`);
    const dest = resolveInRoot(root, rel);
    if (!dest) return undefined;
    await fs.copyFile(file, dest);

    const kept = (await fs.readdir(dirFull)).filter((n) => n.endsWith(".board.json")).sort();
    for (const old of kept.slice(0, Math.max(0, kept.length - KEEP_BACKUPS))) {
      await fs.rm(path.join(dirFull, old), { force: true });
    }
    return rel;
  } catch {
    // A failed backup must not block the save, but it must not be reported as taken.
    return undefined;
  }
}

export async function saveBoard(board: Board, opts: SaveOpts = {}): Promise<SaveOk | SaveFail> {
  const st = vaultStatus();
  if (!st.enabled || !st.root) return { ok: false, error: "vault disabled — WORKSHOP_VAULT_ROOT is not set", step: "status" };
  if (!st.writable) return { ok: false, error: "vault is read-only — set WORKSHOP_VAULT_WRITE=1 to allow writes", step: "status" };

  const rel = board.sourcePath?.trim() || defaultPathFor(board);
  if (!rel.endsWith("board.json")) return { ok: false, error: "refusing to write a file that is not board.json", step: "path" };
  const file = resolveInRoot(st.root, rel);
  if (!file) return { ok: false, error: `refused path outside the vault root: ${rel}`, step: "path" };

  // 1. What is on disk right now?
  let diskMtimeMs: number | undefined;
  try { diskMtimeMs = (await fs.stat(file)).mtimeMs; } catch { diskMtimeMs = undefined; }

  // 2. Conflict guard. Two writers now exist — the app and the MCP server — so a save
  //    that would overwrite an edit the caller never saw is refused rather than won.
  //    A caller with no expected mtime has never read this file, so an existing file is
  //    itself the conflict: silently clobbering it is the failure mode being avoided.
  if (!opts.force && diskMtimeMs !== undefined) {
    if (opts.expectedMtimeMs === undefined) {
      return {
        ok: false, conflict: true, diskMtimeMs, step: "conflict",
        error: "a board.json already exists there and this save did not say which version it was based on",
      };
    }
    if (Math.abs(opts.expectedMtimeMs - diskMtimeMs) > 1) {
      return {
        ok: false, conflict: true, diskMtimeMs, step: "conflict",
        error: "that board changed on disk since it was loaded",
      };
    }
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const tmp = `${file}.tmp-${process.pid}-${Math.random().toString(36).slice(2, 8)}`;
  const payload = { version: 3, identity: "E", activeId: board.id, campaigns: [{ ...board, sourcePath: undefined, mtimeMs: undefined }] };

  try {
    await fs.mkdir(path.dirname(file), { recursive: true });

    // 3. Take a copy of what is being replaced, before replacing it.
    const backup = diskMtimeMs === undefined ? undefined : await backupExisting(st.root, file, board, stamp);

    // 4. Write to a temp file first, so a half-written file never replaces a good one.
    await fs.writeFile(tmp, JSON.stringify(payload, null, 2), "utf8");

    // 5. Verify the TEMP file before it is allowed to become the real one.
    const tmpCheck = await verifyOnDisk(tmp, board);
    if (!tmpCheck.ok) {
      await fs.rm(tmp, { force: true });
      return { ok: false, error: `write did not survive read-back: ${tmpCheck.reason}`, step: "verify-temp" };
    }

    // 6. Swap it in. Obsidian and any sync client hold these files open from time to
    //    time, so a transient lock gets one retry — and then fails loudly.
    try {
      await fs.rename(tmp, file);
    } catch (e) {
      const code = (e as NodeJS.ErrnoException).code;
      if (code !== "EPERM" && code !== "EBUSY" && code !== "EACCES") throw e;
      await new Promise((r) => setTimeout(r, 150));
      await fs.rename(tmp, file);
    }

    // 7. Verify the REAL file. Step 5 proved the bytes were right; this proves they are
    //    the bytes now sitting at the path the automations read.
    const finalCheck = await verifyOnDisk(file, board);
    if (!finalCheck.ok) {
      return { ok: false, error: `saved file failed verification: ${finalCheck.reason}`, step: "verify-target" };
    }

    const mtimeMs = (await fs.stat(file)).mtimeMs;
    return { ok: true, path: rel, verified: true, mtimeMs, backup };
  } catch (e) {
    await fs.rm(tmp, { force: true }).catch(() => {});
    return { ok: false, error: e instanceof Error ? e.message : "write failed", step: "write" };
  }
}

export function defaultPathFor(board: Board): string {
  const dir = board.kind === "channel" ? "Campaign Content" : "Campaign Content/Potential Campaigns";
  const name = board.name.replace(/[\\/:*?"<>|]/g, "").trim() || "Untitled";
  return path.posix.join(dir, name, "board.json");
}
