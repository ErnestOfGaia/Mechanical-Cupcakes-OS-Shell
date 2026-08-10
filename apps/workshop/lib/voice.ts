/**
 * The voice gate (Round 2 §8) — warn-first, at the export boundary.
 *
 * The Workshop is a content-authoring surface, and its export shipped six misgenderings
 * of Ernest into `Campaign Plan.md` — the single most explicit rule in the department
 * ("Ernest is they/them in every drafted post, bio and prompt") did not survive the app
 * boundary. The blog path has a lint gate before any network call; the Workshop had
 * nothing.
 *
 * This is the cheap, honest version: scan the generated markdown for masculine pronouns
 * and SAY SO, listing lines. It is deliberately WARN-FIRST, not blocking — the blog's
 * own gate (`ernests-voice`) is warn-first until the corpus grows, and a Workshop gate
 * stricter than the blog gate would be the tail wagging the dog.
 *
 * ⚠️ Fail-capable, both ways. A campaign gate row itself contains "he/him" as an
 * EXAMPLE ("absence of he/him in source text is not sufficient — state the rule
 * explicitly"), so a naive regex would flag the rule that bans the thing it flags.
 * Metalinguistic mentions — "he/him", "he-him", quoted pronoun pairs — are skipped by
 * inspecting the characters around the match, and there is a test proving both that
 * real misgendering fires and that the rule text does not.
 */

export interface VoiceHit {
  /** 1-based line number in the text that was checked. */
  line: number;
  /** The matched word, as written. */
  match: string;
  /** The whole line, trimmed, so the warning shows context rather than a number. */
  text: string;
}

const MASCULINE = /\b(he|him|his|himself)\b/gi;

/**
 * True when the match is language ABOUT pronouns rather than a pronoun in use:
 * "he/him", "he-him", "him/his" — a slash or hyphen hard against either side.
 */
function metalinguistic(line: string, start: number, end: number): boolean {
  const before = start > 0 ? line[start - 1] : "";
  const after = end < line.length ? line[end] : "";
  return before === "/" || before === "-" || after === "/" || after === "-";
}

/** Scan exported text for masculine pronouns. Empty result = nothing to warn about. */
export function pronounCheck(text: string): VoiceHit[] {
  const hits: VoiceHit[] = [];
  const lines = text.split(/\r?\n/);
  lines.forEach((line, idx) => {
    for (const m of line.matchAll(MASCULINE)) {
      const start = m.index ?? 0;
      if (metalinguistic(line, start, start + m[0].length)) continue;
      hits.push({ line: idx + 1, match: m[0], text: line.trim() });
    }
  });
  return hits;
}

/** The warning block prepended to tool output / shown in the UI. Null when clean. */
export function voiceWarning(text: string): string | null {
  const hits = pronounCheck(text);
  if (!hits.length) return null;
  const L = [
    `⚠️ VOICE GATE — ${hits.length} masculine pronoun${hits.length === 1 ? "" : "s"} in this export. ` +
      `Ernest is they/them; check each line (warn-first — the export is not blocked):`,
  ];
  for (const h of hits.slice(0, 12)) L.push(`  line ${h.line}: "${h.text.slice(0, 90)}"`);
  if (hits.length > 12) L.push(`  … and ${hits.length - 12} more`);
  return L.join("\n");
}
