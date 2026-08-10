import { kindOf } from "./kinds";
import { checkPlacement, placement } from "./rule";
import type { Board, Cadence, Idea, Person, Verdict, Weekday, Workspace } from "./types";

/* ------------------------------------------------------------------ verdicts */

/**
 * Ernest decides. Katrina advises.
 *
 * Her verdict is genuinely welcome and never required — a card she hasn't touched is
 * not incomplete, and her being asleep in another hemisphere never blocks a decision.
 * Where she disagrees with a call already made, the row raises a flag: worth reading,
 * not a gate.
 */
export const decided = (i: Idea): Verdict => i.v.E ?? null;

export const flagged = (i: Idea): boolean =>
  Boolean(i.v.E && i.v.K && i.v.E !== i.v.K);

export type SettleState = "settled-in" | "settled-hold" | "settled-cut" | "input" | "untouched";

export function settle(i: Idea): SettleState {
  if (i.v.E) return `settled-${i.v.E}` as SettleState;
  if (i.v.K) return "input"; // she weighed in first; awaiting Ernest
  return "untouched";
}

/** A gate item blocks unless it is explicitly marked otherwise. */
export const blocks = (g: { o: Person | "both"; blocking?: boolean }): boolean =>
  g.blocking ?? g.o !== "K";

export const openBlockers = (b: Board): number =>
  b.gate.filter((g) => !g.d && blocks(g)).length;

export const openOptional = (b: Board): number =>
  b.gate.filter((g) => !g.d && !blocks(g)).length;

/**
 * Record a verdict, and keep placement honest alongside it.
 *
 * Ernest asked why the drop isn't just created when IN is clicked. The answer is that
 * a seed and a drop cost completely different things:
 *
 *   a SEED costs nothing — no slot, no order, no date. Safe to create automatically.
 *   a DROP costs a Wednesday. At one post a week the drop count IS the campaign length.
 *
 * So this auto-creates the seed and never the drop, for three reasons: `in` does not
 * mean "gets a Wednesday" (an idea may be the promo hook on every post, or a paragraph
 * inside another one); arc order would end up following click order rather than
 * campaign order; and because these buttons toggle, auto-create paired with auto-delete
 * would silently bin a drop whose title, story and promo hook had already been written.
 *
 * Leaving `in` therefore clears the seed — which is safe, because an auto-seed holds no
 * authored content — but never touches the arc. It warns instead. Making Ernest decide
 * is what the workshop is for; auto-creating quietly decides.
 */
export function setVerdict(b: Board, ideaId: string, person: Person, verdict: Verdict): string[] {
  const idea = b.ideas.find((i) => i.id === ideaId);
  if (!idea) return [`no idea with id ${ideaId}`];
  const warnings: string[] = [];

  // The buttons toggle: clicking the verdict an idea already has clears it.
  const next: Verdict = idea.v[person] === verdict ? null : verdict;
  idea.v = { ...idea.v, [person]: next };

  // Katrina's column is input. It never moves placement, which is Ernest's to decide.
  if (person !== "E") return warnings;

  const hasDrop = b.arc.some((d) => (d.ref ?? "").includes(ideaId));
  if (next === "in") {
    // placedIn counts as landed (Round 2 §9) — don't shove an idea that already lives
    // inside another drop back into the seed bank.
    if (!hasDrop && !idea.placedIn && idea.placed !== "seed") {
      idea.placed = "seed";
      warnings.push(`${ideaId} went to the seed bank — add a drop, or write the seam that holds it, if it belongs somewhere else.`);
    }
  } else if (idea.placed === "seed") {
    idea.placed = null;
  }

  if (next !== "in" && hasDrop) {
    warnings.push(`${ideaId} still has a drop in the arc. Nothing was removed — take it out there if that is what you mean.`);
  }
  if (next !== "in" && idea.placedIn) {
    // Authored content, like a drop — never auto-deleted, only pointed at.
    warnings.push(`${ideaId} is still marked as living inside ${idea.placedIn.ref}. Clear that yourself if it no longer does.`);
  }
  return warnings;
}

/* ------------------------------------------------------------------ normalise */

let seq = 0;
export function newId(prefix = "b"): string {
  seq += 1;
  return `${prefix}${Date.now().toString(36)}${seq.toString(36)}`;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

/** A cadence survives normalise only if its shape is real; junk becomes null, loudly absent. */
function normaliseCadence(c: unknown): Cadence | null {
  if (!c || typeof c !== "object") return null;
  const raw = c as Partial<Cadence>;
  const days = Array.isArray(raw.days)
    ? raw.days.filter((d): d is Weekday => (WEEKDAYS as readonly string[]).includes(d))
    : [];
  if (!days.length) return null;
  const out: Cadence = { days, start: typeof raw.start === "string" ? raw.start : "" };
  if (typeof raw.everyWeeks === "number" && raw.everyWeeks >= 1) out.everyWeeks = Math.floor(raw.everyWeeks);
  if (typeof raw.note === "string" && raw.note) out.note = raw.note;
  return out;
}

/** The human-readable line a cadence renders to — what the strip used to hold as free text. */
export function cadenceLine(c: Cadence | null): string {
  if (!c) return "not set";
  const every = (c.everyWeeks ?? 1) > 1 ? `every ${c.everyWeeks} weeks` : "weekly";
  const from = c.start ? ` from ${c.start}` : " — not yet dated";
  return `${c.days.join(" · ")}, ${every}${from}${c.note ? ` (${c.note})` : ""}`;
}

export function normalise(b: Partial<Board> & { id?: string }): Board {
  const kind = b.kind === "channel" ? "channel" : "campaign";
  const out: Board = {
    // Spread first so a field this app doesn't know about yet — the way `strip`
    // arrived before its type did — survives a load/save cycle instead of being
    // silently dropped. Every field below is re-asserted explicitly and wins over
    // the spread; this only preserves what normalise has no opinion about.
    ...(b as Board),
    id: b.id ?? newId(),
    kind,
    name: b.name ?? "Untitled",
    tagline: b.tagline ?? "",
    stage: b.stage ?? "spark",
    channels: Array.isArray(b.channels) ? b.channels : ["Blog"],
    strip: Array.isArray(b.strip) ? b.strip : [],
    token: typeof b.token === "string" ? b.token : "",
    contentPrefix: typeof b.contentPrefix === "string" ? b.contentPrefix : "",
    cadence: normaliseCadence(b.cadence),
    seams: Array.isArray(b.seams) ? b.seams : [],
    roles: Array.isArray(b.roles) ? b.roles : [],
    ideas: Array.isArray(b.ideas) ? b.ideas : [],
    arc: Array.isArray(b.arc) ? b.arc : [],
    gate: Array.isArray(b.gate) ? b.gate : [],
    sourcePath: b.sourcePath,
  };
  out.ideas = out.ideas.map((i) => ({
    // Same reasoning as above, at idea level — a field like a future "priority" tag
    // added by the skill before this app knows about it must not vanish on save.
    ...i,
    cover: typeof i.cover === "string" ? i.cover : "",
    yt: i.yt === true,
    placed: i.placed === "seed" ? "seed" : null,
    placedIn:
      i.placedIn && typeof i.placedIn.ref === "string" && i.placedIn.ref.trim()
        ? { ref: i.placedIn.ref, role: typeof i.placedIn.role === "string" ? i.placedIn.role : "" }
        : null,
    v: { E: i.v?.E ?? null, K: i.v?.K ?? null },
    n: { E: i.n?.E ?? "", K: i.n?.K ?? "" },
  }));
  // Backfill blocking AFTER any merge, or an item added later blocks by accident.
  out.gate = out.gate.map((g) => ({ ...g, blocking: g.blocking ?? g.o !== "K" }));
  return out;
}

export function blankBoard(name: string, kind: Board["kind"]): Board {
  return normalise({
    id: newId(kind === "channel" ? "ch" : "cm"),
    kind,
    name: name || "Untitled",
    stage: "spark",
    channels: kind === "channel" ? [] : ["Blog"],
    gate: kindOf(kind).starterGate(),
  });
}

/* ------------------------------------------------------------------ the nudge */

export function nudge(b: Board): [string, string] {
  const k = kindOf(b.kind);
  if (b.stage === "archived")
    return [
      "Archived.",
      "This one has left the workshop — the committed folder is its home now. It's kept only as a starting point: duplicate it to begin something new.",
    ];

  const dec = b.ideas.filter(decided).length;
  const flag = b.ideas.filter(flagged).length;
  const waiting = b.ideas.filter((i) => !decided(i) && i.v.K).length;
  const blockers = openBlockers(b);
  const optional = openOptional(b);
  const s = (n: number) => (n === 1 ? "" : "s");
  const aside = flag
    ? `  ${flag} card${s(flag)} Katrina sees differently — worth a read, not a blocker.`
    : "";

  if (!b.ideas.length)
    return ["Empty bench.", `Put ${k.benchNoun} down before anything else — a board with no bench has nothing to cut.`];
  if (b.ideas.length < 4)
    return ["Still a spark.", `${b.ideas.length} ${k.benchNoun} down. Keep adding; the ${k.arcNoun}s and the gate can wait until there's something to choose between.`];
  if (!dec)
    return ["Nothing decided yet.", `${b.ideas.length} ${k.benchNoun} on the bench. Your call is what moves them — Katrina's input is welcome whenever it turns up, and never needed to proceed.${aside}`];
  if (dec < b.ideas.length)
    return [
      `${b.ideas.length - dec} still undecided.`,
      `You've called ${dec} of ${b.ideas.length}.${waiting ? `  ${waiting} already ${waiting === 1 ? "has" : "have"} Katrina's input.` : ""}${aside}`,
    ];
  if (!b.arc.length)
    return ["Bench is called, nothing ordered yet.", `Start arranging the ins into ${k.arcNoun}s.${aside}`];
  if (blockers)
    return [
      `${blockers} thing${s(blockers)} left on the gate.`,
      `Every unticked line is a way this goes out wrong.${optional ? `  ${optional} more ${optional === 1 ? "is" : "are"} marked optional — they don't hold you up.` : ""}`,
    ];
  if (optional)
    return ["Gate is clear on your side.", `${optional} optional item${s(optional)} still open — none blocking. Ship when you want.`];
  return ["Gate is clear.", "This one is ready to leave the workshop. Export the plan and file it."];
}

/* ------------------------------------------------------------------ export */

const VERDICT_MD: Record<string, string> = { in: "IN", hold: "NOT YET", cut: "CUT" };
const WHO: Record<string, string> = { E: "Ernest", K: "Katrina", both: "both" };

export const slug = (s: string): string =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);

export function toMarkdown(b: Board, today: string): string {
  const k = kindOf(b.kind);
  const L: string[] = [];
  L.push("---", "tags:", "  - type/campaign-plan", "  - status/draft", "  - topic/marketing",
    "company: PaperClipAi Backoffice Company", "account: ernestofgaia.xyz",
    `kind: ${b.kind}`, `board: "${b.name.replace(/"/g, "'")}"`, `stage: ${b.stage}`,
    `channels: [${b.channels.join(", ")}]`, `updated: ${today}`, "draft: workshop", "---", "");
  L.push(`# ${b.name}`, "");
  L.push("**WORKSHOP OUTPUT — not committed.** Every verdict below is a real click, not a");
  L.push("recommendation. **Decisions are Ernest's** — Katrina's column is input: welcome");
  L.push("whenever it arrives, never required, never blocking.", "");
  if (b.tagline) L.push(b.tagline, "");

  if (b.token || b.contentPrefix || b.cadence) {
    // Vault-side detail is allowed in full (intentions live in the vault; promises live
    // in published copy) — but cadence stays marked internal per rule 11.
    L.push("## Commitment", "");
    if (b.token) L.push(`- **UTM:** \`utm_campaign=${b.token}\`${b.contentPrefix ? ` · \`utm_content=${b.contentPrefix}-NN\` by arc position` : ""}`);
    if (b.cadence) L.push(`- **Cadence (internal only — rule 11):** ${cadenceLine(b.cadence)}`);
    L.push("");
  }

  if (b.seams.length) {
    L.push("## Seams — open, flagged not hidden", "");
    b.seams.forEach((s) => L.push(`- **${s.tag.toUpperCase()} — ${s.h}** — ${s.p}`));
    L.push("");
  }

  if (b.arc.length) {
    L.push(`## ${k.arcTitle}`, "");
    b.arc.forEach((d, i) => {
      L.push(`### ${k.arcNoun.replace(/^./, (c) => c.toUpperCase())} ${i + 1} — “${d.title}”${d.ref ? `  *(${d.ref})*` : ""}`);
      if (d.story) L.push(`- **${k.fields.story}:** ${d.story}`);
      if (d.track) L.push(`- **${k.fields.track}:** \`${d.track}\``);
      if (d.songs) L.push(`- **${k.fields.songs}:** ${d.songs}`);
      if (d.promo) L.push(`- **${k.fields.promo}:** ${d.promo}`);
      if (d.note) L.push(`- **${k.fields.note}:** ${d.note}`);
      L.push("");
    });
  }

  if (b.ideas.length) {
    L.push("## The bench", "");
    const pl = checkPlacement(b);
    if (pl.rows.length) {
      L.push(`**${pl.rows.length} IN** — ${pl.placed.length} placed, ${pl.placedInside.length} inside other drops, ` +
        `${pl.seeded.length} in the seed bank, ${pl.heldBySeam.length} held by a seam, ${pl.violations.length} unaccounted for.`, "");
      if (pl.violations.length) {
        L.push(`> ⚠️ ${pl.violations.map((v) => v.id).join(", ")} — marked IN but landing nowhere. Each needs a drop, a seed, or a seam that says why.`, "");
      }
    }
    L.push("| ID | Item | Decision | Katrina (input) | Note |", "|---|---|---|---|---|");
    b.ideas.forEach((i) => {
      const d = decided(i);
      const note = !d && i.v.K ? "her input in, awaiting Ernest"
        : !d ? "undecided"
        : flagged(i) ? "**Katrina differs — advisory**" : "";
      L.push(`| ${i.id} | ${i.title} | ${VERDICT_MD[d ?? ""] ?? "—"} | ${VERDICT_MD[i.v.K ?? ""] ?? "—"} | ${note} |`);
    });
    L.push("");
    b.ideas.forEach((i) => {
      L.push(`### ${i.id} — ${i.title}  \`${i.tag}\`${i.yt ? "  · **YT seed**" : ""}`, "", i.story, "");
      if (i.asset) L.push(`- **Asset:** \`${i.asset}\``);
      if (i.cover) L.push(`- **Cover seed:** ${i.cover}`);
      if (i.proves) L.push(`- **Proves:** ${i.proves}`);
      if (i.v.E === "in") {
        const p = placement(i, b);
        L.push(`- **Placement:** ${
          p === "drop" ? "has a drop in the arc"
          : p === "placedIn" ? `inside ${i.placedIn!.ref}${i.placedIn!.role ? ` — ${i.placedIn!.role}` : ""}`
          : p === "seed" ? "seed bank"
          : "**UNPLACED** — needs a drop, a seed, or a seam"}`);
      }
      if (i.n.E) L.push(`- **Ernest:** ${i.n.E}`);
      if (i.n.K) L.push(`- **Katrina:** ${i.n.K}`);
      L.push("");
    });
  }

  if (b.roles.length) {
    L.push("## Assets on hand", "", "| File | Role | Where | Why |", "|---|---|---|---|");
    b.roles.forEach((r) => L.push(`| \`${r.f}\` | ${r.role} | ${r.pl} | ${r.why} |`));
    L.push("");
  }

  if (b.gate.length) {
    L.push("## Commit gate", "");
    b.gate.forEach((g) =>
      L.push(`- [${g.d ? "x" : " "}] **${g.t}** — *${WHO[g.o] ?? g.o}*${blocks(g) ? "" : " *(optional — does not block)*"}${g.n ? ` — ${g.n}` : ""}`));
    L.push("");
  }

  L.push("## Rules inherited (binding on every draft)", "");
  L.push("Ernest is they/them · Katrina is she/her · sole approval gate, edits = approval ·");
  L.push("scheduled-state only, never publish-now · no hype vocabulary, small numbers stay small ·");
  L.push("AI tools named specifically (Claude, ChatGPT, Google AI) · never invent prices or costs ·");
  L.push("contact hierarchy only in designated CTAs · `seo_title` ≤ 42 characters · #ernestGoesToAI.");
  /**
   * Derived per campaign, never hardcoded. The mockup printed the music rules into
   * every export, so the Last Mile plan — which ships no tracks and claims no lineage —
   * carried a disclosure rule belonging to a different campaign entirely.
   */
  if (b.ideas.some((i) => ["music", "av", "both"].includes(i.tag))) {
    L.push("Tracks disclosed as AI-generated · lineage credited as kinship, not membership.");
  }
  L.push("");
  return L.join("\n");
}

/* ------------------------------------------------------------------ merge */

/**
 * Fold someone else's board in. Your own column is never overwritten — only theirs,
 * plus anything you don't have yet.
 */
export function mergeBoard(mine: Board, theirs: Board, me: Person, takeText: boolean): number {
  const other: Person = me === "E" ? "K" : "E";
  let changed = 0;
  const byId = new Map(mine.ideas.map((i) => [i.id, i]));
  theirs.ideas.forEach((ti) => {
    const local = byId.get(ti.id);
    if (!local) { mine.ideas.push(ti); changed += 1; return; }
    if (ti.v?.[other] !== undefined && ti.v[other] !== local.v[other]) { local.v[other] = ti.v[other]; changed += 1; }
    if (ti.n?.[other] && ti.n[other] !== local.n[other]) { local.n[other] = ti.n[other]; changed += 1; }
    if (takeText) {
      // Text they may have written, including the cover seed. `yt` and `placed` are
      // deliberately absent: those are Ernest's editorial calls, not prose, and
      // `placed` is governed by the placement rule — a merge must never set it.
      (["title", "story", "asset", "proves", "tag", "cover"] as const).forEach((f) => {
        if (ti[f] && ti[f] !== local[f]) { local[f] = ti[f]; changed += 1; }
      });
    }
  });
  if (takeText) {
    mine.name = theirs.name; mine.tagline = theirs.tagline; mine.stage = theirs.stage;
    mine.arc = theirs.arc; mine.gate = theirs.gate; mine.seams = theirs.seams; mine.roles = theirs.roles;
    mine.strip = theirs.strip;
  } else {
    theirs.gate.forEach((g, i) => {
      if (mine.gate[i] && g.d && !mine.gate[i].d) { mine.gate[i].d = true; changed += 1; }
    });
  }
  return changed;
}

export function emptyWorkspace(): Workspace {
  const b = blankBoard("Untitled campaign", "campaign");
  return { version: 3, identity: "E", activeId: b.id, campaigns: [b] };
}
