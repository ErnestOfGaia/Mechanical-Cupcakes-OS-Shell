import type { BoardKind, GateItem } from "./types";

/**
 * ONE APP, TWO KINDS — the answer to "should channel strategy be its own app?".
 *
 * It should not. A campaign board and a channel board share every structural piece:
 * a library of boards, a bench of candidates with verdicts, an ordered middle section,
 * a commit gate, an export, and the trade-boards merge. Only the middle section's
 * vocabulary differs. Building a second app would clone all of that machinery, and
 * the two copies would drift the week after — the same failure the vault has already
 * seen with duplicated notes.
 *
 * It also matches Ernest's own taxonomy, where Campaign and Channel are two first-class
 * things in one department, not two departments. And as a product, "a strategy workshop
 * with pluggable board types" sells to a small business far better than two half-tools.
 */

export interface KindSpec {
  label: string;
  /** Plural noun for the library picker. */
  plural: string;
  /** What the bench holds for this kind. */
  benchNoun: string;
  benchBlurb: string;
  /** The ordered middle section. */
  arcTitle: string;
  arcNoun: string;
  arcBlurb: string;
  /** Labels for the five entry fields — the only thing that actually differs. */
  fields: {
    story: string;
    track: string;
    songs: string;
    promo: string;
    note: string;
  };
  /**
   * Where a NEW board of this kind is filed in the vault, relative to the root.
   *
   * ⚠️ Coupled to `CONTENT_ROOTS` in `lib/vault.ts` — that list is what the *scanner*
   * accepts, this is what the *writer* uses. They must name the same folder or new
   * boards land somewhere the scan will never look. Kept as a literal here because
   * this module is client-safe and `vault.ts` is server-only; the 2026-08-09 reorg
   * broke both at once, which is exactly why the coupling is written down.
   */
  vaultDir: string;
  starterGate: () => GateItem[];
}

const UNIVERSAL: GateItem[] = [
  { t: "No hype vocabulary, small numbers stay small, no invented costs", o: "both", d: false, blocking: true, n: "Standing rules, binding on every draft." },
  { t: "Ernest is they/them, Katrina is she/her — carried into every prompt that composes prose", o: "both", d: false, blocking: true, n: "Removing he/him from sources isn't enough; models invent it." },
  { t: "AI tools named specifically — Claude, ChatGPT, Google AI", o: "E", d: false, blocking: true, n: "" },
  { t: "Contact hierarchy only in designated CTAs", o: "E", d: false, blocking: true, n: "Text first, email second, discovery call third." },
];

export const KINDS: Record<BoardKind, KindSpec> = {
  campaign: {
    label: "Campaign",
    plural: "Campaigns",
    benchNoun: "ideas",
    benchBlurb:
      "Everything the material can carry. Deliberately over-supplied — cutting is easier than generating, and slack is what makes a verdict mean something.",
    arcTitle: "The arc",
    arcNoun: "drop",
    arcBlurb:
      "The campaign's shape over time. Each drop is one post, its asset, and one promo hook.",
    fields: {
      story: "Story",
      track: "Production track",
      songs: "Secondary assets",
      promo: "Promo hook",
      note: "Watch out for",
    },
    vaultDir: "Campaign, Channels, & Content/0 Potential Campaigns",
    starterGate: () => [
      { t: "Queue position agreed against the campaigns already committed", o: "both", d: false, blocking: true, n: "" },
      { t: "Every post has an seo_title of 42 characters or fewer", o: "E", d: false, blocking: true, n: "The layout appends the brand suffix." },
      // 2026-08-09 UTM ruling: eog-launch-2026 is CLOSED to new links. One campaign,
      // one token; minting it and declaring it in the register are the same act.
      { t: "UTM minted and declared — a per-campaign utm_campaign token + utm_content prefix, in the register", o: "E", d: false, blocking: true, n: "One campaign, one token. The token register (weekly analytics digest skill) is its single home." },
      ...UNIVERSAL.map((g) => ({ ...g })),
    ],
  },

  channel: {
    label: "Channel strategy",
    plural: "Channels",
    benchNoun: "formats",
    benchBlurb:
      "Post formats and angles this channel could run. Same discipline as a campaign bench: over-supply, then cut. A format nobody will sustain is worse than one fewer format.",
    arcTitle: "The rhythm",
    arcNoun: "slot",
    arcBlurb:
      "What this channel actually does in a normal week. Slots, not a calendar — the point is a rhythm that survives a bad week at the restaurant.",
    fields: {
      story: "What runs in this slot",
      track: "Source material",
      songs: "Format",
      promo: "Hook pattern",
      note: "Watch out for",
    },
    vaultDir: "Campaign, Channels, & Content",
    starterGate: () => [
      { t: "Draft DNA written for this platform — voice, length, formatting", o: "E", d: false, blocking: true, n: "DNA never copies between platforms." },
      { t: "Cadence is one Ernest can hold on a restaurant week", o: "E", d: false, blocking: true, n: "A cadence promise is a commitment and commitments don't drift." },
      { t: "Cadence NOT announced publicly until it has held twice", o: "E", d: false, blocking: true, n: "Ship before announcing." },
      { t: "Mechanics written down — the runbook, not just the intent", o: "E", d: false, blocking: true, n: "If a step can't be drawn it can't be trusted." },
      { t: "Measurement decided — what would tell you this channel is working", o: "E", d: false, blocking: true, n: "Zero sessions means investigate the tags, not shrug." },
      ...UNIVERSAL.map((g) => ({ ...g })),
    ],
  },
};

export const kindOf = (k: BoardKind | undefined): KindSpec => KINDS[k ?? "campaign"];
