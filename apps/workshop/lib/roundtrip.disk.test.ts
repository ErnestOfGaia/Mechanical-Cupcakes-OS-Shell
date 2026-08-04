/**
 * The schema claim, proved through the REAL disk path — saveBoard + listBoards against
 * a temp vault root — rather than only in memory. roundtrip.test.ts proves normalise()
 * is lossless; this proves the bytes that actually reach a file are too, which is the
 * version of the claim that matters when the file is the only copy of a campaign.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { normalise } from "./board";
import { fieldIdentical } from "./compare";
import type { Board } from "./types";

let tmp: string;
let listBoards: typeof import("./vault").listBoards;
let saveBoard: typeof import("./vault").saveBoard;

beforeAll(async () => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wsaudit-"));
  process.env.WORKSHOP_VAULT_ROOT = tmp;
  process.env.WORKSHOP_VAULT_WRITE = "1";
  delete process.env.NODE_ENV_OVERRIDE;
  const mod = await import("./vault");
  listBoards = mod.listBoards;
  saveBoard = mod.saveBoard;
  fs.mkdirSync(path.join(tmp, "Campaign Content", "Potential Campaigns", "Audit Board"), { recursive: true });
});

afterAll(() => {
  fs.rmSync(tmp, { recursive: true, force: true });
  delete process.env.WORKSHOP_VAULT_ROOT;
  delete process.env.WORKSHOP_VAULT_WRITE;
});

describe("Phase 1 audit — the schema survives a real write-then-read", () => {
  const source = {
    id: "audit-board",
    kind: "campaign" as const,
    name: "Audit Board",
    tagline: "t",
    stage: "shaping" as const,
    channels: ["Blog"],
    strip: [{ k: "Cadence", v: "Weekly" }, { k: "First drop", v: "unset", flag: true }],
    seams: [{ tag: "Open", cls: "", h: "SEAM-01 — x", p: "body" }],
    roles: [],
    ideas: [
      {
        id: "IDEA-01", tag: "post", title: "with new fields", story: "s", asset: "", proves: "",
        cover: "a cover seed", yt: true, placed: "seed" as const,
        v: { E: "in" as const, K: "in" as const }, n: { E: "en", K: "kn" },
        futureIdeaField: "must survive",
      },
    ],
    arc: [],
    gate: [{ t: "g", o: "K" as const, d: false, n: "" }],
    futureBoardField: "must survive",
    sourcePath: "Campaign Content/Potential Campaigns/Audit Board/board.json",
  } as unknown as Board;

  it("writes, re-reads from disk, and comes back field-identical", async () => {
    const board = normalise(source);
    const saved = await saveBoard(board);
    expect(saved.ok, `save failed: ${!saved.ok ? saved.error : ""}`).toBe(true);

    const { boards, scanned, errors } = await listBoards();
    console.log(`audit: scanned ${scanned.length}, errors ${errors.length}, boards ${boards.length}`);
    const back = boards.find((b) => b.id === "audit-board");
    expect(back, "board should be found on disk after save").toBeTruthy();

    // The claim Phase 1 exists to make.
    expect(back!.strip).toHaveLength(2);
    expect(back!.strip[1]).toEqual({ k: "First drop", v: "unset", flag: true });
    expect(back!.ideas[0].cover).toBe("a cover seed");
    expect(back!.ideas[0].yt).toBe(true);
    expect(back!.ideas[0].placed).toBe("seed");
    expect(back!.ideas[0].v.K).toBe("in");
    expect((back! as unknown as Record<string, unknown>).futureBoardField).toBe("must survive");
    expect((back!.ideas[0] as unknown as Record<string, unknown>).futureIdeaField).toBe("must survive");

    expect(fieldIdentical(board, back!)).toBe(true);
  });

  it("the audit itself can fail — a tampered file is detected", async () => {
    const file = path.join(tmp, "Campaign Content", "Potential Campaigns", "Audit Board", "board.json");
    const raw = JSON.parse(fs.readFileSync(file, "utf8"));
    raw.campaigns[0].strip = [];
    fs.writeFileSync(file, JSON.stringify(raw, null, 2), "utf8");

    const { boards } = await listBoards();
    const back = boards.find((b) => b.id === "audit-board")!;
    expect(back.strip).toHaveLength(0);
    expect(fieldIdentical(normalise(source), back)).toBe(false);
  });
});
