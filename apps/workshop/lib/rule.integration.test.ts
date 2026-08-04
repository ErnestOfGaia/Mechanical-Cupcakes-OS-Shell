import { describe, expect, it } from "vitest";
import { formatPlacementReport, checkPlacement } from "./rule";
import { listBoards } from "./vault";

/**
 * The placement rule against the real, migrated boards.
 *
 * On 2026-08-03 this check reported the Last Mile board as 9 IN against 5 drops, with
 * three ideas whose only reason for not being placed sat in a note field — invisible to
 * the seams list, the gate, the meters and to Katrina. The session's response was to
 * write SEAM-13/14/15. This test is what proves that actually closed them.
 *
 * Run: WORKSHOP_VAULT_ROOT="…\EOG Backoffice\Marketing" npx vitest run lib/rule.integration
 */
const ROOT = process.env.WORKSHOP_VAULT_ROOT;
const maybe = ROOT ? describe : describe.skip;

maybe("the placement rule on the real vault", () => {
  it("accounts for every IN idea on the Last Mile board", async () => {
    const { boards } = await listBoards();
    const b = boards.find((x) => x.name === "Last Mile Value Propositions");
    expect(b, "Last Mile should be on disk").toBeTruthy();

    const r = checkPlacement(b!);
    // Evidence, printed — a green tick is never the only thing reported.
    console.log(formatPlacementReport(b!));

    expect(r.rows).toHaveLength(9);
    expect(r.violations, `unaccounted for: ${r.violations.map((v) => v.id).join(", ")}`).toEqual([]);
  });

  it("holds IDEA-06/07/08 by the one seam that names all three in shorthand", async () => {
    const { boards } = await listBoards();
    const b = boards.find((x) => x.name === "Last Mile Value Propositions")!;
    const held = checkPlacement(b).heldBySeam.map((r) => r.id);
    // The exact case the substring bug got wrong: one seam, three ideas.
    expect(held).toEqual(expect.arrayContaining(["IDEA-06", "IDEA-07", "IDEA-08"]));
  });

  it("shows the three note-blockers were promoted to real seams", async () => {
    const { boards } = await listBoards();
    const b = boards.find((x) => x.name === "Last Mile Value Propositions")!;
    const r = checkPlacement(b);
    const held = r.heldBySeam.map((x) => x.id);
    // IDEA-09, 11 and 12 were the three whose blockers lived only in notes.
    for (const id of ["IDEA-09", "IDEA-11", "IDEA-12"]) {
      expect(held, `${id} should now be held by a seam, not a note`).toContain(id);
    }
    expect(r.noteBlockers.map((x) => x.id)).toEqual([]);
  });
});
