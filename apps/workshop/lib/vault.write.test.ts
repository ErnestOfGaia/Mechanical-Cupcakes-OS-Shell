/**
 * The write path, against a real temp vault.
 *
 * The rule this file exists to enforce: a check that cannot detect its own failure
 * always reports the flattering result. So every guarantee here is tested in BOTH
 * directions — the green case, and a deliberately broken case proving the check goes
 * red. A verification that has never been seen failing is not a verification.
 */
import fsSync from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { normalise } from "./board";
import type { Board } from "./types";

let tmp: string;
let V: typeof import("./vault");

const CAMPAIGNS = "Campaign Content/Potential Campaigns";

function boardAt(rel: string, over: Partial<Board> = {}): Board {
  return normalise({
    id: "test-board",
    kind: "campaign",
    name: "Test Board",
    tagline: "t",
    stage: "shaping",
    channels: ["Blog"],
    strip: [{ k: "Cadence", v: "Weekly" }],
    ideas: [{
      id: "IDEA-01", tag: "post", title: "one", story: "a story", asset: "", proves: "",
      cover: "", yt: false, placed: null, v: { E: "in", K: null }, n: { E: "", K: "" },
    }],
    sourcePath: rel,
    ...over,
  });
}

/** Write a file straight to disk, bypassing saveBoard — for simulating another writer. */
function writeRaw(rel: string, board: Partial<Board>): void {
  const file = path.join(tmp, rel);
  fsSync.mkdirSync(path.dirname(file), { recursive: true });
  fsSync.writeFileSync(file, JSON.stringify({ version: 3, identity: "E", activeId: board.id, campaigns: [board] }, null, 2), "utf8");
}

beforeAll(async () => {
  tmp = fsSync.mkdtempSync(path.join(os.tmpdir(), "wsvault-"));
  process.env.WORKSHOP_VAULT_ROOT = tmp;
  process.env.WORKSHOP_VAULT_WRITE = "1";
  V = await import("./vault");
});

afterEach(() => {
  const cc = path.join(tmp, "Campaign Content");
  if (fsSync.existsSync(cc)) fsSync.rmSync(cc, { recursive: true, force: true });
});

afterAll(() => {
  fsSync.rmSync(tmp, { recursive: true, force: true });
  delete process.env.WORKSHOP_VAULT_ROOT;
  delete process.env.WORKSHOP_VAULT_WRITE;
});

describe("a save is only reported once the file has been read back", () => {
  const rel = `${CAMPAIGNS}/Test Board/board.json`;

  it("writes, verifies and reports the new mtime", async () => {
    const res = await V.saveBoard(boardAt(rel));
    expect(res.ok, !res.ok ? res.error : "").toBe(true);
    if (!res.ok) return;
    expect(res.verified).toBe(true);
    expect(res.mtimeMs).toBeGreaterThan(0);
    expect(fsSync.existsSync(path.join(tmp, rel))).toBe(true);
  });

  it("leaves no temp file behind", async () => {
    await V.saveBoard(boardAt(rel));
    const left = fsSync.readdirSync(path.join(tmp, CAMPAIGNS, "Test Board"));
    expect(left.filter((n) => n.includes(".tmp-"))).toEqual([]);
  });

  // The fail-capable half: verifyOnDisk must go red on a file that is wrong.
  it("verifyOnDisk goes RED when the file holds a different board", async () => {
    await V.saveBoard(boardAt(rel));
    const file = path.join(tmp, rel);
    const parsed = JSON.parse(fsSync.readFileSync(file, "utf8"));
    parsed.campaigns[0].ideas[0].v.E = "cut"; // someone else's verdict, not ours
    fsSync.writeFileSync(file, JSON.stringify(parsed, null, 2), "utf8");

    const check = await V.verifyOnDisk(file, boardAt(rel));
    expect(check.ok).toBe(false);
    expect(check.reason).toMatch(/differ/i);
  });

  it("verifyOnDisk goes RED on a file that is missing entirely", async () => {
    const check = await V.verifyOnDisk(path.join(tmp, "nope", "board.json"), boardAt(rel));
    expect(check.ok).toBe(false);
    expect(check.reason).toMatch(/missing|empty|parse/i);
  });

  it("verifyOnDisk goes RED on a file that is not JSON", async () => {
    const file = path.join(tmp, CAMPAIGNS, "Test Board", "board.json");
    fsSync.mkdirSync(path.dirname(file), { recursive: true });
    fsSync.writeFileSync(file, "{ this is not json", "utf8");
    const check = await V.verifyOnDisk(file, boardAt(rel));
    expect(check.ok).toBe(false);
  });

  it("refuses to write anything that is not board.json", async () => {
    const res = await V.saveBoard(boardAt(`${CAMPAIGNS}/X/notes.md`));
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/not board\.json/);
  });

  it("refuses a sourcePath that escapes the vault root", async () => {
    const res = await V.saveBoard(boardAt("../../../Windows/Temp/board.json"));
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/outside the vault root/);
  });
});

describe("two writers cannot silently overwrite each other", () => {
  const rel = `${CAMPAIGNS}/Test Board/board.json`;

  it("saves cleanly when the caller passes the mtime it last saw", async () => {
    const first = await V.saveBoard(boardAt(rel));
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    const second = await V.saveBoard(boardAt(rel, { tagline: "edited" }), { expectedMtimeMs: first.mtimeMs });
    expect(second.ok, !second.ok ? second.error : "").toBe(true);
  });

  it("REFUSES when the file changed underneath the caller", async () => {
    const first = await V.saveBoard(boardAt(rel));
    expect(first.ok).toBe(true);
    if (!first.ok) return;

    // Somebody else — the MCP server, or Ernest in a second tab — writes it.
    writeRaw(rel, { ...boardAt(rel), tagline: "written by someone else" });

    const res = await V.saveBoard(boardAt(rel, { tagline: "mine" }), { expectedMtimeMs: first.mtimeMs });
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.conflict).toBe(true);
    expect(res.error).toMatch(/changed on disk/);

    // and the other writer's content is still there, untouched
    const onDisk = JSON.parse(fsSync.readFileSync(path.join(tmp, rel), "utf8"));
    expect(onDisk.campaigns[0].tagline).toBe("written by someone else");
  });

  it("REFUSES a blind save over a file the caller never read", async () => {
    writeRaw(rel, { ...boardAt(rel), tagline: "pre-existing" });
    const res = await V.saveBoard(boardAt(rel, { tagline: "mine" }));
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.conflict).toBe(true);
  });

  it("force overrides the guard, because sometimes Ernest means it", async () => {
    writeRaw(rel, { ...boardAt(rel), tagline: "pre-existing" });
    const res = await V.saveBoard(boardAt(rel, { tagline: "mine" }), { force: true });
    expect(res.ok, !res.ok ? res.error : "").toBe(true);
    const onDisk = JSON.parse(fsSync.readFileSync(path.join(tmp, rel), "utf8"));
    expect(onDisk.campaigns[0].tagline).toBe("mine");
  });
});

describe("what is being replaced is copied aside first", () => {
  const rel = `${CAMPAIGNS}/Test Board/board.json`;

  it("takes no backup on the first write — there is nothing to lose yet", async () => {
    const res = await V.saveBoard(boardAt(rel));
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.backup).toBeUndefined();
  });

  it("copies the previous version aside on every overwrite", async () => {
    const first = await V.saveBoard(boardAt(rel));
    if (!first.ok) throw new Error(first.error);
    const second = await V.saveBoard(boardAt(rel, { tagline: "v2" }), { expectedMtimeMs: first.mtimeMs });
    expect(second.ok).toBe(true);
    if (!second.ok) return;
    expect(second.backup).toBeTruthy();

    // The backup holds the OLD content, which is the only reason to take one.
    const backed = JSON.parse(fsSync.readFileSync(path.join(tmp, second.backup!), "utf8"));
    expect(backed.campaigns[0].tagline).toBe("t");
  });

  it("keeps the backup folder from growing without limit", async () => {
    let mtime: number | undefined;
    for (let i = 0; i < 14; i += 1) {
      const r = await V.saveBoard(boardAt(rel, { tagline: `v${i}` }), { expectedMtimeMs: mtime, force: i === 0 });
      if (!r.ok) throw new Error(`${r.error} (iteration ${i})`);
      mtime = r.mtimeMs;
      // Timestamps are the sort key; keep them distinct.
      await new Promise((res) => setTimeout(res, 3));
    }
    const dir = path.join(tmp, "Campaign Content/_workshop-backups/auto/test-board");
    const kept = fsSync.readdirSync(dir).filter((n) => n.endsWith(".board.json"));
    console.log(`backups kept after 14 saves: ${kept.length}`);
    expect(kept.length).toBeLessThanOrEqual(10);
    expect(kept.length).toBeGreaterThan(0);
  });
});

describe("the scanner finds every board the folder contract allows", () => {
  it("finds a campaign, a channel, and a COMMITTED campaign one level deeper", async () => {
    writeRaw(`${CAMPAIGNS}/Potential One/board.json`, { ...boardAt("x"), id: "potential-one", name: "Potential One" });
    writeRaw("Campaign Content/02 LinkedIn Channel/board.json", { ...boardAt("x"), id: "channel-one", name: "Channel One", kind: "channel" });
    writeRaw("Campaign Content/01 Committed Blog Campaigns 2026-W30/02 NEXT -Committed One/board.json", { ...boardAt("x"), id: "committed-one", name: "Committed One" });

    const { boards, scanned, errors } = await V.listBoards();
    console.log(`scanned ${scanned.length} paths, ${errors.length} errors, ${boards.length} boards: ${boards.map((b) => b.id).join(", ")}`);
    const ids = boards.map((b) => b.id).sort();
    expect(ids).toEqual(["channel-one", "committed-one", "potential-one"]);
  });

  it("attaches the file's mtime so a save can prove which version it edited", async () => {
    writeRaw(`${CAMPAIGNS}/Potential One/board.json`, { ...boardAt("x"), id: "potential-one" });
    const { boards } = await V.listBoards();
    expect(boards[0].mtimeMs).toBeGreaterThan(0);
  });

  it("never scans the backups folder as if it held boards", async () => {
    writeRaw("Campaign Content/_workshop-backups/auto/x/board.json", { ...boardAt("x"), id: "should-not-appear" });
    const { boards, scanned } = await V.listBoards();
    expect(boards.map((b) => b.id)).not.toContain("should-not-appear");
    expect(scanned.some((s) => s.includes("_workshop-backups"))).toBe(false);
  });
});

describe("long paths", () => {
  /**
   * Not a feature — a regression guard. The committed-campaign folders already run to
   * 246 characters and a temp suffix pushes past Windows' classic 260-char MAX_PATH.
   * Measured on this machine (LongPathsEnabled=0, Node 24): libuv applies the \\?\
   * prefix internally and paths work to ~4000 chars, so the app carries no long-path
   * code of its own. If that ever stops being true, this test is what says so.
   */
  it("saves and re-reads a board whose path is well past 260 characters", async () => {
    // One long folder name rather than nesting: the scanner's folder contract puts a
    // campaign exactly one level under Potential Campaigns, and a single path component
    // may be up to 255 characters on Windows. Sized from the temp root so the total
    // clears 260 wherever the test happens to run.
    const prefix = path.join(tmp, CAMPAIGNS).length + "/board.json".length;
    const name = "A-campaign-with-a-deliberately-long-folder-name-".repeat(6).slice(0, Math.max(170, 262 - prefix));
    const rel = `${CAMPAIGNS}/${name}/board.json`;
    const full = path.join(tmp, rel);
    console.log(`long-path test writes to a ${full.length}-character path`);
    expect(full.length).toBeGreaterThan(260);

    const res = await V.saveBoard(boardAt(rel));
    expect(res.ok, !res.ok ? `${res.step}: ${res.error}` : "").toBe(true);

    const { boards } = await V.listBoards();
    expect(boards.some((b) => b.id === "test-board")).toBe(true);
  });
});
