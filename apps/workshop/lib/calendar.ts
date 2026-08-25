/**
 * The month-view PROJECTION (Strategy - Campaign Content §5.8, ruled 2026-08-07):
 *
 *   "what would the month look like if I commit this campaign at this cadence?"
 *   — computed from committed campaigns × cadence × slot rules, needing NO live
 *   integrations, because it is arithmetic on data the Workshop already holds.
 *
 * ⚖️ The projection was deliberately NOT the reality view — live reads were explicitly
 * deferred: "it can stay a generated vault doc until something forces it live."
 *
 * 🔴 SOMETHING FORCED IT, 2026-08-09. The projection said Tue 11 Aug 10:30 was the Penny
 * Post's LinkedIn slot. In Postiz that slot was already held by the MCOS Last Mile promo,
 * and the projection could not know: it reasons from board cadence, and the MCOS promo
 * lives in Postiz and in no board's arc. The collision was caught by querying Postiz by
 * hand — exactly the check §5.8 says this calendar exists to run. A projection that
 * reports "no collision" because it cannot see half the channel is worse than no check.
 *
 * So the calendar now takes an OPTIONAL reality layer: scheduled posts read from Postiz,
 * passed in as plain data. ⚖️ The split that keeps this file honest — everything here is
 * still pure functions, no fetch and no fs; the caller does the reading. See `Reality`.
 *
 * And deliberately still not Seasonal Sprint Work, which the 2026-08-09 interview
 * separated into strategic business planning with a memory-holdable constraint —
 * research-gated, not built.
 *
 * The projection's first real job (quoted in both Strategy §5.8 and AGENTS -
 * Marketing): Wednesday's blog post generates a LinkedIn promo at 10:30, and any other
 * LinkedIn item the same day is a CHANNEL collision — invisible to blog admin and to
 * Postiz separately, visible here.
 *
 * Everything here is pure functions over Board[] — no fetch, no fs.
 */
import type { Board, Cadence, Weekday } from "./types";

/* ------------------------------------------------------------------ slot rules */

/**
 * The slot rules, as data with citations. These are the department's standing
 * decisions, not this app's inventions — change them when the docs change.
 */
export const SLOT_RULES = {
  /** "Tue / Wed / Thu, 3 posts/week … the three weekly slots are BLOG slots" (M4b, 2026-08-03). */
  blogDays: ["Tue", "Wed", "Thu"] as Weekday[],
  blogTime: "9:00 AM PT",
  /** "LinkedIn promo (10:30 PT)" — 90 minutes after the blog cron (Ernest, 2026-07-29). */
  promoTime: "10:30 AM PT",
  /** Promo rides only when LinkedIn is one of the campaign's channels. */
  promoChannel: "LinkedIn",
} as const;

/**
 * Standing streams post OUTSIDE the blog slots and never compete for them — but they
 * DO consume channel attention, which is where the real collisions live. Only streams
 * with a fixed weekday are projectable; supply-driven streams without one are listed
 * in the legend, not placed on days.
 *
 * ⚠️ Deliberately short. The Xcom concept-of-the-week is drafted Sundays by
 * claude-weekly-review and POSTED MANUALLY whenever Ernest posts it — a draft-supply
 * rate, not a posting day — so projecting it onto a day would be the calendar
 * inventing a schedule nobody promised.
 */
export interface StandingStream {
  label: string;
  channel: string;
  day: Weekday | null;
  note: string;
}

export const STANDING_STREAMS: StandingStream[] = [
  { label: "Xcom concept of the week", channel: "X", day: null, note: "drafted Sundays; posted manually — supply rate, not a schedule" },
];

/* ------------------------------------------------------------------ items */

export interface CalendarItem {
  /** ISO date YYYY-MM-DD. */
  date: string;
  channel: string;
  kind: "drop" | "promo" | "stream" | "scheduled";
  campaign: string;
  label: string;
  /** e.g. "⏳ CONDITIONAL" — carried from the slot text, never interpreted. */
  qualifier?: string;
  /** Which data produced it, so a surprising item can be traced. */
  source: "arc-date" | "cadence" | "stream" | "postiz";
  /** Postiz post id — present only on `source: "postiz"` items, so one can be pulled. */
  postId?: string;
}

/* ------------------------------------------------------------------ reality layer */

/**
 * One post that ACTUALLY exists in Postiz. Plain data: this file never fetches it.
 * The caller (the MCP tool, an API route) reads Postiz and hands the rows in.
 */
export interface ScheduledPost {
  /** Postiz `publishDate`, an ISO-8601 UTC instant. Converted to a PT day here. */
  publishDate: string;
  /** Provider id as Postiz reports it — "linkedin", "x", "youtube". */
  provider: string;
  /** QUEUE | PUBLISHED | ERROR | DRAFT. */
  state: string;
  id: string;
  /** Full post text; only the first line is shown. */
  content: string;
}

/**
 * The result of trying to read reality. ⚠️ `ok: false` is NOT the same as "nothing
 * scheduled" and must never render as an empty, reassuring calendar — a silent failure
 * here would report "no collision" on a day that has one, which is the exact defect
 * this layer was added to catch.
 */
export interface Reality {
  ok: boolean;
  posts: ScheduledPost[];
  /** Why the read failed. Rendered loudly when `ok` is false. */
  error?: string;
}

/** Postiz provider id → the channel names the boards and slot rules use. */
export const PROVIDER_TO_CHANNEL: Record<string, string> = {
  linkedin: "LinkedIn",
  x: "X",
  youtube: "YouTube",
  mastodon: "Mastodon",
  threads: "Threads",
};

/**
 * Postiz stores UTC instants; the whole department reasons in Pacific ("10:30 AM PT").
 * A post at 2026-08-12T02:00Z is 7 PM PT on the 11th — bucketing it by its UTC date
 * would put it on the wrong day and miss a real collision. Uses the IANA zone rather
 * than a fixed offset so it stays correct across the PDT/PST boundary.
 */
const PT_DAY = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Los_Angeles",
  year: "numeric", month: "2-digit", day: "2-digit",
});
const PT_TIME = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Los_Angeles",
  hour: "numeric", minute: "2-digit", hour12: true,
});

/** ISO-8601 UTC instant → "YYYY-MM-DD" in Pacific time. Empty string if unparseable. */
export function ptDay(utcIso: string): string {
  const d = new Date(utcIso);
  if (Number.isNaN(d.getTime())) return "";
  return PT_DAY.format(d);
}

/** ISO-8601 UTC instant → "2:30 PM PT". */
export function ptTime(utcIso: string): string {
  const d = new Date(utcIso);
  if (Number.isNaN(d.getTime())) return "";
  return `${PT_TIME.format(d)} PT`;
}

/** First line of a post, trimmed for a calendar row. */
export function postSummary(content: string, max = 58): string {
  const first = (content ?? "").split("\n").find((l) => l.trim()) ?? "";
  const t = first.trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

/** Scheduled Postiz rows → calendar items, for the month asked for. */
export function scheduledItems(posts: ScheduledPost[], month: string): CalendarItem[] {
  return posts
    .filter((p) => p.state !== "DRAFT")
    .map((p) => {
      const date = ptDay(p.publishDate);
      return {
        date,
        channel: PROVIDER_TO_CHANNEL[p.provider] ?? p.provider,
        kind: "scheduled" as const,
        campaign: p.state === "PUBLISHED" ? "PUBLISHED" : "in Postiz",
        label: `${ptTime(p.publishDate)} · ${postSummary(p.content)}`,
        source: "postiz" as const,
        postId: p.id,
      };
    })
    .filter((i) => i.date.startsWith(month));
}

export interface UndatedNote {
  campaign: string;
  label: string;
  why: string;
}

export interface Collision {
  date: string;
  channel: string;
  items: CalendarItem[];
}

export interface MonthProjection {
  /** "YYYY-MM". */
  month: string;
  items: CalendarItem[];
  collisions: Collision[];
  /** What could NOT be placed, listed rather than guessed — silence would read as "free". */
  undated: UndatedNote[];
  /**
   * Whether the Postiz reality layer was merged in. `false` means the calendar is
   * projection-only and its collision list is INCOMPLETE — rendered loudly, never
   * silently, because a quiet fallback reports a free slot that is actually taken.
   */
  reality: { ok: boolean; error?: string; count: number };
}

/* ------------------------------------------------------------------ date helpers */

const DAY_TO_INDEX: Record<Weekday, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
const MONTHS: Record<string, number> = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };

const iso = (d: Date): string =>
  `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;

/**
 * Parse a date out of arc-slot free text — "Drop 1 — Wed 12 Aug", "Tue 11 Aug, 9:00 AM
 * PT", "Drop 5 — Thu 20 Aug ⏳ CONDITIONAL". Best-effort and honest: no match returns
 * null and the item goes to the undated list; it is never guessed onto a day.
 * The year comes from the projection's month, adjusted only when the resulting date
 * would be wildly far from it (a December slot viewed in January).
 */
export function parseSlotDate(slot: string, yearHint: number): string | null {
  const m = /\b(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)?\s*(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/.exec(slot);
  if (!m) return null;
  const day = Number(m[1]);
  const month = MONTHS[m[2]];
  if (day < 1 || day > 31) return null;
  const d = new Date(Date.UTC(yearHint, month, day));
  // `Date.UTC(2026, 1, 31)` does not fail — it rolls forward to 3 Mar. A slot that
  // says "31 Feb" is a typo, and answering it with a real-looking March date is worse
  // than answering nothing: the drop lands on a day nobody chose. Reject the rollover.
  if (d.getUTCMonth() !== month || d.getUTCDate() !== day) return null;
  return iso(d);
}

/**
 * The date of one drop. The typed `date` field is the answer whenever it is set.
 *
 * The `slot` fallback exists only for boards written before 2026-08-24, when the date
 * lived in the label's free text — `normalise()` lifts those into `date` on read, so
 * this branch is a safety net for a board that reaches the calendar unnormalised, not
 * a second source of truth. It is the branch that loses the year; the typed one cannot.
 */
export function entryDate(d: { date?: string; slot?: string }, yearHint: number): string | null {
  if (d.date && /^\d{4}-\d{2}-\d{2}$/.test(d.date)) return d.date;
  return parseSlotDate(d.slot ?? "", yearHint);
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

/** "2026-08-11" → "Tue 11 Aug", the shape real slots already use. */
export function formatSlotDate(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return "";
  return `${DAY_NAMES[d.getUTCDay()]} ${d.getUTCDate()} ${MONTH_NAMES[d.getUTCMonth()]}`;
}

/**
 * Put a date INTO a slot string without disturbing anything else in it.
 *
 * The date is not a field of its own — it lives inside free text like
 * `"Drop 1 — Tue 11 Aug, 9:00 AM PT"`, and the calendar reads it back out. So a date
 * picker has to edit that string surgically: replace the date where one exists, append
 * where none does, and leave the label, the time and any ⏳ qualifier untouched. The
 * weekday is always recomputed rather than carried, or moving Tue 11 → 12 Aug would
 * leave a slot that says "Tue 12 Aug" and disagrees with the calendar it feeds.
 *
 * Passing an empty date removes the date and leaves the rest of the label.
 */
export function withSlotDate(slot: string, isoDate: string): string {
  const existing = /\b(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)?\s*\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/;
  const label = (slot ?? "").trim();

  if (!isoDate) {
    if (!existing.test(label)) return label;
    // Drop the date and any now-dangling separator or empty time fragment.
    return label.replace(existing, "").replace(/\s*—\s*,?\s*/g, " — ").replace(/—\s*$/, "").replace(/\s{2,}/g, " ").trim().replace(/[—,]\s*$/, "").trim();
  }

  const stamp = formatSlotDate(isoDate);
  if (!stamp) return label;
  if (existing.test(label)) return label.replace(existing, stamp);
  return label ? `${label} — ${stamp}` : stamp;
}

/** The ⏳/⚠️ tail of a slot string, kept verbatim so the calendar never re-judges it. */
export function slotQualifier(slot: string): string | undefined {
  const m = /(⏳[^—·]*|⚠️[^—·]*)\s*$/u.exec(slot);
  return m ? m[1].trim() : undefined;
}

/**
 * Every date of `cadence` that falls inside [from, to), anchored on its start date.
 *
 * ⚖️ 2026-08-24: this NO LONGER FEEDS THE CALENDAR. A cadence is a stated intention
 * (rule 11, and the thing the commitment gate approves) — it is not permission to put
 * drops on days Ernest never picked. `projectMonth` places typed drop dates only.
 * Kept, and kept correct, because the cadence itself is still a record on the board.
 */
export function cadenceDates(c: Cadence, from: Date, to: Date): string[] {
  if (!c.start || !/^\d{4}-\d{2}-\d{2}$/.test(c.start)) return [];
  const start = new Date(`${c.start}T00:00:00Z`);
  if (Number.isNaN(start.getTime())) return [];
  const every = Math.max(1, c.everyWeeks ?? 1);
  const out: string[] = [];

  // Walk day by day; a date belongs to the cadence when its weekday is listed and its
  // week distance from the start week is a multiple of everyWeeks.
  //
  // Weeks are counted from the MONDAY on or before the start date. Bucketing by
  // `time / 7 days` instead counts from the epoch, which was a Thursday: a Tue/Wed/Thu
  // fortnightly cadence starting Tue 4 Aug then had Thursday fall in the *next* bucket
  // and drop out, projecting Tue 4, Wed 5, Thu 13 — a week split down the middle.
  const startWeekMonday = mondayOf(start);
  for (let t = new Date(from); t < to; t = new Date(t.getTime() + 86_400_000)) {
    if (t < start) continue;
    const weekday = (Object.keys(DAY_TO_INDEX) as Weekday[]).find((d) => DAY_TO_INDEX[d] === t.getUTCDay())!;
    if (!c.days.includes(weekday)) continue;
    const week = Math.round((mondayOf(t) - startWeekMonday) / (7 * 86_400_000));
    if (week % every !== 0) continue;
    out.push(iso(t));
  }
  return out;
}

/** Epoch ms of the Monday on or before `d` — the start of the week `d` belongs to. */
function mondayOf(d: Date): number {
  const back = (d.getUTCDay() + 6) % 7; // Mon=0 … Sun=6
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - back);
}

/* ------------------------------------------------------------------ projection */

/**
 * Project one month. Sources:
 *   1. DATED DROPS — the `date` Ernest assigned while reviewing the arc. The only
 *      thing that puts a campaign on a day.
 *   2. STANDING STREAMS — fixed-weekday ones only.
 *   3. REALITY — what is actually in Postiz, when the caller could read it.
 *
 * ⚖️ CADENCE IS NOT A SOURCE (ruled 2026-08-24). It used to generate `source: "cadence"`
 * drops for any board whose arc was undated, so a board inherited a schedule from a rate
 * it had merely stated — Ernest read that, correctly, as the app forcing a cadence rule
 * on him. An undated drop is now listed as undated. A drop lands on a day because
 * somebody put it there.
 *
 * Every blog-channel item generates its LinkedIn promo when the campaign declares
 * LinkedIn — that is the rule the collision check exists to run.
 */
export function projectMonth(boards: Board[], month: string, reality?: Reality): MonthProjection {
  const [y, mo] = month.split("-").map(Number);
  const from = new Date(Date.UTC(y, mo - 1, 1));
  const to = new Date(Date.UTC(y, mo, 1));
  const items: CalendarItem[] = [];
  const undated: UndatedNote[] = [];

  const inMonth = (d: string | null): d is string => !!d && d >= iso(from) && d < iso(to);

  for (const b of boards) {
    if (b.stage === "archived") continue;
    const isBlog = b.channels.includes("Blog");
    const promo = b.channels.includes(SLOT_RULES.promoChannel);

    b.arc.forEach((d) => {
      const when = entryDate(d, y);
      if (inMonth(when)) {
        items.push({
          date: when, channel: isBlog ? "Blog" : b.channels[0] ?? "—", kind: "drop",
          campaign: b.name, label: `${dropLabel(d)} · ${d.title}`,
          qualifier: slotQualifier(d.slot ?? ""), source: "arc-date",
        });
        if (promo && isBlog) {
          items.push({
            date: when, channel: SLOT_RULES.promoChannel, kind: "promo",
            campaign: b.name, label: `promo ${SLOT_RULES.promoTime} · ${d.title}`, source: "arc-date",
          });
        }
      } else if (!when && (d.ref || d.title !== "Untitled")) {
        undated.push({ campaign: b.name, label: dropLabel(d) || d.title, why: "no date assigned yet — set it on the drop" });
      }
    });
  }

  for (const s of STANDING_STREAMS) {
    if (!s.day) continue;
    for (let t = new Date(from); t < to; t = new Date(t.getTime() + 86_400_000)) {
      if (t.getUTCDay() === DAY_TO_INDEX[s.day]) {
        items.push({ date: iso(t), channel: s.channel, kind: "stream", campaign: s.label, label: s.label, source: "stream" });
      }
    }
  }

  // The reality layer, merged before collisions are computed — that ordering IS the
  // feature. Projected-vs-projected clashes were always visible; the one that shipped
  // wrong was projected-vs-actually-scheduled.
  const real = reality?.ok ? scheduledItems(reality.posts, month) : [];
  items.push(...real);

  items.sort((a, b2) => a.date.localeCompare(b2.date) || a.channel.localeCompare(b2.channel));

  // The §5.8 check: more than one item on the same CHANNEL on the same DAY.
  const byKey = new Map<string, CalendarItem[]>();
  for (const it of items) {
    const k = `${it.date}|${it.channel}`;
    byKey.set(k, [...(byKey.get(k) ?? []), it]);
  }
  const collisions: Collision[] = [...byKey.entries()]
    .filter(([, list]) => list.length > 1)
    .map(([k, list]) => ({ date: k.split("|")[0], channel: k.split("|")[1], items: list }));

  return {
    month, items, collisions, undated,
    reality: { ok: !!reality?.ok, error: reality?.error, count: real.length },
  };
}

/**
 * The drop's label for a calendar row. Slots are plain labels now ("Drop 1"), but a
 * pre-2026-08-24 board may still read through here with a date in its text, so the
 * leading segment is taken and the date stripped rather than shown twice.
 */
const dropLabel = (d: { slot?: string; date?: string }): string =>
  withSlotDate(d.slot?.split("·")[0]?.trim() || "Drop", "");

/** Plain-text rendering, for the MCP tool and for tests to read like a human would. */
export function formatMonth(p: MonthProjection): string {
  const L: string[] = [];
  L.push(
    p.reality.ok
      ? `MONTH — ${p.month}  (board projection ● merged with ${p.reality.count} post(s) actually in Postiz)`
      : `MONTH PROJECTION — ${p.month}  (arithmetic on board data; not the reality view)`,
  );

  // Loud, first, and impossible to skim past. A projection-only calendar cannot see
  // anything scheduled outside a board's arc, so its "no collision" means nothing.
  if (!p.reality.ok) {
    L.push("");
    L.push("⛔ REALITY LAYER UNAVAILABLE — this is a PROJECTION ONLY.");
    L.push(`   ${p.reality.error ?? "Postiz could not be read."}`);
    L.push("   Anything scheduled in Postiz but not written on a board is INVISIBLE here,");
    L.push("   so the collision list below is incomplete. Do not read a free slot as free.");
  }

  L.push("");
  if (!p.items.length) L.push("  (nothing lands this month)");
  let lastDate = "";
  for (const it of p.items) {
    const day = it.date === lastDate ? "          " : it.date;
    lastDate = it.date;
    // ● is real, · is projected. One glance has to separate them.
    const mark = it.source === "postiz" ? "●" : "·";
    L.push(`  ${day} ${mark} ${it.channel.padEnd(9)} ${it.kind.padEnd(9)} ${it.campaign} — ${it.label}${it.qualifier ? `  ${it.qualifier}` : ""}`);
  }
  if (p.collisions.length) {
    L.push("");
    L.push(`⚠️ ${p.collisions.length} CHANNEL COLLISION${p.collisions.length === 1 ? "" : "S"} — two things on one channel on one day:`);
    for (const c of p.collisions) {
      const real = c.items.filter((i) => i.source === "postiz").length;
      const tag = real && real < c.items.length ? "  ← projected vs ACTUALLY SCHEDULED" : real ? "  ← both already in Postiz" : "";
      L.push(`  ${c.date} on ${c.channel}: ${c.items.map((i) => `${i.campaign} (${i.kind})`).join("  +  ")}${tag}`);
      for (const i of c.items.filter((x) => x.postId)) L.push(`      postiz id=${i.postId} — pull with: postiz posts:delete ${i.postId}`);
    }
  }
  if (p.undated.length) {
    L.push("");
    L.push("NOT PLACED — no date to place them on (never guessed):");
    for (const u of p.undated) L.push(`  ${u.campaign} — ${u.label}: ${u.why}`);
  }
  return L.join("\n");
}
