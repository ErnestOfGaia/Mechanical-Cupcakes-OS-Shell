import { describe, expect, it } from "vitest";
import { normalise } from "./board";
import { fieldIdentical } from "./compare";
import fixture from "./__fixtures__/synthetic-board.json";
import type { Board } from "./types";

// Invented content only (see the fixture file) — this is the compatibility oracle for
// "a field this app doesn't know about yet must survive a load/save cycle," the exact
// shape of the bug that silently dropped `strip` on every save before this file existed.
const raw = fixture.campaigns[0] as unknown as Board;

describe("normalise is lossless on fields it doesn't know about yet", () => {
  it("keeps a board-level field this app has never heard of", () => {
    const n = normalise(raw) as unknown as Record<string, unknown>;
    expect(n.futureBoardField).toBe("unknown-to-this-app-but-must-survive");
  });

  it("keeps an idea-level field this app has never heard of", () => {
    const n = normalise(raw);
    const i = n.ideas[0] as unknown as Record<string, unknown>;
    expect(i.futureField).toBe("unknown-to-this-app-but-must-survive");
  });

  it("round-trips the strip array untouched, including a flagged row", () => {
    const n = normalise(raw);
    expect(n.strip).toHaveLength(2);
    expect(n.strip[1]).toEqual({ k: "First drop", v: "Not set yet", flag: true });
  });

  it("round-trips cover, yt and placed on the idea that sets them", () => {
    const n = normalise(raw);
    expect(n.ideas[0].cover).toBe("A quiet workshop desk, no figures, no logos, generic and calm.");
    expect(n.ideas[0].yt).toBe(true);
    expect(n.ideas[0].placed).toBe("seed");
  });

  it("defaults strip/cover/yt/placed when a board doesn't set them", () => {
    const empty = normalise({});
    expect(empty.strip).toEqual([]);

    const plain = normalise(raw).ideas[1];
    expect(plain.cover).toBe("");
    expect(plain.yt).toBe(false);
    expect(plain.placed).toBeNull();
  });

  it("survives normalise → envelope → JSON round-trip → normalise field-identically", () => {
    const n = normalise(raw);
    const enveloped = {
      version: 3,
      identity: "E",
      activeId: n.id,
      campaigns: [{ ...n, sourcePath: undefined }],
    };
    const reparsed = JSON.parse(JSON.stringify(enveloped)) as typeof enveloped;
    const reloaded = normalise(reparsed.campaigns[0] as unknown as Board);
    expect(fieldIdentical(n, reloaded)).toBe(true);
  });
});
