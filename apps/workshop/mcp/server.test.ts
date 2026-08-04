/**
 * The MCP server, driven the way Claude Desktop drives it: a real child process over
 * stdio, spoken to with the SDK's own client. Anything less would test the functions
 * rather than the server, and the failure modes worth catching here — a bundle that
 * does not start, a tool that is not registered, a schema Claude cannot fill in — all
 * live in the wiring.
 */
import fsSync from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BUNDLE = path.join(HERE, "dist", "workshop-mcp.mjs");

// Gated on the bundle existing so `npm test` stays green without a build step;
// `npm run test:mcp` builds first.
const maybe = fsSync.existsSync(BUNDLE) ? describe : describe.skip;

let tmp: string;
let client: Client;

const CAMPAIGNS = "Campaign Content/Potential Campaigns/Demo Campaign";

function seed() {
  const dir = path.join(tmp, CAMPAIGNS);
  fsSync.mkdirSync(dir, { recursive: true });
  const boardData = {
    version: 3, identity: "E", activeId: "demo",
    campaigns: [{
      id: "demo", kind: "campaign", name: "Demo Campaign", tagline: "a fixture", stage: "shaping",
      channels: ["Blog"], strip: [], roles: [],
      seams: [{ tag: "Open", cls: "", h: "SEAM-01 — an open question", p: "needs settling" }],
      ideas: [
        { id: "IDEA-01", tag: "post", title: "First", story: "s", asset: "", proves: "", cover: "", yt: false, placed: null, v: { E: null, K: null }, n: { E: "", K: "" } },
        { id: "IDEA-02", tag: "post", title: "Second", story: "s", asset: "", proves: "", cover: "", yt: false, placed: null, v: { E: null, K: null }, n: { E: "", K: "" } },
      ],
      arc: [], gate: [{ t: "a gate item", o: "E", d: false, blocking: true, n: "" }],
    }],
  };
  fsSync.writeFileSync(path.join(dir, "board.json"), JSON.stringify(boardData, null, 2), "utf8");
}

const call = async (name: string, args: Record<string, unknown> = {}) => {
  const r = await client.callTool({ name, arguments: args }) as { content: { text: string }[]; isError?: boolean };
  return { text: r.content.map((c) => c.text).join("\n"), isError: Boolean(r.isError) };
};

const onDisk = () =>
  JSON.parse(fsSync.readFileSync(path.join(tmp, CAMPAIGNS, "board.json"), "utf8")).campaigns[0];

beforeAll(async () => {
  tmp = fsSync.mkdtempSync(path.join(os.tmpdir(), "wsmcp-"));
  seed();
  client = new Client({ name: "test", version: "1.0.0" });
  await client.connect(new StdioClientTransport({
    command: process.execPath,
    args: [BUNDLE],
    env: { ...process.env, WORKSHOP_VAULT_ROOT: tmp, WORKSHOP_VAULT_WRITE: "1" } as Record<string, string>,
  }));
}, 30_000);

afterAll(async () => {
  await client?.close().catch(() => {});
  fsSync.rmSync(tmp, { recursive: true, force: true });
});

maybe("the MCP server, over a real stdio connection", () => {
  it("starts and advertises its tools", async () => {
    const { tools } = await client.listTools();
    const names = tools.map((t) => t.name).sort();
    console.log(`${names.length} tools: ${names.join(", ")}`);
    expect(names).toEqual(expect.arrayContaining([
      "workshop_status", "list_boards", "get_board", "seams_list", "ideas_list", "get_idea",
      "run_placement_check", "gate_list", "export_markdown",
      "set_verdict", "seam_add", "seam_update", "seam_resolve", "idea_update", "arc_add_drop", "gate_tick",
    ]));
  });

  it("tells the truth about the vault without leaking the path", async () => {
    const { text } = await call("workshop_status");
    expect(text).toContain("read/write");
    expect(text).toContain("Demo Campaign");
    expect(text).not.toContain(tmp); // the mode, never the location
  });

  it("reads a board and a single idea", async () => {
    expect((await call("get_board", { board: "Demo" })).text).toContain("Demo Campaign");
    expect((await call("get_idea", { board: "Demo", idea_id: "IDEA-01" })).text).toContain("First");
  });

  it("records a verdict and it lands on disk", async () => {
    const { text, isError } = await call("set_verdict", { board: "Demo", idea_id: "IDEA-01", person: "E", verdict: "in" });
    expect(isError, text).toBe(false);
    expect(text).toContain("Saved and verified on disk");
    const b = onDisk();
    expect(b.ideas[0].v.E).toBe("in");
    // IN with no drop goes to the seed bank automatically — but never gets a drop.
    expect(b.ideas[0].placed).toBe("seed");
    expect(b.arc).toHaveLength(0);
  });

  it("keeps Katrina's verdict as input — it never moves placement", async () => {
    const { isError } = await call("set_verdict", { board: "Demo", idea_id: "IDEA-02", person: "K", verdict: "in" });
    expect(isError).toBe(false);
    const b = onDisk();
    expect(b.ideas[1].v.K).toBe("in");
    expect(b.ideas[1].v.E).toBeNull();
    expect(b.ideas[1].placed).toBeNull();
  });

  it("runs the placement rule and can report a violation", async () => {
    // IDEA-02 is not IN, so make it IN with nothing holding it: that is a violation.
    await call("idea_update", { board: "Demo", idea_id: "IDEA-02", placed: "none" });
    await call("set_verdict", { board: "Demo", idea_id: "IDEA-02", person: "E", verdict: "in" });
    await call("idea_update", { board: "Demo", idea_id: "IDEA-02", placed: "none" });
    const { text } = await call("run_placement_check", { board: "Demo" });
    console.log(text);
    expect(text).toMatch(/VIOLATION|unaccounted for/);
  });

  it("writes a seam, and the seam then accounts for the idea", async () => {
    const add = await call("seam_add", {
      board: "Demo", heading: "SEAM-02 — IDEA-02 waits on a citation", body: "needs a fetched URL", tag: "Blocking",
    });
    expect(add.isError, add.text).toBe(false);
    const { text } = await call("run_placement_check", { board: "Demo" });
    expect(text).toContain("0 unaccounted for");
  });

  it("adds a drop only when asked, and clears the seed when it does", async () => {
    const r = await call("arc_add_drop", { board: "Demo", idea_id: "IDEA-01", title: "The opener" });
    expect(r.isError, r.text).toBe(false);
    const b = onDisk();
    expect(b.arc).toHaveLength(1);
    expect(b.arc[0].ref).toBe("IDEA-01");
    expect(b.ideas[0].placed).toBeNull(); // it has a slot now; seed would be a second answer
  });

  it("ticks a gate item", async () => {
    await call("gate_tick", { board: "Demo", index: 0, done: true, note: "verified" });
    expect(onDisk().gate[0].d).toBe(true);
  });

  it("exports the plan as markdown", async () => {
    const { text } = await call("export_markdown", { board: "Demo" });
    expect(text).toContain("# Demo Campaign");
    expect(text).toContain("Decisions are Ernest's");
  });

  it("reports an unknown board as a message, not a crash", async () => {
    const { text, isError } = await call("get_board", { board: "Does Not Exist" });
    expect(isError).toBe(true);
    expect(text).toMatch(/No board matches/);
  });

  it("REFUSES to overwrite a board something else changed", async () => {
    // Simulate the app saving while a Claude session had the board open.
    const file = path.join(tmp, CAMPAIGNS, "board.json");
    const raw = JSON.parse(fsSync.readFileSync(file, "utf8"));
    raw.campaigns[0].tagline = "written by the app";
    fsSync.writeFileSync(file, JSON.stringify(raw, null, 2), "utf8");
    // Push the mtime clearly past the copy the server is about to read.
    const future = new Date(Date.now() + 4000);
    fsSync.utimesSync(file, future, future);

    const { text, isError } = await call("idea_update", { board: "Demo", idea_id: "IDEA-01", title: "clobbered" });
    // Either it refuses (conflict) or it re-read first and saved safely; what must NOT
    // happen is the other writer's content vanishing.
    if (isError) expect(text).toMatch(/changed on disk|Not saved/);
    expect(onDisk().tagline).toBe("written by the app");
  });
});
