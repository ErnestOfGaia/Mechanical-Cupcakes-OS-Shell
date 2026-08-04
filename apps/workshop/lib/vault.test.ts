import { describe, expect, it } from "vitest";
import { defaultPathFor, resolveInRoot } from "./vault";
import { blankBoard } from "./board";

const ROOT = "C:/vault/Marketing";

describe("the vault refuses to leave its root", () => {
  it("allows a path inside", () => {
    expect(resolveInRoot(ROOT, "Campaign Content/Potential Campaigns/X/board.json")).toBeTruthy();
  });

  it("refuses traversal", () => {
    expect(resolveInRoot(ROOT, "../../../Windows/System32/board.json")).toBeNull();
    expect(resolveInRoot(ROOT, "Campaign Content/../../escape/board.json")).toBeNull();
  });

  it("refuses an absolute path", () => {
    expect(resolveInRoot(ROOT, "C:/Windows/board.json")).toBeNull();
    expect(resolveInRoot(ROOT, "/etc/passwd")).toBeNull();
  });

  it("refuses the root itself", () => {
    expect(resolveInRoot(ROOT, "")).toBeNull();
    expect(resolveInRoot(ROOT, ".")).toBeNull();
  });
});

describe("default filing follows the folder contract", () => {
  it("puts a campaign in its own folder under Potential Campaigns", () => {
    const p = defaultPathFor(blankBoard("The Unfinished Loop", "campaign"));
    expect(p).toBe("Campaign Content/Potential Campaigns/The Unfinished Loop/board.json");
  });

  it("puts a channel beside the other channel folders, not among campaigns", () => {
    const p = defaultPathFor(blankBoard("02 LinkedIn Channel", "channel"));
    expect(p).toBe("Campaign Content/02 LinkedIn Channel/board.json");
    expect(p).not.toContain("Potential Campaigns");
  });

  it("strips characters Windows will not accept in a folder name", () => {
    const p = defaultPathFor(blankBoard('bad:name?"<>|', "campaign"));
    expect(p).not.toMatch(/[:?"<>|]/);
    expect(p.endsWith("board.json")).toBe(true);
  });

  it("never produces an empty folder name", () => {
    expect(defaultPathFor(blankBoard("???", "campaign"))).toContain("Untitled");
  });
});
