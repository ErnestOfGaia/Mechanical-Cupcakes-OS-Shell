import { listBoards, saveBoard, vaultStatus } from "@/lib/vault";
import { normalise } from "@/lib/board";
import type { Board } from "@/lib/types";

/**
 * GET  — every board.json found in the Marketing department.
 * PUT  — write one board back to where it came from.
 *
 * Both report the vault's actual state rather than pretending. "No boards found" and
 * "the vault is switched off" are different answers and must never read the same.
 */

export async function GET() {
  const st = vaultStatus();
  if (!st.enabled) {
    return Response.json({ enabled: false, reason: st.reason, boards: [] }, { status: 200 });
  }
  const { boards, scanned, errors } = await listBoards();
  return Response.json({
    enabled: true,
    writable: st.writable,
    boards,
    // Evidence, not a verdict: what was looked at, and what went wrong.
    scanned: scanned.length,
    errors,
  });
}

export async function PUT(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "body is not JSON" }, { status: 400 });
  }
  const raw = (body as { board?: unknown })?.board;
  if (!raw || typeof raw !== "object") {
    return Response.json({ ok: false, error: "expected { board: … }" }, { status: 400 });
  }
  const force = (body as { force?: unknown })?.force === true;
  const board: Board = normalise(raw as Partial<Board>);
  const result = await saveBoard(board, { expectedMtimeMs: board.mtimeMs, force });

  if (result.ok) return Response.json(result);

  /**
   * 409 means one specific thing — the file changed underneath you — so the client can
   * offer "reload" or "overwrite". Everything else is a plain failure and must not wear
   * the same status code, or the UI ends up offering to overwrite its way out of a
   * permissions error.
   */
  return Response.json(result, { status: result.conflict ? 409 : 500 });
}
