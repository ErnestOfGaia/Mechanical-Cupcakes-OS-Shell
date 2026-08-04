import { describe, expect, it } from "vitest";
import { normalise, toMarkdown } from "./board";
import type { Board, Idea, Verdict } from "./types";

const idea = (id: string, over: Partial<Idea> = {}): Idea => ({
  id, tag: "post", title: `t ${id}`, story: "s", asset: "", proves: "",
  cover: "", yt: false, placed: null, v: { E: null, K: null }, n: { E: "", K: "" }, ...over,
});

const board = (over: Partial<Board> = {}): Board => normalise({ id: "b1", name: "B", ...over });
const md = (b: Board) => toMarkdown(b, "2026-08-04");

describe("the export never carries another campaign's rules", () => {
  /**
   * The mockup hardcoded the music disclosure rules into every export, so the Last Mile
   * plan — a campaign that ships no tracks and claims no lineage — went out carrying a
   * rule about crediting musical lineage. These are the handoff's §5 grep checks,
   * written as assertions.
   */
  it("has no music rules on a campaign with no music ideas", () => {
    const out = md(board({ ideas: [idea("IDEA-01", { tag: "post" })] }));
    expect(out).not.toMatch(/tracks disclosed/i);
    expect(out).not.toMatch(/kinship/i);
  });

  it("states them on a campaign that does have music ideas", () => {
    for (const tag of ["music", "av", "both"]) {
      const out = md(board({ ideas: [idea("IDEA-01", { tag })] }));
      expect(out, `tag "${tag}" should carry the disclosure rule`).toMatch(/tracks disclosed/i);
      expect(out).toMatch(/kinship/i);
    }
  });

  it("never heads the assets table 'Playlist' — that was one campaign's word", () => {
    const out = md(board({ roles: [{ f: "x.md", role: "r", pl: "this folder", why: "w" }] }));
    expect(out).not.toMatch(/Playlist/i);
    expect(out).toContain("| File | Role | Where | Why |");
  });
});

describe("the export carries the new per-idea fields only when they are set", () => {
  it("prints a cover seed when there is one", () => {
    const out = md(board({ ideas: [idea("IDEA-01", { cover: "a quiet desk, no logos" })] }));
    expect(out).toContain("**Cover seed:** a quiet desk, no logos");
  });

  it("says nothing about a cover seed when there is none", () => {
    expect(md(board({ ideas: [idea("IDEA-01")] }))).not.toMatch(/Cover seed/);
  });

  it("marks a YouTube-flagged idea, and only that one", () => {
    const out = md(board({ ideas: [idea("IDEA-01", { yt: true }), idea("IDEA-02")] }));
    const lines = out.split("\n").filter((l) => l.startsWith("### IDEA-"));
    expect(lines[0]).toContain("YT seed");
    expect(lines[1]).not.toContain("YT seed");
  });
});

describe("the export states where every IN idea landed", () => {
  it("summarises placement above the bench table", () => {
    const b = board({
      ideas: [
        idea("IDEA-01", { v: { E: "in" as Verdict, K: null } }),
        idea("IDEA-02", { v: { E: "in" as Verdict, K: null }, placed: "seed" }),
        idea("IDEA-03", { v: { E: "in" as Verdict, K: null } }),
      ],
      arc: [{ slot: "Drop 1", ref: "IDEA-01", title: "t", story: "", track: "", songs: "", promo: "", note: "" }],
    });
    const out = md(b);
    expect(out).toContain("**3 IN** — 1 placed, 1 in the seed bank, 0 held by a seam, 1 unaccounted for.");
    expect(out).toContain("IDEA-03");
    expect(out).toMatch(/marked IN but landing nowhere/);
  });

  it("says nothing about placement for ideas that are not IN", () => {
    const out = md(board({ ideas: [idea("IDEA-01", { v: { E: "cut" as Verdict, K: null } })] }));
    expect(out).not.toMatch(/\*\*Placement:\*\*/);
  });

  it("does not warn when everything is accounted for", () => {
    const b = board({
      ideas: [idea("IDEA-01", { v: { E: "in" as Verdict, K: null }, placed: "seed" })],
    });
    expect(md(b)).not.toMatch(/landing nowhere/);
  });
});
