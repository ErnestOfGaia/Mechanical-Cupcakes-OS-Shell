/**
 * SERVER ONLY. Import this from route handlers and server components only — it reads
 * `node:fs` and would break a client bundle. (The `server-only` package isn't a
 * dependency of this repo, so the guarantee is this comment plus the node: imports,
 * which fail loudly at build time if this ever gets pulled into client code.)
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { normalise } from "./board";
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

async function readJson(file: string): Promise<unknown | null> {
  try {
    const raw = await fs.readFile(file, "utf8");
    if (!raw.trim()) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function dirs(base: string): Promise<string[]> {
  try {
    const es = await fs.readdir(base, { withFileTypes: true });
    return es.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    return null as unknown as string[];
  }
}

/**
 * Scan the Marketing department for board.json files. Two places, matching the
 * folder contract: a campaign lives in its own folder under Potential Campaigns,
 * a channel lives in its numbered channel folder.
 */
export async function listBoards(): Promise<{ boards: Board[]; scanned: string[]; errors: string[] }> {
  const st = vaultStatus();
  const boards: Board[] = [];
  const scanned: string[] = [];
  const errors: string[] = [];
  if (!st.enabled || !st.root) return { boards, scanned, errors: ["vault disabled"] };

  const roots = ["Campaign Content/Potential Campaigns", "Campaign Content"];
  for (const r of roots) {
    const full = resolveInRoot(st.root, r);
    if (!full) { errors.push(`refused path: ${r}`); continue; }
    const names = await dirs(full);
    if (!names) { errors.push(`unreadable: ${r}`); continue; }
    for (const name of names) {
      const rel = path.posix.join(r, name, "board.json");
      const file = resolveInRoot(st.root, rel);
      if (!file) continue;
      scanned.push(rel);
      const data = await readJson(file);
      if (!data) continue;
      const ws = data as { campaigns?: unknown[] };
      const list = Array.isArray(ws.campaigns) ? ws.campaigns : [data];
      list.forEach((raw) => {
        const b = normalise({ ...(raw as Partial<Board>), sourcePath: rel });
        boards.push(b);
      });
    }
  }
  return { boards, scanned, errors };
}

export async function saveBoard(board: Board): Promise<{ ok: true; path: string } | { ok: false; error: string }> {
  const st = vaultStatus();
  if (!st.enabled || !st.root) return { ok: false, error: "vault disabled — WORKSHOP_VAULT_ROOT is not set" };
  if (!st.writable) return { ok: false, error: "vault is read-only — set WORKSHOP_VAULT_WRITE=1 to allow writes" };

  const rel = board.sourcePath?.trim() || defaultPathFor(board);
  if (!rel.endsWith("board.json")) return { ok: false, error: "refusing to write a file that is not board.json" };
  const file = resolveInRoot(st.root, rel);
  if (!file) return { ok: false, error: `refused path outside the vault root: ${rel}` };

  const payload = { version: 3, identity: "E", activeId: board.id, campaigns: [{ ...board, sourcePath: undefined }] };
  try {
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, JSON.stringify(payload, null, 2), "utf8");
    return { ok: true, path: rel };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "write failed" };
  }
}

export function defaultPathFor(board: Board): string {
  const dir = board.kind === "channel" ? "Campaign Content" : "Campaign Content/Potential Campaigns";
  const name = board.name.replace(/[\\/:*?"<>|]/g, "").trim() || "Untitled";
  return path.posix.join(dir, name, "board.json");
}
