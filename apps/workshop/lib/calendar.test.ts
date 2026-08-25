import { describe, expect, it } from "vitest";
import { cadenceDates, entryDate, formatMonth, parseSlotDate, projectMonth, slotQualifier, withSlotDate } from "./calendar";
import { normalise } from "./board";
import type { Board, Entry, Weekday } from "./types";

const drop = (slot: string, title = "t", ref = "IDEA-01"): Entry =>
  ({ slot, date: "", ref, title, story: "", track: "", songs: "", promo: "", note: "" });

const board = (over: Partial<Board>): Board =>
  normalise({ id: over.name?.toLowerCase().replace(/\W+/g, "-") ?? "b", channels: ["Blog", "LinkedIn"], ...over });

describe("parseSlotDate — real slot strings, never guessed", () => {
  it("parses the real Last Mile slots", () => {
    // Verbatim from the live board, 2026-08-09.
    expect(parseSlotDate("Drop 1 — Wed 12 Aug", 2026)).toBe("2026-08-12");
    expect(parseSlotDate("Drop 3 — Tue 18 Aug", 2026)).toBe("2026-08-18");
    expect(parseSlotDate("Drop 5 — Thu 20 Aug  ⏳ CONDITIONAL", 2026)).toBe("2026-08-20");
  });

  it("parses the real Penny Post slot with its time", () => {
    expect(parseSlotDate("Drop 1 — Tue 11 Aug, 9:00 AM PT", 2026)).toBe("2026-08-11");
  });

  it("returns null for undated slots rather than inventing a date", () => {
    expect(parseSlotDate("Drop 1", 2026)).toBeNull();
    expect(parseSlotDate("Drop 6", 2026)).toBeNull();
    expect(parseSlotDate("", 2026)).toBeNull();
  });

  it("keeps the conditional qualifier verbatim", () => {
    expect(slotQualifier("Drop 5 — Thu 20 Aug  ⏳ CONDITIONAL")).toBe("⏳ CONDITIONAL");
    expect(slotQualifier("Drop 1 — Wed 12 Aug")).toBeUndefined();
  });
});

describe("withSlotDate — editing a date that lives inside free text", () => {
  it("replaces the date in a real slot and leaves the label and time alone", () => {
    expect(withSlotDate("Drop 1 — Tue 11 Aug, 9:00 AM PT", "2026-08-18"))
      .toBe("Drop 1 — Tue 18 Aug, 9:00 AM PT");
  });

  it("recomputes the weekday rather than carrying the old one", () => {
    // Moving Tue 11 → 12 Aug must not leave a slot claiming "Tue 12 Aug", or the label
    // and the calendar it feeds would disagree.
    expect(withSlotDate("Drop 1 — Tue 11 Aug", "2026-08-12")).toBe("Drop 1 — Wed 12 Aug");
  });

  it("appends a date to an undated slot", () => {
    expect(withSlotDate("Drop 1", "2026-08-11")).toBe("Drop 1 — Tue 11 Aug");
    expect(withSlotDate("Drop 6", "2026-09-02")).toBe("Drop 6 — Wed 2 Sep");
  });

  it("keeps a ⏳ qualifier when the date changes", () => {
    const out = withSlotDate("Drop 5 — Thu 20 Aug  ⏳ CONDITIONAL", "2026-08-27");
    expect(out).toContain("Thu 27 Aug");
    expect(out).toContain("⏳ CONDITIONAL");
  });

  it("round-trips: what it writes, parseSlotDate reads back", () => {
    for (const iso of ["2026-08-11", "2026-08-12", "2026-09-02", "2026-12-31"]) {
      const slot = withSlotDate("Drop 1", iso);
      expect(parseSlotDate(slot, Number(iso.slice(0, 4))), `round-trip failed for ${iso}`).toBe(iso);
    }
  });

  it("clearing the date leaves the label rather than an orphan dash", () => {
    const out = withSlotDate("Drop 1 — Tue 11 Aug", "");
    expect(out).toBe("Drop 1");
    expect(parseSlotDate(out, 2026)).toBeNull();
  });

  it("is a no-op on an undated slot asked to clear", () => {
    expect(withSlotDate("Drop 1", "")).toBe("Drop 1");
  });
});

describe("the typed drop date — what a date is, since 2026-08-24", () => {
  const dated = (date: string, title = "t"): Entry =>
    ({ slot: "Drop 1", date, ref: "IDEA-01", title, story: "", track: "", songs: "", promo: "", note: "" });

  it("KEEPS THE YEAR — the defect that made this a field", () => {
    // "Drop 6 — Thu 7 Jan" in a board opened during 2026 used to resolve to Jan 2026:
    // a campaign crossing New Year quietly moved twelve months into the past.
    const p = projectMonth([board({ name: "Crosses New Year", arc: [dated("2027-01-07")] })], "2027-01");
    expect(p.items[0].date).toBe("2027-01-07");
    // And the old free-text reading of the same drop, for contrast.
    expect(parseSlotDate("Drop 6 — Thu 7 Jan", 2026)).toBe("2026-01-07");
  });

  it("the stored date wins over anything still written in the label", () => {
    const d = { ...dated("2026-08-18"), slot: "Drop 1 — Tue 11 Aug" };
    expect(entryDate(d, 2026)).toBe("2026-08-18");
  });

  it("refuses a day that is not on the calendar rather than rolling it forward", () => {
    // Date.UTC(2026, 1, 31) answers 3 March. A drop landing on a day nobody chose is
    // worse than a drop with no day at all.
    expect(parseSlotDate("Drop 1 — 31 Feb", 2026)).toBeNull();
    expect(parseSlotDate("Drop 1 — 31 Apr", 2026)).toBeNull();
    expect(parseSlotDate("Drop 1 — 29 Feb", 2028)).toBe("2028-02-29"); // a real leap day still parses
  });

  it("migrates an old board once: the date lifts out of the label and leaves it", () => {
    const b = board({ name: "Old", arc: [drop("Drop 1 — Tue 11 Aug, 9:00 AM PT")] });
    expect(b.arc[0].date).toBe("2026-08-11");
    expect(b.arc[0].slot).toBe("Drop 1 — 9:00 AM PT");
    expect(b.arc[0].slot, "the label must not keep a date that can disagree with the field").not.toMatch(/Aug/);
  });

  it("takes the migration's year from the board's own cadence, not the wall clock", () => {
    const b = board({ name: "Old", cadence: { days: ["Thu"], start: "2027-01-07" }, arc: [drop("Drop 6 — Thu 7 Jan")] });
    expect(b.arc[0].date).toBe("2027-01-07");
  });

  it("an undated drop stays undated through normalise — nothing invents one", () => {
    const b = board({ name: "Fresh", cadence: { days: ["Wed"], start: "2026-08-12" }, arc: [drop("Drop 1")] });
    expect(b.arc[0].date).toBe("");
  });

  it("drops junk in the date field rather than trusting it", () => {
    const b = board({ name: "Junk", arc: [{ ...dated("2026-02-31"), slot: "Drop 1" }] });
    expect(b.arc[0].date).toBe("");
  });
});

describe("cadenceDates — the arithmetic §5.8 names", () => {
  const from = new Date(Date.UTC(2026, 7, 1));
  const to = new Date(Date.UTC(2026, 8, 1));

  it("projects weekly Wednesdays from a start date", () => {
    expect(cadenceDates({ days: ["Wed"], start: "2026-08-12" }, from, to))
      .toEqual(["2026-08-12", "2026-08-19", "2026-08-26"]);
  });

  it("projects a bi-weekly cadence — the Unfinished Loop shape", () => {
    expect(cadenceDates({ days: ["Wed"], start: "2026-08-12", everyWeeks: 2 }, from, to))
      .toEqual(["2026-08-12", "2026-08-26"]);
  });

  it("projects nothing before the start date and nothing without one", () => {
    expect(cadenceDates({ days: ["Wed"], start: "2026-08-19" }, from, to)).toEqual(["2026-08-19", "2026-08-26"]);
    expect(cadenceDates({ days: ["Wed"], start: "" }, from, to)).toEqual([]);
  });

  it("keeps a fortnightly week INTACT — weeks run Mon-Sun, not from the epoch's Thursday", () => {
    // Bucketing by `time / 7 days` counts weeks from 1 Jan 1970, a Thursday, so Thursday
    // opened a new bucket: Tue/Wed/Thu every 2 weeks from Tue 4 Aug came back as
    // Tue 4, Wed 5, Thu 13 — the first week's Thursday thrown nine days forward.
    expect(cadenceDates({ days: ["Tue", "Wed", "Thu"] as Weekday[], start: "2026-08-04", everyWeeks: 2 }, from, to))
      .toEqual(["2026-08-04", "2026-08-05", "2026-08-06", "2026-08-18", "2026-08-19", "2026-08-20"]);
  });

  it("handles multi-day cadences — the blog's own Tue/Wed/Thu shape", () => {
    const got = cadenceDates({ days: ["Tue", "Wed", "Thu"] as Weekday[], start: "2026-08-11" }, from, to);
    expect(got.slice(0, 3)).toEqual(["2026-08-11", "2026-08-12", "2026-08-13"]);
    expect(got).toHaveLength(9); // three weeks × three days inside August from the 11th
  });
});

describe("projectMonth — committed campaigns × cadence × slot rules", () => {
  it("places dated drops and generates their LinkedIn promos", () => {
    const p = projectMonth([board({ name: "Last Mile", arc: [drop("Drop 1 — Wed 12 Aug")] })], "2026-08");
    expect(p.items).toHaveLength(2);
    expect(p.items[0]).toMatchObject({ date: "2026-08-12", channel: "Blog", kind: "drop" });
    expect(p.items[1]).toMatchObject({ date: "2026-08-12", channel: "LinkedIn", kind: "promo" });
  });

  it("does not invent a promo for a campaign that never declared LinkedIn", () => {
    const p = projectMonth([board({ name: "X", channels: ["Blog"], arc: [drop("Drop 1 — Wed 12 Aug")] })], "2026-08");
    expect(p.items.every((i) => i.channel === "Blog")).toBe(true);
  });

  it("a stated cadence places NOTHING — only the dated drop lands", () => {
    const p = projectMonth([board({
      name: "Both",
      cadence: { days: ["Wed"], start: "2026-08-12" },
      arc: [drop("Drop 1 — Wed 12 Aug", "authored")],
    })], "2026-08");
    const drops = p.items.filter((i) => i.kind === "drop");
    expect(drops).toHaveLength(1);
    expect(drops[0]).toMatchObject({ date: "2026-08-12", source: "arc-date" });
    // The rest of August's Wednesdays stay EMPTY. Before 2026-08-24 the cadence filled
    // them in, and a rate the board merely stated read on screen as a schedule.
    expect(p.items.some((i) => i.date === "2026-08-19")).toBe(false);
    expect(p.items.some((i) => i.date === "2026-08-26")).toBe(false);
    expect(p.items.every((i) => i.source !== "cadence")).toBe(true);
  });

  it("the HomegrownAI shape: a Tue/Wed/Thu cadence and no dated drops paints no month", () => {
    // The September screenshot — a stated cadence generating a drop and a promo on
    // every Tue/Wed/Thu, colliding with a real campaign six times in the first week.
    const p = projectMonth([
      board({ name: "HomegrownAI (OCMS Dashboard)", cadence: { days: ["Tue", "Wed", "Thu"], start: "2026-09-01" }, arc: [drop("Drop 1")] }),
      board({ name: "Analytics", cadence: { days: ["Tue", "Wed", "Thu"], start: "2026-09-01" }, arc: [drop("Drop 1")] }),
    ], "2026-09");
    expect(p.items).toEqual([]);
    expect(p.collisions).toEqual([]);
    // Both are still ACCOUNTED FOR — listed as undated, which is the honest answer.
    expect(p.undated).toHaveLength(2);
  });

  it("finds the §5.8 collision: two campaigns on one channel on one day", () => {
    const p = projectMonth([
      board({ name: "Last Mile", arc: [drop("Drop 1 — Wed 12 Aug")] }),
      board({ name: "Other Thing", arc: [drop("Drop 1 — Wed 12 Aug")] }),
    ], "2026-08");
    expect(p.collisions.length).toBeGreaterThan(0);
    const linkedIn = p.collisions.find((c) => c.channel === "LinkedIn" && c.date === "2026-08-12");
    expect(linkedIn, "two 10:30 promos on one LinkedIn day is the collision the doc names").toBeTruthy();
    expect(linkedIn!.items).toHaveLength(2);
  });

  it("lists undated work aside rather than guessing — silence would read as free", () => {
    const p = projectMonth([board({ name: "Unfinished Loop", arc: [drop("Drop 1"), drop("Drop 2")] })], "2026-08");
    expect(p.items.filter((i) => i.kind === "drop")).toHaveLength(0);
    expect(p.undated.length).toBeGreaterThan(0);
    expect(p.undated.every((u) => /no date assigned yet/.test(u.why))).toBe(true);
  });

  it("skips archived boards — they have left the workshop", () => {
    const p = projectMonth([board({ name: "Done", stage: "archived", arc: [drop("Drop 1 — Wed 12 Aug")] })], "2026-08");
    expect(p.items).toEqual([]);
  });

  it("carries the conditional qualifier onto the calendar without re-judging it", () => {
    const p = projectMonth([board({ name: "LM", arc: [drop("Drop 5 — Thu 20 Aug  ⏳ CONDITIONAL")] })], "2026-08");
    expect(p.items[0].qualifier).toBe("⏳ CONDITIONAL");
  });

  it("formats a readable month, collisions and unplaced included", () => {
    const p = projectMonth([
      board({ name: "A", arc: [drop("Drop 1 — Wed 12 Aug")] }),
      board({ name: "B", arc: [drop("Drop 1 — Wed 12 Aug"), drop("Drop 2")] }),
    ], "2026-08");
    const out = formatMonth(p);
    expect(out).toContain("MONTH PROJECTION — 2026-08");
    expect(out).toContain("CHANNEL COLLISION");
    expect(out).toContain("NOT PLACED");
    expect(out).toContain("not the reality view");
  });
});

/* ------------------------------------------------------------ reality layer (2026-08-09) */

import { ptDay, ptTime, postSummary, scheduledItems } from "./calendar";
import type { Reality, ScheduledPost } from "./calendar";

const post = (o: Partial<ScheduledPost>): ScheduledPost => ({
  publishDate: "2026-08-11T17:30:00.000Z", provider: "linkedin", state: "QUEUE",
  id: "id1", content: "hello", ...o,
});

describe("PT conversion — Postiz stores UTC, the department reasons in Pacific", () => {
  it("buckets an evening-UTC post onto the PREVIOUS Pacific day", () => {
    // 02:00Z on the 12th is 7 PM PT on the 11th. Bucketing by UTC date would put it
    // on the wrong day and miss the collision this layer exists to catch.
    expect(ptDay("2026-08-12T02:00:00.000Z")).toBe("2026-08-11");
  });

  it("converts the two real Tuesday slots", () => {
    expect(ptDay("2026-08-11T17:30:00.000Z")).toBe("2026-08-11");
    expect(ptTime("2026-08-11T17:30:00.000Z")).toBe("10:30 AM PT");
    expect(ptTime("2026-08-11T21:30:00.000Z")).toBe("2:30 PM PT");
    expect(ptTime("2026-08-11T23:30:00.000Z")).toBe("4:30 PM PT");
  });

  it("uses the IANA zone, so it survives the PDT/PST boundary", () => {
    expect(ptTime("2026-01-15T18:30:00.000Z")).toBe("10:30 AM PT"); // PST, -8
    expect(ptTime("2026-08-15T17:30:00.000Z")).toBe("10:30 AM PT"); // PDT, -7
  });

  it("returns empty rather than throwing on junk", () => {
    expect(ptDay("not-a-date")).toBe("");
    expect(ptTime("")).toBe("");
  });
});

describe("scheduledItems", () => {
  it("maps providers to the channel names the boards use", () => {
    const items = scheduledItems([post({ provider: "x", id: "a" })], "2026-08");
    expect(items[0].channel).toBe("X");
    expect(items[0].source).toBe("postiz");
    expect(items[0].postId).toBe("a");
  });

  it("drops DRAFT posts — a draft is not scheduled and must not imply a busy slot", () => {
    expect(scheduledItems([post({ state: "DRAFT" })], "2026-08")).toHaveLength(0);
  });

  it("keeps only the month asked for", () => {
    expect(scheduledItems([post({ publishDate: "2026-09-11T17:30:00.000Z" })], "2026-08")).toHaveLength(0);
  });

  it("summarises to the first non-empty line", () => {
    expect(postSummary("\n\nFirst line here\nsecond")).toBe("First line here");
  });
});

describe("the collision that shipped wrong on 2026-08-09", () => {
  // Reproduction. The board projects a LinkedIn promo at 10:30 on Tue 11 Aug. Postiz
  // already holds that slot with the MCOS promo, which lives in NO board arc — so the
  // projection alone could never see it, and reported the slot free.
  const boards = [board({ name: "1840s Penny Post Dispatch", arc: [drop("Drop 1 — Tue 11 Aug, 9:00 AM PT", "The billing system")] })];
  const mcos = post({ id: "cmsmdj4yw01wton0ytfkzizfw", content: "My own website was telling visitors two things that weren't true" });

  it("projection alone reports NO collision — the original defect", () => {
    const p = projectMonth(boards, "2026-08");
    expect(p.collisions).toHaveLength(0);
    expect(p.reality.ok).toBe(false);
  });

  it("with the reality layer it CATCHES it", () => {
    const p = projectMonth(boards, "2026-08", { ok: true, posts: [mcos] });
    const linkedin = p.collisions.filter((c) => c.channel === "LinkedIn" && c.date === "2026-08-11");
    expect(linkedin).toHaveLength(1);
    expect(linkedin[0].items.some((i) => i.source === "postiz")).toBe(true);
    expect(linkedin[0].items.some((i) => i.source === "arc-date")).toBe(true);
  });

  it("names the pull command for the real post", () => {
    const out = formatMonth(projectMonth(boards, "2026-08", { ok: true, posts: [mcos] }));
    expect(out).toContain("postiz posts:delete cmsmdj4yw01wton0ytfkzizfw");
    expect(out).toContain("projected vs ACTUALLY SCHEDULED");
  });
});

describe("a failed reality read is loud, never silent", () => {
  const dead: Reality = { ok: false, posts: [], error: "postiz CLI not found on PATH" };

  it("says PROJECTION ONLY and warns the collision list is incomplete", () => {
    const out = formatMonth(projectMonth([board({ name: "b" })], "2026-08", dead));
    expect(out).toContain("REALITY LAYER UNAVAILABLE");
    expect(out).toContain("postiz CLI not found on PATH");
    expect(out).toContain("Do not read a free slot as free");
  });

  it("does NOT show the reassuring merged header when the read failed", () => {
    const out = formatMonth(projectMonth([board({ name: "b" })], "2026-08", dead));
    expect(out).not.toContain("merged with");
  });

  it("shows the merged header when it worked", () => {
    const out = formatMonth(projectMonth([board({ name: "b" })], "2026-08", { ok: true, posts: [post({})] }));
    expect(out).toContain("actually in Postiz");
    expect(out).not.toContain("REALITY LAYER UNAVAILABLE");
  });
});
