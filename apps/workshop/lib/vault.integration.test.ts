import { describe, expect, it } from "vitest";
import { listBoards, resolveInRoot, vaultStatus } from "./vault";

/**
 * Integration test against Ernest's real vault. It only runs when
 * WORKSHOP_VAULT_ROOT is set, so CI and any client deployment skip it —
 * but when it does run, it reads the actual Marketing department off disk.
 *
 * Run: WORKSHOP_VAULT_ROOT="…\EOG Backoffice\Marketing" npx vitest run lib/vault.integration
 */
const ROOT = process.env.WORKSHOP_VAULT_ROOT;
const maybe = ROOT ? describe : describe.skip;

maybe("the real vault", () => {
  it("reports itself enabled", () => {
    expect(vaultStatus().enabled).toBe(true);
  });

  it("finds at least one board and says what it scanned", async () => {
    const { boards, scanned, errors } = await listBoards();
    // Evidence, printed so a green tick is never the only thing reported.
    console.log(`scanned ${scanned.length} paths, ${errors.length} errors, ${boards.length} boards`);
    boards.forEach((b) =>
      console.log(`  [${b.kind}] ${b.name} — ${b.ideas.length} ideas, ${b.arc.length} arc, ${b.gate.length} gate  <- ${b.sourcePath}`));
    expect(boards.length).toBeGreaterThan(0);
  });

  it("loads the board written by the browser artifact, unchanged in shape", async () => {
    const { boards } = await listBoards();
    const loop = boards.find((b) => b.name === "The Unfinished Loop");
    expect(loop, "The Unfinished Loop should be on disk").toBeTruthy();
    expect(loop!.ideas.length).toBe(18);
    expect(loop!.arc.length).toBe(6);
    expect(loop!.kind).toBe("campaign");
    // Promoted into the committed pipeline during the 2026-08-09 reorg — it now sits
    // in the Workshop's work queue, inside the renamed campaign folder.
    expect(loop!.sourcePath).toContain("05 Needs Workshopped");
    expect(loop!.sourcePath).toContain("Learning to Make AV Content - Campaign");
  });

  it("holds the invariant against real data: no Katrina item can block", async () => {
    const { boards } = await listBoards();
    const blocking = boards.flatMap((b) => b.gate.filter((g) => g.o === "K" && g.blocking !== false));
    expect(blocking).toEqual([]);
  });

  it("refuses to escape the real root", () => {
    const root = vaultStatus().root!;
    expect(resolveInRoot(root, "../../../../../Windows/System32/config/board.json")).toBeNull();
    expect(resolveInRoot(root, "Campaign, Channels, & Content/0 Potential Campaigns/X/board.json")).toBeTruthy();
  });
});
