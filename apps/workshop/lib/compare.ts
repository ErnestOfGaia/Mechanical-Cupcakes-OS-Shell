import { normalise } from "./board";
import type { Board } from "./types";

/**
 * Fields the vault adapter (or, later, the MCP server) attaches for its own
 * bookkeeping — where a board came from, when it was last read. Never part of the
 * board's own content, and never relevant when asking "is this the same board".
 */
const TRANSPORT_KEYS = ["sourcePath", "mtimeMs"];

/**
 * Canonical form of a board for comparison. Two boards that mean the same thing can
 * still differ in ways that don't matter: one came through `normalise` and the other
 * didn't yet, one carries a transport field the other doesn't, one has `undefined`
 * where the other has an absent key. `canon` collapses all three before anything is
 * compared, so `fieldIdentical` is only ever looking at content.
 */
export function canon(b: Partial<Board>): unknown {
  const n = normalise(b) as unknown as Record<string, unknown>;
  // JSON round-trip drops `undefined` values so an absent key and an explicit
  // `undefined` stop being a false mismatch.
  const clone = JSON.parse(JSON.stringify(n)) as Record<string, unknown>;
  for (const k of TRANSPORT_KEYS) delete clone[k];
  return clone;
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null || a === undefined || b === undefined) return a === b;
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a) || Array.isArray(b)) {
    // Arc and idea order is meaningful content — "IN but held by a seam" reads
    // differently depending on drop order — so arrays compare position by position.
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    return a.every((v, i) => deepEqual(v, b[i]));
  }
  if (typeof a === "object" && typeof b === "object") {
    const ao = a as Record<string, unknown>;
    const bo = b as Record<string, unknown>;
    // Object keys compare unordered — the same content written in a different key
    // order is still the same board.
    const ak = Object.keys(ao).sort();
    const bk = Object.keys(bo).sort();
    if (ak.length !== bk.length || ak.some((k, i) => k !== bk[i])) return false;
    return ak.every((k) => deepEqual(ao[k], bo[k]));
  }
  return false;
}

/**
 * "Same board" for round-trip and verified-save proofs: blind to which side is the
 * disk file and which is freshly loaded, blind to transport fields and key order,
 * strict about content and array order. This is the one comparator every write path
 * (saveBoard, the migration script, the MCP server) proves itself against — a check
 * that used its own ad-hoc comparison could pass by being lenient in the wrong place.
 */
export function fieldIdentical(a: Partial<Board>, b: Partial<Board>): boolean {
  return deepEqual(canon(a), canon(b));
}
