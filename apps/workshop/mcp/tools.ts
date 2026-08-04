/**
 * The workshop's tools, for a Claude session.
 *
 * Every mutation is stateless: read the board fresh, apply one change, save through the
 * verified path carrying the mtime that was just read. Nothing is cached between calls,
 * so the app and a Claude session can both have the same board open — and if the other
 * one wrote in between, the save is refused rather than won.
 *
 * These reuse lib/ rather than reimplementing it. The placement rule, the "Ernest
 * decides, Katrina advises" logic and the verified save behave identically whether a
 * click or a Claude session triggered them, because they are the same functions.
 */
import { checkPlacement, formatPlacementReport, placement } from "../lib/rule";
import { setVerdict, toMarkdown } from "../lib/board";
import { listBoards, saveBoard, vaultStatus } from "../lib/vault";
import type { Board, Person, Verdict } from "../lib/types";

export class ToolError extends Error {}

const today = () => new Date().toISOString().slice(0, 10);

/** Find one board by id, name, or a unique fragment of either. */
async function findBoard(ref: string): Promise<Board> {
  const { boards, errors } = await listBoards();
  if (!boards.length) {
    throw new ToolError(`No boards found.${errors.length ? ` Scan problems: ${errors.join("; ")}` : " Is WORKSHOP_VAULT_ROOT pointing at the Marketing folder?"}`);
  }
  const q = ref.trim().toLowerCase();
  const exact = boards.filter((b) => b.id.toLowerCase() === q || b.name.toLowerCase() === q);
  const hits = exact.length ? exact : boards.filter((b) => b.id.toLowerCase().includes(q) || b.name.toLowerCase().includes(q));
  if (!hits.length) throw new ToolError(`No board matches "${ref}". Open boards: ${boards.map((b) => b.name).join(", ")}`);
  if (hits.length > 1) throw new ToolError(`"${ref}" matches ${hits.length} boards: ${hits.map((b) => b.name).join(", ")}. Be more specific.`);
  return hits[0];
}

/**
 * Read fresh, mutate, save verified. The mtime comes from the read that just happened,
 * so the conflict guard is doing real work: if the app saved while this call was being
 * composed, this save is refused instead of overwriting it.
 */
async function mutate(ref: string, fn: (b: Board) => string | void): Promise<string> {
  const board = await findBoard(ref);
  const note = fn(board);
  const res = await saveBoard(board, { expectedMtimeMs: board.mtimeMs });
  if (!res.ok) {
    if (res.conflict) {
      throw new ToolError(
        `Not saved — ${res.error}. Something else wrote this board (the app, or another session). Nothing was overwritten. Read the board again and re-apply the change.`,
      );
    }
    throw new ToolError(`Not saved — [${res.step}] ${res.error}`);
  }
  return `${note ? `${note}\n` : ""}Saved and verified on disk: ${res.path}`;
}

const idea = (b: Board, id: string) => {
  const found = b.ideas.find((i) => i.id.toLowerCase() === id.trim().toLowerCase());
  if (!found) throw new ToolError(`${b.name} has no idea "${id}". Ideas: ${b.ideas.map((i) => i.id).join(", ")}`);
  return found;
};

/* ------------------------------------------------------------------ read */

export async function workshopStatus(): Promise<string> {
  const v = vaultStatus();
  if (!v.enabled) return `Vault OFF — ${v.reason}\nNo boards can be read or written.`;
  const { boards, scanned, errors } = await listBoards();
  // The mode, never the path: a filesystem location has no business in tool output.
  return [
    `Vault ${v.writable ? "read/write" : "READ-ONLY (set WORKSHOP_VAULT_WRITE=1 to allow writes)"}`,
    `${boards.length} board(s) across ${scanned.length} scanned locations${errors.length ? `, ${errors.length} scan problem(s)` : ""}`,
    ...boards.map((b) => `  · ${b.name} — ${b.kind}, ${b.stage}, ${b.ideas.length} ideas, ${b.seams.length} seams`),
  ].join("\n");
}

export async function listBoardsTool(): Promise<string> {
  const { boards } = await listBoards();
  if (!boards.length) return "No boards found.";
  return boards.map((b) => {
    const open = b.gate.filter((g) => !g.d).length;
    return `${b.name}  [id: ${b.id}]\n  ${b.kind} · ${b.stage} · ${b.ideas.length} ideas · ${b.arc.length} arc · ${b.seams.length} seams · ${open}/${b.gate.length} gate open`;
  }).join("\n\n");
}

/** A summary, deliberately — dumping a whole board.json would bury the useful part. */
export async function getBoard(ref: string): Promise<string> {
  const b = await findBoard(ref);
  const r = checkPlacement(b);
  const L = [
    `# ${b.name}  [${b.id}]`,
    `${b.kind} · stage: ${b.stage} · channels: ${b.channels.join(", ") || "none"}`,
    b.tagline ? `\n${b.tagline}` : "",
    `\n## Counts`,
    `${b.ideas.length} ideas — ${b.ideas.filter((i) => i.v.E === "in").length} in, ${b.ideas.filter((i) => i.v.E === "hold").length} hold, ` +
      `${b.ideas.filter((i) => i.v.E === "cut").length} cut, ${b.ideas.filter((i) => i.v.E === null).length} undecided`,
    `${b.arc.length} arc entries · ${b.seams.length} seams · ${b.gate.filter((g) => !g.d).length}/${b.gate.length} gate items open`,
    `Katrina has weighed in on ${b.ideas.filter((i) => i.v.K).length} idea(s).`,
    `\n## Placement rule`,
    r.ok ? `All ${r.rows.length} IN ideas are accounted for.` : `⚠️ ${r.violations.length} IN idea(s) land nowhere: ${r.violations.map((v) => v.id).join(", ")}`,
    r.noteBlockers.length ? `⚠️ ${r.noteBlockers.map((v) => v.id).join(", ")} have a blocker written in a NOTE, not a seam.` : "",
    `\n## Open seams`,
    ...(b.seams.length ? b.seams.map((s, i) => `${i + 1}. [${s.tag}] ${s.h}`) : ["(none)"]),
  ];
  return L.filter(Boolean).join("\n");
}

export async function seamsList(ref: string, openOnly = false): Promise<string> {
  const b = await findBoard(ref);
  const seams = openOnly ? b.seams.filter((s) => !/^(cleared|locked|resolved)$/i.test(s.tag)) : b.seams;
  if (!seams.length) return openOnly ? "No open seams." : "This board has no seams. A campaign with none usually means nobody looked hard enough.";
  return seams.map((s) => {
    const i = b.seams.indexOf(s);
    return `[${i}] ${s.tag.toUpperCase()} — ${s.h}\n${s.p}`;
  }).join("\n\n");
}

export async function ideasList(ref: string, filter?: string): Promise<string> {
  const b = await findBoard(ref);
  const f = (filter ?? "all").toLowerCase();
  const list = b.ideas.filter((i) =>
    f === "all" ? true
      : f === "undecided" ? i.v.E === null
      : f === "differs" ? Boolean(i.v.E && i.v.K && i.v.E !== i.v.K)
      : i.v.E === f);
  if (!list.length) return `No ideas match "${f}".`;
  return list.map((i) => {
    const p = i.v.E === "in" ? ` · ${placement(i, b) ?? "UNPLACED"}` : "";
    return `${i.id}  [${i.tag}]${i.yt ? " [YT]" : ""}  E:${i.v.E ?? "—"} K:${i.v.K ?? "—"}${p}\n  ${i.title}`;
  }).join("\n\n");
}

export async function getIdea(ref: string, ideaId: string): Promise<string> {
  const b = await findBoard(ref);
  const i = idea(b, ideaId);
  return [
    `${i.id}  [${i.tag}]${i.yt ? "  · flagged as YouTube material" : ""}`,
    `Title: ${i.title}`,
    `\nStory: ${i.story}`,
    i.asset ? `Asset: ${i.asset}` : "",
    i.proves ? `Proves: ${i.proves}` : "",
    i.cover ? `Cover seed: ${i.cover}` : "",
    `\nErnest: ${i.v.E ?? "undecided"}${i.n.E ? ` — ${i.n.E}` : ""}`,
    `Katrina: ${i.v.K ?? "no input"}${i.n.K ? ` — ${i.n.K}` : ""}`,
    i.v.E === "in" ? `Placement: ${placement(i, b) ?? "UNPLACED — needs a drop, a seed, or a seam"}` : "",
  ].filter(Boolean).join("\n");
}

export async function runPlacementCheck(ref: string): Promise<string> {
  return formatPlacementReport(await findBoard(ref));
}

export async function exportMarkdown(ref: string): Promise<string> {
  return toMarkdown(await findBoard(ref), today());
}

export async function gateList(ref: string): Promise<string> {
  const b = await findBoard(ref);
  if (!b.gate.length) return "This board has no gate items.";
  return b.gate.map((g, i) => {
    const blocking = g.blocking ?? g.o !== "K";
    return `[${i}] ${g.d ? "[x]" : "[ ]"} ${g.t}  — ${g.o}${blocking ? "" : " (optional, does not block)"}${g.n ? `\n     ${g.n}` : ""}`;
  }).join("\n");
}

/* ------------------------------------------------------------------ write */

export async function seamAdd(ref: string, heading: string, body: string, tag = "Open"): Promise<string> {
  return mutate(ref, (b) => {
    b.seams.push({ tag, cls: "", h: heading, p: body });
    return `Added seam: [${tag}] ${heading}`;
  });
}

export async function seamUpdate(ref: string, index: number, patch: { heading?: string; body?: string; tag?: string }): Promise<string> {
  return mutate(ref, (b) => {
    const s = b.seams[index];
    if (!s) throw new ToolError(`No seam at index ${index}. This board has ${b.seams.length}.`);
    if (patch.heading !== undefined) s.h = patch.heading;
    if (patch.body !== undefined) s.p = patch.body;
    if (patch.tag !== undefined) s.tag = patch.tag;
    return `Updated seam [${index}]: ${s.h}`;
  });
}

export async function seamResolve(ref: string, index: number, note?: string): Promise<string> {
  return mutate(ref, (b) => {
    const s = b.seams[index];
    if (!s) throw new ToolError(`No seam at index ${index}. This board has ${b.seams.length}.`);
    s.tag = "Cleared";
    s.cls = "clear";
    if (note) s.p = `${s.p}\n\nRESOLVED: ${note}`;
    return `Marked seam [${index}] cleared: ${s.h}`;
  });
}

export async function ideaUpdate(
  ref: string, ideaId: string,
  patch: { title?: string; story?: string; asset?: string; proves?: string; cover?: string; tag?: string; yt?: boolean; placed?: "seed" | null; noteE?: string; noteK?: string },
): Promise<string> {
  return mutate(ref, (b) => {
    const i = idea(b, ideaId);
    const changed: string[] = [];
    for (const k of ["title", "story", "asset", "proves", "cover", "tag"] as const) {
      if (patch[k] !== undefined) { (i[k] as string) = patch[k] as string; changed.push(k); }
    }
    if (patch.yt !== undefined) { i.yt = patch.yt; changed.push("yt"); }
    if (patch.placed !== undefined) { i.placed = patch.placed; changed.push("placed"); }
    if (patch.noteE !== undefined) { i.n = { ...i.n, E: patch.noteE }; changed.push("Ernest's note"); }
    if (patch.noteK !== undefined) { i.n = { ...i.n, K: patch.noteK }; changed.push("Katrina's note"); }
    if (!changed.length) throw new ToolError("Nothing to change — pass at least one field.");
    return `${i.id}: updated ${changed.join(", ")}`;
  });
}

export async function setVerdictTool(ref: string, ideaId: string, person: Person, verdict: Verdict): Promise<string> {
  return mutate(ref, (b) => {
    const i = idea(b, ideaId);
    const warnings = setVerdict(b, i.id, person, verdict);
    const now = i.v[person];
    return [`${i.id}: ${person === "E" ? "Ernest" : "Katrina"} → ${now ?? "undecided"}`, ...warnings].join("\n");
  });
}

export async function arcAddDrop(ref: string, ideaRef: string, title: string, opts: { slot?: string; story?: string; promo?: string; note?: string } = {}): Promise<string> {
  return mutate(ref, (b) => {
    const i = idea(b, ideaRef);
    if (b.arc.some((d) => (d.ref ?? "").includes(i.id))) throw new ToolError(`${i.id} already has a drop in the arc.`);
    b.arc.push({
      slot: opts.slot ?? `Drop ${b.arc.length + 1}`,
      ref: i.id, title, story: opts.story ?? "", track: "", songs: "",
      promo: opts.promo ?? "", note: opts.note ?? "",
    });
    // It has a slot now, so the seed flag would be a second answer to a settled question.
    if (i.placed === "seed") i.placed = null;
    return `Added ${opts.slot ?? `Drop ${b.arc.length}`} for ${i.id}: ${title}`;
  });
}

export async function gateTick(ref: string, index: number, done: boolean, note?: string): Promise<string> {
  return mutate(ref, (b) => {
    const g = b.gate[index];
    if (!g) throw new ToolError(`No gate item at index ${index}. This board has ${b.gate.length}.`);
    g.d = done;
    if (note !== undefined) g.n = note;
    return `Gate [${index}] ${done ? "ticked" : "un-ticked"}: ${g.t}`;
  });
}
