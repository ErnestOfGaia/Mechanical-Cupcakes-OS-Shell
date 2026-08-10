import { describe, expect, it } from "vitest";
import { checkPlacement, formatPlacementReport, namedInText } from "./rule";
import { listBoards } from "./vault";

/**
 * The placement rule against the real boards.
 *
 * ⚠️ This suite asserts STRUCTURE, not Ernest's decisions. An earlier version froze
 * one day's editorial state as expectations ("IDEA-08 is held by a seam", "0
 * violations") — and went red three days later when Ernest resolved seams and rebuilt
 * the arc, which is the rule doing its job, not a defect. A live-data test that fails
 * whenever the human decides something has its coupling backwards.
 *
 * What IS asserted: the checker runs on every real board, classifies every IN idea
 * into exactly one state, and its held-by-seam classification agrees with its own
 * id-expansion of the seam text. The current counts are printed as evidence for the
 * session log, not asserted.
 *
 * Run: WORKSHOP_VAULT_ROOT="…\EOG Backoffice\Marketing" npx vitest run lib/rule.integration
 */
const ROOT = process.env.WORKSHOP_VAULT_ROOT;
const maybe = ROOT ? describe : describe.skip;

maybe("the placement rule on the real vault", () => {
  it("classifies every IN idea on every board into exactly one state", async () => {
    const { boards } = await listBoards();
    expect(boards.length).toBeGreaterThan(0);

    for (const b of boards) {
      const r = checkPlacement(b);
      const inCount = b.ideas.filter((i) => i.v.E === "in").length;

      // Evidence, printed — a green tick is never the only thing reported.
      console.log(`\n=== ${b.name} ===`);
      console.log(formatPlacementReport(b));

      expect(r.rows).toHaveLength(inCount);
      // The five states partition the rows — nothing double-counted, nothing dropped.
      const partitioned = r.placed.length + r.seeded.length + r.heldBySeam.length + r.noteBlockers.length + r.violations.length;
      expect(partitioned).toBe(r.rows.length);
    }
  });

  it("agrees with its own seam-text expansion about who is held", async () => {
    const { boards } = await listBoards();
    for (const b of boards) {
      const named = namedInText(b.seams.map((s) => `${s.h} ${s.p}`).join(" "));
      for (const row of checkPlacement(b).heldBySeam) {
        expect(named.has(row.id), `${b.name}: ${row.id} is classified held but no seam names it`).toBe(true);
      }
    }
  });

  it("reports what is currently unaccounted for, as evidence not assertion", async () => {
    const { boards } = await listBoards();
    const open = boards.flatMap((b) =>
      checkPlacement(b).violations.map((v) => `${b.name}: ${v.id} — ${v.title.slice(0, 50)}`));
    console.log(open.length
      ? `IN ideas landing nowhere right now (Ernest's queue, not a code defect):\n  ${open.join("\n  ")}`
      : "Every IN idea on every board is accounted for.");
    expect(Array.isArray(open)).toBe(true);
  });
});
