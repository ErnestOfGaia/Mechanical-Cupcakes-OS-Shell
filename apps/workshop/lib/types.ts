/**
 * Board shape — deliberately identical to the Campaign Workshop artifact's export,
 * with `kind` added. A board.json written by the artifact loads here unchanged, and
 * one written here loads there. Two copies of an idea always diverge; one schema
 * shared by both surfaces is how that is prevented.
 */

export type BoardKind = "campaign" | "channel";

/** Spark → Shaping → Ready are workshop states. Archived means it has left. */
export type Stage = "spark" | "shaping" | "ready" | "archived";

/** Ernest's call. Katrina may mirror it as advice; hers never decides. */
export type Verdict = "in" | "hold" | "cut" | null;

export type Person = "E" | "K";

export type Weekday = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

/**
 * A campaign's posting rhythm, typed. The strip carried this as free text
 * ("Cadence = Weekly — Wednesday, 9:00 AM Pacific") and it went stale silently — on
 * 2026-08-09 a strip still advertised a first drop four days in the past. Typed, it can
 * be computed with (the §5.8 month projection is "committed campaigns × cadence × slot
 * rules") and staleness is detectable. The free-text strip row renders FROM this.
 *
 * ⚠️ Internal-only (rule 11): a cadence is an intention until the rate has been
 * demonstrated. It may appear in vault docs in full; never in published copy.
 */
export interface Cadence {
  /** Which days a drop lands, e.g. ["Wed"] or ["Tue", "Wed", "Thu"]. */
  days: Weekday[];
  /** ISO date (YYYY-MM-DD) of the first drop. Empty string = not yet dated. */
  start: string;
  /** 1 = weekly (default), 2 = every second week, … */
  everyWeeks?: number;
  /** Free-text qualifier. Rendered beside the computed line, never parsed. */
  note?: string;
}

/**
 * A row in the board's header fact strip (cadence, first drop, anchor asset — whatever
 * the campaign needs stated up top). `flag` marks a fact that is still unresolved, the
 * same "unresolved, not hidden" spirit as a seam.
 */
export interface StripRow {
  k: string;
  v: string;
  flag?: boolean;
}

export interface Idea {
  id: string;
  tag: string;
  title: string;
  story: string;
  asset: string;
  proves: string;
  /** v.E decides. v.K is input — welcome, optional, never blocking. */
  v: Record<Person, Verdict>;
  n: Record<Person, string>;
  /** Image-generation seed for the idea's cover. Never a figure, never a third-party
   *  mark — the placeholder text carries that rule; this field just holds what Ernest
   *  writes. */
  cover: string;
  /** Flags a bench idea as good YouTube material (e.g. a screen-recording demo) without
   *  claiming YouTube as a channel for the whole campaign. */
  yt: boolean;
  /**
   * Where an `in` idea landed when it did not get its own arc slot. Only the SEED case
   * is stored here — an idea placed in the arc is discoverable by scanning `arc[].ref`,
   * so a "drop" status is derived, never duplicated. See lib/rule.ts.
   */
  placed: "seed" | null;
  /**
   * The third landing place (Round 2 §9): the idea ships INSIDE another drop or idea in
   * THIS campaign — a recurring frame, a paragraph, an opening. Not a drop (no slot of
   * its own) and not a seed (it did not go back to the bank). Without this the rule
   * reads such ideas as unplaced forever, and a nudge that cries wolf gets ignored.
   * `ref` names the idea or drop it lives in; `role` says what it does there
   * (frame · paragraph · opening · promo hook — free text).
   */
  placedIn: { ref: string; role: string } | null;
}

/**
 * One ordered entry in the middle section. A campaign calls these "drops"; a channel
 * calls them "slots". The fields are the same five because the *shape* of the thinking
 * is the same — only the labels differ, and those come from the kind (see kinds.ts).
 */
export interface Entry {
  slot: string;
  ref: string;
  title: string;
  story: string;
  track: string;
  songs: string;
  promo: string;
  note: string;
}

export interface GateItem {
  t: string;
  o: Person | "both";
  d: boolean;
  /** Katrina-owned items default false: her availability never holds a board. */
  blocking?: boolean;
  n: string;
}

export interface Seam {
  tag: string;
  cls: string;
  h: string;
  p: string;
}

export interface AssetRow {
  f: string;
  role: string;
  pl: string;
  why: string;
}

export interface Board {
  id: string;
  kind: BoardKind;
  name: string;
  tagline: string;
  stage: Stage;
  channels: string[];
  /** The header fact strip. Real boards have carried this since before the app's own
   *  types did — it was silently dropped on every save until it was added here. */
  strip: StripRow[];
  /**
   * Commitment fields (Round 2 §10). The Workshop is the commitment gate — it approves
   * a campaign AND its cadence — and per AGENTS - Marketing rule 10(d), minting a UTM
   * token and declaring it are the same act. Two campaigns sharing a token is
   * unrecoverable, so the token gets a typed home instead of living in a gate row's
   * prose (where the stale eog-launch-2026 text sat until 2026-08-09).
   *
   * `token` — the utm_campaign value: lowercase kebab, ≤24 chars, no underscores.
   * `contentPrefix` — the utm_content prefix; posts are `<prefix>-NN` by arc position.
   * The single home for the declared-token REGISTER is the weekly analytics digest
   * skill — the board holds only its own token, never the table.
   */
  token: string;
  contentPrefix: string;
  cadence: Cadence | null;
  seams: Seam[];
  roles: AssetRow[];
  ideas: Idea[];
  arc: Entry[];
  gate: GateItem[];
  /** Set by the vault adapter so a save knows where it came from. Never invented. */
  sourcePath?: string;
  /**
   * The file's modified time when this board was read. Carried back on save so the
   * vault can refuse to overwrite an edit the caller never saw — the app and the MCP
   * server can both be writing. Transport only: never written into the file, and
   * ignored when comparing two boards (see lib/compare.ts).
   */
  mtimeMs?: number;
}

export interface Workspace {
  version: 3;
  identity: Person;
  activeId: string;
  showArchived?: boolean;
  /** Key kept as `campaigns` for artifact compatibility; holds boards of both kinds. */
  campaigns: Board[];
}
