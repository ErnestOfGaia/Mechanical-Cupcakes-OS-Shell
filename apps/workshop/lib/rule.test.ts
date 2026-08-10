import { describe, expect, it } from "vitest";
import { normalise, setVerdict } from "./board";
import { checkPlacement, formatPlacementReport, namedInText, placement, placementNudge } from "./rule";
import type { Board, Entry, Idea, Seam, Verdict } from "./types";

const idea = (id: string, E: Verdict = "in", over: Partial<Idea> = {}): Idea => ({
  id, tag: "post", title: `title ${id}`, story: "s", asset: "", proves: "",
  cover: "", yt: false, placed: null, placedIn: null, v: { E, K: null }, n: { E: "", K: "" }, ...over,
});

const drop = (ref: string): Entry =>
  ({ slot: "Drop 1", ref, title: "t", story: "", track: "", songs: "", promo: "", note: "" });

const seam = (h: string, p = ""): Seam => ({ tag: "Open", cls: "", h, p });

const board = (over: Partial<Board> = {}): Board => normalise({ id: "b1", name: "B", ...over });

describe("seam id shorthand — the bug that produced two false violations", () => {
  it('expands "IDEA-06/07/08" into three ids, not one', () => {
    const got = namedInText("SEAM-05 — the post count is not settled: IDEA-06/07/08 may merge");
    expect([...got].sort()).toEqual(["IDEA-06", "IDEA-07", "IDEA-08"]);
  });

  it("handles a run of two and a lone id in the same text", () => {
    const got = namedInText("IDEA-01 and also IDEA-06/07");
    expect([...got].sort()).toEqual(["IDEA-01", "IDEA-06", "IDEA-07"]);
  });

  it("matches ids exactly — IDEA-1 must never match IDEA-10", () => {
    // The reason membership is a Set lookup rather than a substring test.
    const got = namedInText("IDEA-10 is held");
    expect(got.has("IDEA-10")).toBe(true);
    expect(got.has("IDEA-1")).toBe(false);
  });

  it("finds nothing in text that names no ideas", () => {
    expect(namedInText("a seam about the score problem").size).toBe(0);
  });

  it("holds all three ideas of a run, rather than only the first", () => {
    const b = board({
      ideas: [idea("IDEA-06"), idea("IDEA-07"), idea("IDEA-08")],
      seams: [seam("SEAM-05 — the post count is not settled", "IDEA-06/07/08 may merge into one")],
    });
    const r = checkPlacement(b);
    expect(r.violations).toEqual([]);
    expect(r.heldBySeam.map((x) => x.id)).toEqual(["IDEA-06", "IDEA-07", "IDEA-08"]);
  });
});

describe("the rule sorts every IN idea into exactly one state", () => {
  it("reproduces the real 2026-08-03 shape: 3 placed, 3 held, 3 hidden in notes", () => {
    const b = board({
      ideas: [
        idea("IDEA-01"), idea("IDEA-04"), idea("IDEA-05"),
        idea("IDEA-06"), idea("IDEA-07"), idea("IDEA-08"),
        idea("IDEA-09", "in", { n: { E: "VERIFY FIRST — the CrUX claim is unconfirmed", K: "" } }),
        idea("IDEA-11", "in", { n: { E: "Penny Post is NOT SHIPPED yet", K: "" } }),
        idea("IDEA-12", "in", { n: { E: "needs its own conversation before it becomes a post", K: "" } }),
      ],
      arc: [drop("IDEA-01"), drop("IDEA-04"), drop("IDEA-05")],
      seams: [seam("SEAM-05 — the post count", "IDEA-06/07/08 may merge")],
    });
    const r = checkPlacement(b);
    expect(r.placed.map((x) => x.id)).toEqual(["IDEA-01", "IDEA-04", "IDEA-05"]);
    expect(r.heldBySeam.map((x) => x.id)).toEqual(["IDEA-06", "IDEA-07", "IDEA-08"]);
    expect(r.noteBlockers.map((x) => x.id)).toEqual(["IDEA-09", "IDEA-11", "IDEA-12"]);
    expect(r.violations).toEqual([]);
  });

  it("GOES RED when an IN idea lands nowhere at all", () => {
    const b = board({ ideas: [idea("IDEA-01"), idea("IDEA-02")], arc: [drop("IDEA-01")] });
    const r = checkPlacement(b);
    expect(r.ok).toBe(false);
    expect(r.violations.map((x) => x.id)).toEqual(["IDEA-02"]);
  });

  it("goes green once the seam that holds it is written", () => {
    const before = board({ ideas: [idea("IDEA-02")] });
    expect(checkPlacement(before).ok).toBe(false);
    const after = board({ ideas: [idea("IDEA-02")], seams: [seam("SEAM-01 — IDEA-02 waits on a citation")] });
    expect(checkPlacement(after).ok).toBe(true);
  });

  it("ignores ideas that are not IN — hold and cut are already answers", () => {
    const b = board({ ideas: [idea("IDEA-01", "hold"), idea("IDEA-02", "cut"), idea("IDEA-03", null)] });
    expect(checkPlacement(b).rows).toEqual([]);
  });

  it("counts a seeded idea as placed", () => {
    const b = board({ ideas: [idea("IDEA-01", "in", { placed: "seed" })] });
    const r = checkPlacement(b);
    expect(r.seeded.map((x) => x.id)).toEqual(["IDEA-01"]);
    expect(r.ok).toBe(true);
  });

  it("counts an idea living INSIDE another drop as placed — the §9 branch", () => {
    // The real 2026-08-09 case: IDEA-06 became the recurring frame across all four
    // drops. Not a drop of its own, not back in the bank — placed, not dropped.
    // Without this state the banner cries wolf forever and gets ignored.
    const b = board({ ideas: [idea("IDEA-06", "in", { placedIn: { ref: "IDEA-01", role: "frame" } })] });
    const r = checkPlacement(b);
    expect(r.placedInside.map((x) => x.id)).toEqual(["IDEA-06"]);
    expect(r.violations).toEqual([]);
    expect(r.ok).toBe(true);
    expect(placement(b.ideas[0], b)).toBe("placedIn");
  });

  it("shows WHERE a placed-in idea lives in the report", () => {
    const b = board({ ideas: [idea("IDEA-07", "in", { placedIn: { ref: "IDEA-04", role: "paragraph" } })] });
    expect(formatPlacementReport(b)).toContain("inside IDEA-04 (paragraph)");
  });

  it("a drop still wins over placedIn — the arc is the truth", () => {
    const b = board({
      ideas: [idea("IDEA-01", "in", { placedIn: { ref: "IDEA-02", role: "frame" } })],
      arc: [drop("IDEA-01")],
    });
    expect(placement(b.ideas[0], b)).toBe("drop");
  });

  it("derives a drop from the arc rather than trusting a stored flag", () => {
    const b = board({ ideas: [idea("IDEA-01", "in", { placed: "seed" })], arc: [drop("IDEA-01")] });
    // Even though it is marked seed, the arc is the truth: it has a drop.
    expect(placement(b.ideas[0], b)).toBe("drop");
  });
});

describe("the nudge says what to do, not just that something is wrong", () => {
  it("names the unplaced ideas and the three ways out", () => {
    const b = board({ ideas: [idea("IDEA-09"), idea("IDEA-11")] });
    const msg = placementNudge(b)!;
    expect(msg).toContain("IDEA-09, IDEA-11");
    expect(msg).toMatch(/drop/i);
    expect(msg).toMatch(/bank|seed/i);
    expect(msg).toMatch(/seam/i);
  });

  it("says nothing when there is nothing to say", () => {
    expect(placementNudge(board({ ideas: [idea("IDEA-01")], arc: [drop("IDEA-01")] }))).toBeNull();
  });
});

describe("the report prints the note it is talking about", () => {
  it("shows the hidden blocker's text, once", () => {
    // The original checker read a property its rows never had, so this line always
    // printed empty — and then printed the same ids again on the next loop.
    const b = board({
      // Title deliberately does not contain the id, so counting occurrences of the id
      // counts report lines rather than incidental text.
      ideas: [idea("IDEA-09", "in", { title: "The CrUX claim", n: { E: "VERIFY FIRST — unconfirmed", K: "" } })],
    });
    const out = formatPlacementReport(b);
    expect(out).toContain("IDEA-09 — VERIFY FIRST — unconfirmed");
    expect(out.split("IDEA-09").length - 1).toBe(2); // once in the table, once in the block
  });
});

describe("setVerdict — auto-create the seed, never the drop", () => {
  it("sends an unplaced idea to the seed bank when it goes IN", () => {
    const b = board({ ideas: [idea("IDEA-01", null)] });
    const w = setVerdict(b, "IDEA-01", "E", "in");
    expect(b.ideas[0].placed).toBe("seed");
    expect(w.join(" ")).toMatch(/seed bank/i);
  });

  it("does NOT seed an idea that already has a drop", () => {
    const b = board({ ideas: [idea("IDEA-01", null)], arc: [drop("IDEA-01")] });
    setVerdict(b, "IDEA-01", "E", "in");
    expect(b.ideas[0].placed).toBeNull();
  });

  it("NEVER creates a drop — the arc is untouched", () => {
    const b = board({ ideas: [idea("IDEA-01", null)] });
    setVerdict(b, "IDEA-01", "E", "in");
    expect(b.arc).toEqual([]);
  });

  it("NEVER deletes a drop when the verdict is taken back, and says so", () => {
    const b = board({ ideas: [idea("IDEA-01", "in")], arc: [drop("IDEA-01")] });
    const w = setVerdict(b, "IDEA-01", "E", "in"); // toggles off
    expect(b.ideas[0].v.E).toBeNull();
    expect(b.arc).toHaveLength(1);
    expect(w.join(" ")).toMatch(/still has a drop/i);
  });

  it("clears an auto-seed when the idea stops being IN — no authored content is lost", () => {
    const b = board({ ideas: [idea("IDEA-01", null)] });
    setVerdict(b, "IDEA-01", "E", "in");
    expect(b.ideas[0].placed).toBe("seed");
    setVerdict(b, "IDEA-01", "E", "hold");
    expect(b.ideas[0].placed).toBeNull();
  });

  it("does NOT seed an idea that already lives inside another drop", () => {
    const b = board({ ideas: [idea("IDEA-06", null, { placedIn: { ref: "IDEA-01", role: "frame" } })] });
    setVerdict(b, "IDEA-06", "E", "in");
    expect(b.ideas[0].placed).toBeNull();
  });

  it("never auto-deletes a placedIn when the verdict is taken back — it warns instead", () => {
    const b = board({ ideas: [idea("IDEA-06", "in", { placedIn: { ref: "IDEA-01", role: "frame" } })] });
    const w = setVerdict(b, "IDEA-06", "E", "cut");
    expect(b.ideas[0].placedIn).toEqual({ ref: "IDEA-01", role: "frame" });
    expect(w.join(" ")).toMatch(/still marked as living inside/i);
  });

  it("toggles off when the same verdict is clicked twice", () => {
    const b = board({ ideas: [idea("IDEA-01", null)] });
    setVerdict(b, "IDEA-01", "E", "cut");
    expect(b.ideas[0].v.E).toBe("cut");
    setVerdict(b, "IDEA-01", "E", "cut");
    expect(b.ideas[0].v.E).toBeNull();
  });

  it("lets Katrina record a verdict without it moving placement", () => {
    const b = board({ ideas: [idea("IDEA-01", null)] });
    setVerdict(b, "IDEA-01", "K", "in");
    expect(b.ideas[0].v.K).toBe("in");
    expect(b.ideas[0].placed).toBeNull(); // hers is input; placement is Ernest's
  });

  it("reports an unknown id rather than failing silently", () => {
    expect(setVerdict(board({}), "IDEA-99", "E", "in")[0]).toMatch(/no idea/i);
  });
});
