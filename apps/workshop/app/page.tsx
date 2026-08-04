import WorkshopClient from "@/components/WorkshopClient";
import { listBoards, vaultStatus } from "@/lib/vault";
import type { Board } from "@/lib/types";

/** Reads the vault on the server so the client never sees a filesystem path. */
export const dynamic = "force-dynamic";

export default async function Page() {
  const st = vaultStatus();
  let boards: Board[] = [];
  let errors: string[] = [];
  if (st.enabled) {
    const r = await listBoards();
    boards = r.boards;
    errors = r.errors;
  }
  return (
    <WorkshopClient
      initialBoards={boards}
      vault={{ enabled: st.enabled, writable: st.writable, reason: st.reason }}
      loadErrors={errors}
    />
  );
}
