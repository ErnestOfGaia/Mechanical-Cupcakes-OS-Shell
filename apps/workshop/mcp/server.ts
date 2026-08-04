/**
 * Campaign Workshop — MCP server (stdio).
 *
 * Lets a Claude session work a board the way the app does: read the seams, talk one
 * through, record what Ernest decided, write it back. LOCAL AND DEV ONLY — it is
 * excluded from the Docker context and never ships in the image. It reaches the vault
 * through exactly the same lib/ code the app uses, so the placement rule, the
 * "Ernest decides, Katrina advises" logic, and verified saves all behave identically.
 *
 *   npm run mcp:build      bundle to mcp/dist/workshop-mcp.mjs
 *   npm run mcp:dev        run from source via tsx
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { loadEnv } from "./env";
import * as T from "./tools";

loadEnv();

const server = new McpServer({ name: "campaign-workshop", version: "1.0.0" });

/** Tool results are text; a thrown ToolError becomes a readable message, not a stack. */
const text = (s: string) => ({ content: [{ type: "text" as const, text: s }] });

function wrap<A extends unknown[]>(fn: (...a: A) => Promise<string>) {
  return async (...a: A) => {
    try {
      return text(await fn(...a));
    } catch (e) {
      return { content: [{ type: "text" as const, text: e instanceof Error ? e.message : String(e) }], isError: true };
    }
  };
}

const board = z.string().describe("Board name or id — a unique fragment is enough, e.g. 'Last Mile'.");

/* ------------------------------------------------------------------ read */

server.tool("workshop_status",
  "Whether the vault is on, writable, and what boards it can see. Start here if anything looks wrong.",
  {}, wrap(() => T.workshopStatus()));

server.tool("list_boards",
  "Every campaign and channel board in the vault, with counts.",
  {}, wrap(() => T.listBoardsTool()));

server.tool("get_board",
  "A summary of one board: counts, the placement rule's verdict, and the seam headings. Use this before working on a board — it is deliberately a summary, not the raw file.",
  { board }, wrap(({ board: b }: { board: string }) => T.getBoard(b)));

server.tool("seams_list",
  "The seams on a board — the things that are unresolved. Pass open_only to skip ones already cleared.",
  { board, open_only: z.boolean().optional().describe("Only seams that are not cleared or locked.") },
  wrap(({ board: b, open_only }: { board: string; open_only?: boolean }) => T.seamsList(b, open_only ?? false)));

server.tool("ideas_list",
  "The bench. Filter by all, undecided, in, hold, cut, or differs (where Katrina's verdict differs from Ernest's).",
  { board, filter: z.enum(["all", "undecided", "in", "hold", "cut", "differs"]).optional() },
  wrap(({ board: b, filter }: { board: string; filter?: string }) => T.ideasList(b, filter)));

server.tool("get_idea",
  "One idea in full: its story, both people's verdicts and notes, and where it landed.",
  { board, idea_id: z.string().describe("e.g. IDEA-07") },
  wrap(({ board: b, idea_id }: { board: string; idea_id: string }) => T.getIdea(b, idea_id)));

server.tool("run_placement_check",
  "Run Ernest's placement rule: every idea marked IN must produce a drop or a seed, or a seam must say why. Reports what is unaccounted for and what has a blocker hiding in a note instead of a seam.",
  { board }, wrap(({ board: b }: { board: string }) => T.runPlacementCheck(b)));

server.tool("gate_list",
  "The commit gate — what must be true before this campaign ships. Items Katrina owns are optional by default and never block.",
  { board }, wrap(({ board: b }: { board: string }) => T.gateList(b)));

server.tool("export_markdown",
  "The campaign plan as markdown, exactly as the app's Handoff tab exports it.",
  { board }, wrap(({ board: b }: { board: string }) => T.exportMarkdown(b)));

/* ------------------------------------------------------------------ write */

server.tool("set_verdict",
  "Record a verdict on a bench idea. ONLY record what Ernest has actually stated — never infer a verdict, never suggest one as though it were decided, and never default one. Katrina's column is for quoting her, and hers is advice that never decides. Marking an idea 'in' automatically sends it to the seed bank if it has no drop; it never creates a drop, because a drop costs a slot and a date that are Ernest's to give.",
  {
    board,
    idea_id: z.string().describe("e.g. IDEA-07"),
    person: z.enum(["E", "K"]).describe("E = Ernest, who decides. K = Katrina, whose verdict is input only."),
    verdict: z.enum(["in", "hold", "cut", "none"]).describe("'none' clears it back to undecided."),
  },
  wrap(({ board: b, idea_id, person, verdict }: { board: string; idea_id: string; person: "E" | "K"; verdict: string }) =>
    T.setVerdictTool(b, idea_id, person, verdict === "none" ? null : (verdict as "in" | "hold" | "cut"))));

server.tool("seam_add",
  "Write a new seam — something unresolved: an open question, a stale fact, a collision. A seam is tracked and gets resolved; a note is not. When an idea is IN but lands nowhere, this is what the placement rule is asking for.",
  {
    board,
    heading: z.string().describe("e.g. 'SEAM-16 — the pricing claim is unverified'"),
    body: z.string().describe("What is unresolved, and what would settle it."),
    tag: z.string().optional().describe("Open (default), Blocking, Watch, Decide, Check, Stale, Collision."),
  },
  wrap(({ board: b, heading, body, tag }: { board: string; heading: string; body: string; tag?: string }) =>
    T.seamAdd(b, heading, body, tag ?? "Open")));

server.tool("seam_update",
  "Edit a seam in place. Use the index from seams_list.",
  { board, index: z.number(), heading: z.string().optional(), body: z.string().optional(), tag: z.string().optional() },
  wrap(({ board: b, index, heading, body, tag }: { board: string; index: number; heading?: string; body?: string; tag?: string }) =>
    T.seamUpdate(b, index, { heading, body, tag })));

server.tool("seam_resolve",
  "Mark a seam cleared, appending how it was settled. Only when it genuinely is — a cleared seam stops being visible as work.",
  { board, index: z.number(), note: z.string().optional().describe("How it was resolved.") },
  wrap(({ board: b, index, note }: { board: string; index: number; note?: string }) => T.seamResolve(b, index, note)));

server.tool("idea_update",
  "Edit a bench idea's text, its cover seed, its YouTube flag, or either person's note. Verdicts are set with set_verdict, not here.",
  {
    board, idea_id: z.string(),
    title: z.string().optional(), story: z.string().optional(),
    asset: z.string().optional(), proves: z.string().optional(),
    cover: z.string().optional().describe("Cover image seed. No figures, no third-party marks, nothing that will date."),
    tag: z.string().optional(),
    yt: z.boolean().optional().describe("Flag as good YouTube material."),
    placed: z.enum(["seed", "none"]).optional().describe("'seed' sends it to the seed bank; 'none' clears that."),
    note_ernest: z.string().optional(), note_katrina: z.string().optional(),
  },
  wrap((a: Record<string, unknown>) => T.ideaUpdate(a.board as string, a.idea_id as string, {
    title: a.title as string | undefined, story: a.story as string | undefined,
    asset: a.asset as string | undefined, proves: a.proves as string | undefined,
    cover: a.cover as string | undefined, tag: a.tag as string | undefined,
    yt: a.yt as boolean | undefined,
    placed: a.placed === undefined ? undefined : a.placed === "seed" ? "seed" : null,
    noteE: a.note_ernest as string | undefined, noteK: a.note_katrina as string | undefined,
  })));

server.tool("arc_add_drop",
  "Give an idea its own slot in the arc. ONLY when Ernest has said so — a drop costs a publishing slot and a date, and at one post a week the number of drops IS the length of the campaign. Never add one to tidy up a placement-rule warning.",
  {
    board, idea_id: z.string(),
    title: z.string().describe("The drop's title, which is usually not the bench idea's title."),
    slot: z.string().optional().describe("e.g. 'Drop 3 — Wed'"),
    story: z.string().optional(), promo: z.string().optional(), note: z.string().optional(),
  },
  wrap((a: Record<string, unknown>) => T.arcAddDrop(a.board as string, a.idea_id as string, a.title as string, {
    slot: a.slot as string | undefined, story: a.story as string | undefined,
    promo: a.promo as string | undefined, note: a.note as string | undefined,
  })));

server.tool("gate_tick",
  "Tick or un-tick a commit-gate item. Only tick when the thing is actually true — an unticked gate item is a way the campaign embarrasses itself in public.",
  { board, index: z.number(), done: z.boolean(), note: z.string().optional() },
  wrap(({ board: b, index, done, note }: { board: string; index: number; done: boolean; note?: string }) =>
    T.gateTick(b, index, done, note)));

const transport = new StdioServerTransport();
await server.connect(transport);
