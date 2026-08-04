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
  seams: Seam[];
  roles: AssetRow[];
  ideas: Idea[];
  arc: Entry[];
  gate: GateItem[];
  /** Set by the vault adapter so a save knows where it came from. Never invented. */
  sourcePath?: string;
}

export interface Workspace {
  version: 3;
  identity: Person;
  activeId: string;
  showArchived?: boolean;
  /** Key kept as `campaigns` for artifact compatibility; holds boards of both kinds. */
  campaigns: Board[];
}
