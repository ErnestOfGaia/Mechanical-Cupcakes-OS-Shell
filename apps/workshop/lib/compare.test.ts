import { describe, expect, it } from "vitest";
import { normalise } from "./board";
import { canon, fieldIdentical } from "./compare";

describe('fieldIdentical — the definition of "same board" for round-trip proofs', () => {
  it("ignores which side carries sourcePath", () => {
    const a = normalise({ name: "x" });
    const b = { ...a, sourcePath: "Campaign Content/x/board.json" };
    expect(fieldIdentical(a, b)).toBe(true);
  });

  it("ignores object key order", () => {
    const a = normalise({ name: "Board", tagline: "t" });
    const reordered = Object.fromEntries(Object.entries(a).reverse()) as typeof a;
    expect(fieldIdentical(a, reordered)).toBe(true);
  });

  it("is sensitive to array order — arc and idea order is meaningful content", () => {
    const entry = (title: string) => ({ slot: "1", ref: "", title, story: "", track: "", songs: "", promo: "", note: "" });
    const a = normalise({ arc: [entry("first"), entry("second")] });
    const b = normalise({ arc: [entry("second"), entry("first")] });
    expect(fieldIdentical(a, b)).toBe(false);
  });

  it("catches a real content difference", () => {
    const a = normalise({ name: "Board A" });
    const b = normalise({ name: "Board B" });
    expect(fieldIdentical(a, b)).toBe(false);
  });

  it("does not care which argument is the disk file and which is freshly loaded", () => {
    // Explicit id: normalise() mints a fresh one from newId() whenever it's absent,
    // so two separately-normalised boards with no id are two DIFFERENT boards by
    // construction — this test is about comparator symmetry, not id generation.
    const a = normalise({ id: "b1", name: "x", strip: [{ k: "a", v: "1" }] });
    const b = normalise({ id: "b1", name: "x", strip: [{ k: "a", v: "1" }] });
    expect(fieldIdentical(a, b)).toBe(true);
    expect(fieldIdentical(b, a)).toBe(true);
  });

  it("canon strips undefined the same as an absent key", () => {
    const withUndefined = canon({ id: "b1", name: "x", sourcePath: undefined });
    const withoutKey = canon({ id: "b1", name: "x" });
    expect(withUndefined).toEqual(withoutKey);
  });
});
