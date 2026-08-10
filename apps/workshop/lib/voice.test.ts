import { describe, expect, it } from "vitest";
import { pronounCheck, voiceWarning } from "./voice";
import { tokenError, prefixError } from "./token";
import { cadenceLine, normalise } from "./board";

describe("the voice gate — fail-capable in BOTH directions", () => {
  it("fires on real misgendering", () => {
    const hits = pronounCheck("Ernest said he would review the plan.\nIt was his idea.");
    expect(hits.map((h) => h.match.toLowerCase())).toEqual(["he", "his"]);
    expect(hits[0].line).toBe(1);
    expect(hits[1].line).toBe(2);
  });

  it("fires on sentence-start capitals and 'himself'", () => {
    expect(pronounCheck("He built it himself.")).toHaveLength(2);
  });

  it("does NOT fire on the rule that bans the thing it flags", () => {
    // The real campaign gate row reads: "absence of he/him in source text is not
    // sufficient — state the rule explicitly." A gate that flags its own rule text
    // teaches Ernest to ignore it.
    expect(pronounCheck("absence of he/him in source text is not sufficient — state the rule explicitly")).toEqual([]);
  });

  it("does NOT fire on pronoun-pair mentions in any arrangement", () => {
    expect(pronounCheck("Ernest is they/them; never he/him or him/his.")).toEqual([]);
    expect(pronounCheck("pronouns: he-him style forms are banned")).toEqual([]);
  });

  it("does not let 'this', 'history' or 'chemistry' false-positive", () => {
    expect(pronounCheck("this history of chemistry is behind them")).toEqual([]);
  });

  it("never flags Katrina's pronouns — she is she/her and that is correct", () => {
    expect(pronounCheck("Katrina said she would read it; the note is hers.")).toEqual([]);
  });

  it("voiceWarning lists lines and stays warn-first in its wording", () => {
    const w = voiceWarning("he said\nshe said")!;
    expect(w).toContain("VOICE GATE");
    expect(w).toContain("line 1");
    expect(w).toMatch(/warn-first|not blocked/i);
    expect(voiceWarning("clean text about they/them")).toBeNull();
  });
});

describe("token and prefix format (rule 10d)", () => {
  it("accepts well-formed tokens and empty as a valid state", () => {
    expect(tokenError("last-mile-value-props")).toBeNull();
    expect(tokenError("uadl")).toBeNull();
    expect(tokenError("")).toBeNull();
  });

  it("refuses underscores, uppercase, bad shapes, and over-length", () => {
    expect(tokenError("last_mile")).toMatch(/underscore/);
    expect(tokenError("LastMile")).toMatch(/lowercase/);
    expect(tokenError("-leading")).toMatch(/kebab/);
    expect(tokenError("double--hyphen")).toMatch(/kebab/);
    expect(tokenError("a".repeat(25))).toMatch(/24/);
  });

  it("keeps prefixes short — posts append -NN", () => {
    expect(prefixError("lmvp")).toBeNull();
    expect(prefixError("a-very-long-prefix")).toMatch(/short/);
  });
});

describe("typed cadence", () => {
  it("normalises a real cadence and renders the line the strip used to hold", () => {
    const b = normalise({ id: "b1", cadence: { days: ["Wed"], start: "2026-08-12" } });
    expect(b.cadence).toEqual({ days: ["Wed"], start: "2026-08-12" });
    expect(cadenceLine(b.cadence)).toBe("Wed, weekly from 2026-08-12");
  });

  it("renders bi-weekly and undated honestly", () => {
    expect(cadenceLine({ days: ["Wed"], start: "", everyWeeks: 2 })).toBe("Wed, every 2 weeks — not yet dated");
  });

  it("junk becomes null — loudly absent, never half-parsed", () => {
    expect(normalise({ id: "b1", cadence: { days: ["Wednesday"], start: "x" } as never }).cadence).toBeNull();
    expect(normalise({ id: "b1", cadence: "Weekly — Wednesday" as never }).cadence).toBeNull();
    expect(normalise({ id: "b1" }).cadence).toBeNull();
  });

  it("token and contentPrefix default to empty strings", () => {
    const b = normalise({ id: "b1" });
    expect(b.token).toBe("");
    expect(b.contentPrefix).toBe("");
  });
});
