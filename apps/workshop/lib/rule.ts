/**
 * Ernest's placement rule, 2026-08-03.
 *
 *   An idea marked `in` must produce a drop or a seed. If it produces neither, a SEAM
 *   must say why — not a note. If there is no seam-worthy reason, it was a `hold`.
 *
 * The rule exists because `in` had come to mean two different things — "I like this"
 * and "this ships" — which is how the Last Mile board reached nine INs against five
 * drops without anyone noticing. Under the rule the three verdicts stop overlapping:
 *
 *   cut  = no
 *   hold = yes, but not now or not here
 *   in   = yes, AND it lands somewhere
 *
 * The payoff in practice was not catching orphans. It was forcing every reason-not-to-
 * place out of the note field and into the seams list — a note is a comment, invisible
 * to the seams list, the gate, the meters and to Katrina; a seam is tracked and gets
 * resolved.
 */
import type { Board, Idea } from "./types";

/**
 * Every idea id named anywhere in the seams.
 *
 * ⚠️ Seams write runs of ids in shorthand: "IDEA-06/07/08" names THREE ideas, not one.
 * The first version of this check used a plain substring match, found only IDEA-06, and
 * reported the other two as violations — which would have had Ernest writing seams for
 * ideas that already had one. Expand every run into explicit ids, then match exactly:
 * a substring test would also let "IDEA-1" match "IDEA-10".
 */
export function namedInText(text: string): Set<string> {
  const named = new Set<string>();
  for (const m of text.matchAll(/IDEA-(\d{2})((?:\/\d{2})*)/g)) {
    named.add(`IDEA-${m[1]}`);
    for (const n of (m[2] || "").split("/").filter(Boolean)) named.add(`IDEA-${n}`);
  }
  return named;
}

const seamText = (b: Board): string => b.seams.map((s) => `${s.h} ${s.p}`).join(" ");

/** Ids the arc refers to, expanded the same way — an arc ref can be a run too. */
export function placedInArc(b: Board): Set<string> {
  const ids = new Set<string>();
  for (const d of b.arc) {
    const refs = namedInText(d.ref ?? "");
    if (refs.size) refs.forEach((r) => ids.add(r));
    else if (d.ref?.trim()) ids.add(d.ref.trim());
  }
  return ids;
}

export type Placement = "drop" | "seed" | "placedIn" | null;

/**
 * Where an idea landed. A drop is DERIVED from the arc rather than stored, so the two
 * can never disagree; the seed and the inside-another-post cases are stored fields.
 * Round 2 §9 added the third landing place: an idea can ship INSIDE a drop — a frame,
 * a paragraph, an opening — which is placed, not dropped, and not back in the bank.
 */
export function placement(idea: Idea, b: Board): Placement {
  if (placedInArc(b).has(idea.id)) return "drop";
  if (idea.placedIn) return "placedIn";
  return idea.placed === "seed" ? "seed" : null;
}

/**
 * Phrases that mean "this is blocked" but were typed into a note instead of a seam.
 * Advisory only — this cannot be exhaustive and is not meant to be. It exists to point
 * at the specific failure the rule was written to catch.
 */
const NOTE_BLOCKER = /VERIFY FIRST|needs its own conversation|NOT SHIPPED|before it becomes a post/i;

export interface RuleRow {
  id: string;
  title: string;
  hasDrop: boolean;
  seeded: boolean;
  /** Set when the idea lives inside another drop/idea — "IDEA-04 · frame". */
  insideRef: string;
  insideRole: string;
  heldBySeam: boolean;
  noteBlocker: boolean;
  /** The note itself, so a report can show WHY rather than only that there is a why. */
  noteText: string;
  state: "placed" | "placed-in" | "seeded" | "held" | "hidden" | "violation";
}

export interface RuleResult {
  rows: RuleRow[];
  violations: RuleRow[];
  heldBySeam: RuleRow[];
  noteBlockers: RuleRow[];
  placed: RuleRow[];
  placedInside: RuleRow[];
  seeded: RuleRow[];
  /** True when every `in` idea is accounted for. */
  ok: boolean;
}

export function checkPlacement(b: Board): RuleResult {
  const inArc = placedInArc(b);
  const named = namedInText(seamText(b));

  const rows: RuleRow[] = b.ideas
    .filter((i) => i.v.E === "in")
    .map((i) => {
      const hasDrop = inArc.has(i.id);
      const inside = i.placedIn;
      const seeded = i.placed === "seed";
      const heldBySeam = named.has(i.id);
      const noteText = i.n.E ?? "";
      const noteBlocker = NOTE_BLOCKER.test(noteText);
      const state: RuleRow["state"] = hasDrop ? "placed"
        : inside ? "placed-in"
        : seeded ? "seeded"
        : heldBySeam ? "held"
        : noteBlocker ? "hidden"
        : "violation";
      return {
        id: i.id, title: i.title, hasDrop, seeded,
        insideRef: inside?.ref ?? "", insideRole: inside?.role ?? "",
        heldBySeam, noteBlocker, noteText, state,
      };
    });

  const by = (s: RuleRow["state"]) => rows.filter((r) => r.state === s);
  const violations = by("violation");
  return {
    rows,
    violations,
    heldBySeam: by("held"),
    noteBlockers: by("hidden"),
    placed: by("placed"),
    placedInside: by("placed-in"),
    seeded: by("seeded"),
    ok: violations.length === 0,
  };
}

/**
 * The rule's verdict on a single idea, for per-card display. Held-by-a-seam is a real
 * state, not a failure — labelling it "unplaced" would read as a problem the board does
 * not have, and would push Ernest to re-solve something already tracked.
 */
export function stateOf(ideaId: string, b: Board): RuleRow["state"] | null {
  return checkPlacement(b).rows.find((r) => r.id === ideaId)?.state ?? null;
}

/** One line for the nudge banner, or null when there is nothing to say. */
export function placementNudge(b: Board): string | null {
  const r = checkPlacement(b);
  if (!r.violations.length) return null;
  const ids = r.violations.map((v) => v.id).join(", ");
  const n = r.violations.length;
  return `${n} idea${n === 1 ? " is" : "s are"} IN but unplaced — ${ids}. Add a drop, send to the bank, or write the seam.`;
}

/** The advisory second line: blockers written in a note, where nothing tracks them. */
export function noteBlockerNudge(b: Board): string | null {
  const r = checkPlacement(b);
  if (!r.noteBlockers.length) return null;
  const ids = r.noteBlockers.map((v) => v.id).join(", ");
  return `${ids} ${r.noteBlockers.length === 1 ? "has its" : "have their"} blocker in a NOTE, not a seam — a note is invisible to the seams list, the gate and to Katrina. Promote it.`;
}

/**
 * A plain-text report, the CLI shape of the original checker — with both of its display
 * bugs fixed: the hidden-blocker list prints the note it is talking about (the original
 * read a property the rows never had, so it always printed an empty string), and it
 * prints that list once rather than twice.
 */
export function formatPlacementReport(b: Board): string {
  const r = checkPlacement(b);
  const L: string[] = [];
  L.push("ERNEST'S RULE — an IN idea must produce a drop or a seed, unless a seam holds it");
  L.push("");
  if (!r.rows.length) L.push("  (no ideas are marked IN)");
  for (const row of r.rows) {
    const verdict = row.state === "placed" ? "OK   -> has a drop"
      : row.state === "placed-in" ? `OK   -> inside ${row.insideRef}${row.insideRole ? ` (${row.insideRole})` : ""}`
      : row.state === "seeded" ? "OK   -> in the seed bank"
      : row.state === "held" ? "HELD -> a seam names it"
      : row.state === "hidden" ? "HIDDEN -> blocker is in the NOTE, not a seam"
      : "****  VIOLATION: no drop, no seed, no seam";
    // padEnd alone does not TRUNCATE, so a long "inside X (role…)" verdict used to run
    // straight into the title with no gap. Clip, then pad.
    L.push(`  ${row.id.padEnd(9)}${verdict.slice(0, 44).padEnd(46)}${row.title.slice(0, 46)}`);
  }
  if (r.noteBlockers.length) {
    L.push("");
    L.push("BLOCKERS HIDING IN NOTES — promote each of these to a seam:");
    for (const row of r.noteBlockers) L.push(`   ${row.id} — ${row.noteText}`);
  }
  L.push("");
  L.push(`${r.rows.length} IN  ·  ${r.placed.length} placed  ·  ${r.placedInside.length} inside other drops  ·  ` +
    `${r.seeded.length} seeded  ·  ${r.heldBySeam.length} held by a seam  ·  ${r.violations.length} unaccounted for`);
  if (r.violations.length) {
    L.push("");
    L.push("Each of these needs one of three things:");
    for (const row of r.violations) {
      L.push(`   ${row.id} — add a drop, send it to the seed bank, or write the seam that holds it`);
    }
  }
  return L.join("\n");
}
