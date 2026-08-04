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
  const board: Board = normalise(raw as Partial<Board>);
  const result = await saveBoard(board);
  if (!result.ok) return Response.json(result, { status: 409 });
  return Response.json(result);
}
