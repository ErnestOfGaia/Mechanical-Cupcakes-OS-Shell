import { describe, expect, it } from "vitest";
import {
  blankBoard, blocks, decided, flagged, mergeBoard, normalise,
  nudge, openBlockers, openOptional, settle, toMarkdown,
} from "./board";
import { KINDS } from "./kinds";
import type { Board, Idea, Verdict } from "./types";

const idea = (E: Verdict, K: Verdict, id = "IDEA-01"): Idea => ({
  id, tag: "post", title: "t", story: "a story long enough to be real, honestly", asset: "", proves: "",
  cover: "", yt: false, placed: null,
  v: { E, K }, n: { E: "", K: "" },
});

describe("Ernest decides, Katrina advises", () => {
  it("settles on Ernest's verdict alone", () => {
    expect(settle(idea("in", null))).toBe("settled-in");
    expect(decided(idea("in", null))).toBe("in");
  });

  it("keeps Ernest's call when they differ, and only raises a flag", () => {
    expect(settle(idea("in", "cut"))).toBe("settled-in");
    expect(flagged(idea("in", "cut"))).toBe(true);
  });

  it("does not let Katrina decide on her own", () => {
    expect(decided(idea(null, "in"))).toBeNull();
    expect(settle(idea(null, "in"))).toBe("input");
  });

  it("raises no flag when they agree, or when only one has spoken", () => {
    expect(flagged(idea("in", "in"))).toBe(false);
    expect(flagged(idea("in", null))).toBe(false);
    expect(flagged(idea(null, "cut"))).toBe(false);
  });
});

describe("her availability can never block a board", () => {
  it("defaults Katrina-owned gate items to non-blocking", () => {
    const b = normalise({ gate: [{ t: "x", o: "K", d: false, n: "" }] });
    expect(blocks(b.gate[0])).toBe(false);
  });

  it("defaults everything else to blocking", () => {
    const b = normalise({ gate: [{ t: "x", o: "E", d: false, n: "" }, { t: "y", o: "both", d: false, n: "" }] });
    expect(blocks(b.gate[0])).toBe(true);
    expect(blocks(b.gate[1])).toBe(true);
  });

  it("respects an explicit override when Ernest says one is worth waiting for", () => {
    const b = normalise({ gate: [{ t: "x", o: "K", d: false, blocking: true, n: "" }] });
    expect(blocks(b.gate[0])).toBe(true);
  });

  it("reaches zero blockers with every Katrina item still open", () => {
    // A board Ernest has taken all the way alone: bench called, rhythm ordered,
    // every blocking item ticked, and Katrina has never opened it.
    const b = normalise({
      ideas: Array.from({ length: 6 }, (_, i) => idea("in", null, `IDEA-0${i}`)),
      arc: [{ slot: "1", ref: "", title: "one", story: "", track: "", songs: "", promo: "", note: "" }],
      gate: [
        { t: "his", o: "E", d: true, n: "" },
        { t: "shared", o: "both", d: true, n: "" },
        { t: "hers", o: "K", d: false, n: "" },
        { t: "hers too", o: "K", d: false, n: "" },
      ],
    });
    expect(openBlockers(b)).toBe(0);
    expect(openOptional(b)).toBe(2);
    const [head, tail] = nudge(b);
    expect(head).toContain("clear");
    expect(tail).toContain("none blocking");
  });
});

describe("the nudge tracks maturity, not completeness", () => {
  const withIdeas = (n: number, v: Verdict = null): Board =>
    normalise({ ideas: Array.from({ length: n }, (_, i) => idea(v, null, `IDEA-0${i}`)) });

  it("calls a tiny board a spark rather than nagging it", () => {
    expect(nudge(withIdeas(2))[0]).toBe("Still a spark.");
  });

  it("asks for decisions once there is something to choose between", () => {
    expect(nudge(withIdeas(6))[0]).toBe("Nothing decided yet.");
  });

  it("never asks Ernest to wait for Katrina", () => {
    const [h, t] = nudge(withIdeas(6, "in"));
    expect(`${h} ${t}`).not.toMatch(/wait|talk|disagree/i);
  });

  it("reports an archived board as gone, not as unfinished", () => {
    const b = normalise({ stage: "archived", ideas: [idea(null, null)] });
    expect(nudge(b)[0]).toBe("Archived.");
  });
});

describe("one app, two kinds", () => {
  it("relabels the middle section instead of duplicating it", () => {
    expect(KINDS.campaign.arcNoun).toBe("drop");
    expect(KINDS.channel.arcNoun).toBe("slot");
    expect(KINDS.campaign.fields.track).not.toBe(KINDS.channel.fields.track);
  });

  it("gives each kind its own starter gate but the same universal rules", () => {
    const c = KINDS.campaign.starterGate().map((g) => g.t);
    const h = KINDS.channel.starterGate().map((g) => g.t);
    expect(c).not.toEqual(h);
    const universal = "No hype vocabulary, small numbers stay small, no invented costs";
    expect(c).toContain(universal);
    expect(h).toContain(universal);
  });

  it("does not let one kind's starter gate mutate the other's", () => {
    const a = KINDS.campaign.starterGate();
    a[a.length - 1].t = "MUTATED";
    expect(KINDS.campaign.starterGate().some((g) => g.t === "MUTATED")).toBe(false);
  });

  it("files each kind in its own vault directory", () => {
    expect(KINDS.campaign.vaultDir).toContain("Potential Campaigns");
    expect(KINDS.channel.vaultDir).not.toContain("Potential Campaigns");
  });

  it("exports a channel board with channel vocabulary", () => {
    const b = blankBoard("LinkedIn", "channel");
    b.arc.push({ slot: "s", ref: "", title: "Monday", story: "x", track: "y", songs: "z", promo: "p", note: "n" });
    const md = toMarkdown(b, "2026-07-31");
    expect(md).toContain("kind: channel");
    expect(md).toContain("## The rhythm");
    expect(md).toContain("Slot 1");
    expect(md).toContain(KINDS.channel.fields.track);
  });
});

describe("export", () => {
  it("omits sections a spark does not have yet", () => {
    const md = toMarkdown(blankBoard("Spark", "campaign"), "2026-07-31");
    expect(md).not.toContain("## The arc");
    expect(md).not.toContain("## The bench");
    expect(md).toContain("## Commit gate");
    expect(md).not.toContain("undefined");
  });

  it("states who decides", () => {
    const md = toMarkdown(blankBoard("x", "campaign"), "2026-07-31");
    expect(md).toContain("**Decisions are Ernest's**");
  });

  it("marks optional gate items so a reader knows what held nothing up", () => {
    const b = normalise({ name: "x", gate: [{ t: "hers", o: "K", d: false, n: "" }] });
    expect(toMarkdown(b, "2026-07-31")).toContain("(optional — does not block)");
  });
});

describe("merge keeps your own column", () => {
  it("takes only the other person's verdict", () => {
    const mine = normalise({ id: "b1", ideas: [idea("in", null)] });
    const theirs = normalise({ id: "b1", ideas: [idea("cut", "cut")] });
    mergeBoard(mine, theirs, "E", false);
    expect(mine.ideas[0].v.E).toBe("in");   // untouched
    expect(mine.ideas[0].v.K).toBe("cut");  // folded in
  });

  it("adds ideas you do not have", () => {
    const mine = normalise({ id: "b1", ideas: [idea("in", null, "IDEA-01")] });
    const theirs = normalise({ id: "b1", ideas: [idea(null, "in", "IDEA-02")] });
    mergeBoard(mine, theirs, "E", false);
    expect(mine.ideas).toHaveLength(2);
  });

  it("takes a cover seed they wrote, but never their yt flag or placement", () => {
    const mine = normalise({ id: "b1", ideas: [idea("in", null)] });
    const theirs = normalise({
      id: "b1",
      ideas: [{ ...idea(null, null), cover: "their cover seed", yt: true, placed: "seed" }],
    });
    mergeBoard(mine, theirs, "E", true);
    expect(mine.ideas[0].cover).toBe("their cover seed");
    // Editorial calls, not prose — a merge must not decide these on Ernest's behalf.
    expect(mine.ideas[0].yt).toBe(false);
    expect(mine.ideas[0].placed).toBeNull();
  });

  it("carries the strip across when taking their text", () => {
    const mine = normalise({ id: "b1" });
    const theirs = normalise({ id: "b1", strip: [{ k: "Cadence", v: "Weekly" }] });
    mergeBoard(mine, theirs, "E", true);
    expect(mine.strip).toEqual([{ k: "Cadence", v: "Weekly" }]);
  });
});

describe("normalise is safe on junk", () => {
  it("survives a board with nothing in it", () => {
    const b = normalise({});
    expect(b.kind).toBe("campaign");
    expect(b.ideas).toEqual([]);
    expect(b.gate).toEqual([]);
  });

  it("backfills half-written verdict objects rather than throwing", () => {
    const b = normalise({ ideas: [{ id: "x", tag: "t", title: "t", story: "s", asset: "", proves: "" } as unknown as Idea] });
    expect(b.ideas[0].v).toEqual({ E: null, K: null });
    expect(b.ideas[0].n).toEqual({ E: "", K: "" });
  });
});
