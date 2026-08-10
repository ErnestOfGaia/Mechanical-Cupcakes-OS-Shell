import { describe, expect, it } from "vitest";
import { cadenceDates, formatMonth, parseSlotDate, projectMonth, slotQualifier } from "./calendar";
import { normalise } from "./board";
import type { Board, Entry, Weekday } from "./types";

const drop = (slot: string, title = "t", ref = "IDEA-01"): Entry =>
  ({ slot, ref, title, story: "", track: "", songs: "", promo: "", note: "" });

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

  it("an authored drop date beats a projected cadence date", () => {
    const p = projectMonth([board({
      name: "Both",
      cadence: { days: ["Wed"], start: "2026-08-12" },
      arc: [drop("Drop 1 — Wed 12 Aug", "authored")],
    })], "2026-08");
    const aug12 = p.items.filter((i) => i.date === "2026-08-12" && i.kind === "drop");
    expect(aug12).toHaveLength(1);
    expect(aug12[0].source).toBe("arc-date");
    // Later Wednesdays are still projected from the cadence.
    expect(p.items.some((i) => i.date === "2026-08-19" && i.source === "cadence")).toBe(true);
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
    expect(p.undated.some((u) => /no typed cadence|no parseable date/.test(u.why))).toBe(true);
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
