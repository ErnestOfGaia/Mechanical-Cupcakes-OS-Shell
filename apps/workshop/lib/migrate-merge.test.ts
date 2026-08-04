import { describe, expect, it } from "vitest";
import { normalise } from "./board";
import { countsOf, mergeForMigration, pickText } from "./migrate-merge";
import type { Board, Idea, Verdict } from "./types";

const idea = (id: string, over: Partial<Idea> = {}): Idea => ({
  id, tag: "post", title: `title ${id}`, story: "s", asset: "", proves: "",
  cover: "", yt: false, placed: null, v: { E: null, K: null }, n: { E: "", K: "" },
  ...over,
});

const board = (ideas: Idea[], over: Partial<Board> = {}): Board =>
  normalise({ id: "b1", name: "B", channels: ["Blog"], ideas, ...over });

describe("pickText — which version of the same text survives", () => {
  it("takes the backup when it is the disk text plus more", () => {
    // The real case: Ernest typed "Possible YouTube Post here as well." into the
    // artifact after the skill's copy was written.
    const p = pickText("The six error types live here.", "The six error types live here. Possible YouTube Post here as well.");
    expect(p.take).toBe("backup");
    expect(p.diverged).toBe(false);
  });

  it("takes the disk when IT is the fuller one", () => {
    const p = pickText("a sentence, and then some more of it", "a sentence");
    expect(p.take).toBe("disk");
    expect(p.diverged).toBe(false);
  });

  it("flags a genuine rewrite instead of silently choosing", () => {
    // The real case: IDEA-13's title was rewritten, not extended.
    const p = pickText("Why it is called Last Mile — and what else it might have been", "What is Last Mile Development?");
    expect(p.diverged).toBe(true);
    expect(p.take).toBe("disk");
  });

  it("treats an empty side as nothing to lose", () => {
    expect(pickText("", "something").take).toBe("backup");
    expect(pickText("something", "").take).toBe("disk");
    expect(pickText("same", "same").diverged).toBe(false);
  });

  it("ignores surrounding whitespace when deciding", () => {
    expect(pickText("text\n\n", "  text").diverged).toBe(false);
  });
});

describe("mergeForMigration", () => {
  it("restores verdicts the disk copy lost, including Katrina's", () => {
    const disk = board([idea("IDEA-01"), idea("IDEA-02")]);
    const backup = board([
      idea("IDEA-01", { v: { E: "in" as Verdict, K: null } }),
      idea("IDEA-02", { v: { E: null, K: "in" as Verdict } }),
    ]);
    const { merged } = mergeForMigration(disk, backup);
    expect(merged.ideas[0].v.E).toBe("in");
    expect(merged.ideas[1].v.K).toBe("in");
  });

  it("never lets an undecided backup erase a verdict the disk already has", () => {
    const disk = board([idea("IDEA-01", { v: { E: "cut" as Verdict, K: null } })]);
    const backup = board([idea("IDEA-01")]);
    const { merged } = mergeForMigration(disk, backup);
    expect(merged.ideas[0].v.E).toBe("cut");
  });

  it("unions seams so neither side's work is dropped", () => {
    const disk = board([], { seams: [{ tag: "Blocking", cls: "", h: "SEAM-13 — only on disk", p: "x" }] });
    const backup = board([], { seams: [{ tag: "Open", cls: "", h: "SEAM-01 — only in backup", p: "y" }] });
    const { merged } = mergeForMigration(disk, backup);
    expect(merged.seams.map((s) => s.h).sort()).toEqual(["SEAM-01 — only in backup", "SEAM-13 — only on disk"]);
  });

  it("unions channels rather than dropping one", () => {
    const disk = board([], { channels: ["Blog", "LinkedIn"] });
    const backup = board([], { channels: ["Blog", "YouTube"] });
    const { merged } = mergeForMigration(disk, backup);
    expect(merged.channels.sort()).toEqual(["Blog", "LinkedIn", "YouTube"]);
  });

  it("keeps the disk's strip when it has one — the skill wrote it later", () => {
    const disk = board([], { strip: [{ k: "Cadence", v: "Weekly" }] });
    const backup = board([], { strip: [{ k: "Cadence", v: "Fortnightly" }, { k: "Anchor", v: "x" }] });
    const { merged } = mergeForMigration(disk, backup);
    expect(merged.strip).toEqual([{ k: "Cadence", v: "Weekly" }]);
  });

  it("keeps an idea that only exists on disk", () => {
    const { merged } = mergeForMigration(board([idea("IDEA-99")]), board([]));
    expect(merged.ideas.map((i) => i.id)).toContain("IDEA-99");
  });

  it("adds an idea that only exists in the backup", () => {
    const { merged } = mergeForMigration(board([]), board([idea("IDEA-42")]));
    expect(merged.ideas.map((i) => i.id)).toContain("IDEA-42");
  });

  it("reports every decision it makes — nothing is silent", () => {
    const disk = board([idea("IDEA-01", { title: "old" })]);
    const backup = board([idea("IDEA-01", { title: "old and then some", v: { E: "in" as Verdict, K: null } })]);
    const { diffs } = mergeForMigration(disk, backup);
    expect(diffs.length).toBeGreaterThanOrEqual(2);
    expect(diffs.every((d) => d.outcome.length > 0)).toBe(true);
  });

  it("counts what it produced", () => {
    const backup = board([
      idea("IDEA-01", { v: { E: "in" as Verdict, K: null } }),
      idea("IDEA-02", { v: { E: "cut" as Verdict, K: "in" as Verdict } }),
    ]);
    const { merged } = mergeForMigration(board([idea("IDEA-01"), idea("IDEA-02")]), backup);
    const c = countsOf(merged);
    expect(c).toMatchObject({ ideas: 2, in: 1, cut: 1, k: 1 });
  });
});
