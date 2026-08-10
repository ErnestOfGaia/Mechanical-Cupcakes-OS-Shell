/**
 * The month-view PROJECTION (Strategy - Campaign Content §5.8, ruled 2026-08-07):
 *
 *   "what would the month look like if I commit this campaign at this cadence?"
 *   — computed from committed campaigns × cadence × slot rules, needing NO live
 *   integrations, because it is arithmetic on data the Workshop already holds.
 *
 * ⚖️ Deliberately NOT the reality view (what is actually approved and scheduled across
 * blog + Postiz + the manual channels — live reads, explicitly deferred: "it can stay a
 * generated vault doc until something forces it live"). And deliberately not Seasonal
 * Sprint Work, which the 2026-08-09 interview separated into strategic business
 * planning with a memory-holdable constraint — research-gated, not built.
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
  kind: "drop" | "promo" | "stream";
  campaign: string;
  label: string;
  /** e.g. "⏳ CONDITIONAL" — carried from the slot text, never interpreted. */
  qualifier?: string;
  /** Which data produced it, so a surprising item can be traced. */
  source: "arc-date" | "cadence" | "stream";
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
  return iso(new Date(Date.UTC(yearHint, month, day)));
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

/** Every date of `cadence` that falls inside [from, to), anchored on its start date. */
export function cadenceDates(c: Cadence, from: Date, to: Date): string[] {
  if (!c.start || !/^\d{4}-\d{2}-\d{2}$/.test(c.start)) return [];
  const start = new Date(`${c.start}T00:00:00Z`);
  if (Number.isNaN(start.getTime())) return [];
  const every = Math.max(1, c.everyWeeks ?? 1);
  const out: string[] = [];

  // Walk day by day; a date belongs to the cadence when its weekday is listed and its
  // week distance from the start week is a multiple of everyWeeks.
  const startWeek = Math.floor(start.getTime() / (7 * 86_400_000));
  for (let t = new Date(from); t < to; t = new Date(t.getTime() + 86_400_000)) {
    if (t < start) continue;
    const weekday = (Object.keys(DAY_TO_INDEX) as Weekday[]).find((d) => DAY_TO_INDEX[d] === t.getUTCDay())!;
    if (!c.days.includes(weekday)) continue;
    const week = Math.floor(t.getTime() / (7 * 86_400_000));
    if ((week - startWeek) % every !== 0) continue;
    out.push(iso(t));
  }
  return out;
}

/* ------------------------------------------------------------------ projection */

/**
 * Project one month. Sources, in order of authority:
 *   1. DATED ARC SLOTS — a date written on a drop is a decision; it always wins.
 *   2. TYPED CADENCE — projects future drops for boards whose arc is undated. When a
 *      board has BOTH, cadence fills only dates the arc doesn't already claim.
 *   3. STANDING STREAMS — fixed-weekday ones only.
 * Every blog-channel item generates its LinkedIn promo when the campaign declares
 * LinkedIn — that is the rule the collision check exists to run.
 */
export function projectMonth(boards: Board[], month: string): MonthProjection {
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
    const claimed = new Set<string>();

    b.arc.forEach((d) => {
      const when = parseSlotDate(d.slot ?? "", y);
      if (when) claimed.add(when);
      if (inMonth(when)) {
        items.push({
          date: when, channel: isBlog ? "Blog" : b.channels[0] ?? "—", kind: "drop",
          campaign: b.name, label: `${d.slot?.split("—")[0]?.trim() || "Drop"} · ${d.title}`,
          qualifier: slotQualifier(d.slot ?? ""), source: "arc-date",
        });
        if (promo && isBlog) {
          items.push({
            date: when, channel: SLOT_RULES.promoChannel, kind: "promo",
            campaign: b.name, label: `promo ${SLOT_RULES.promoTime} · ${d.title}`, source: "arc-date",
          });
        }
      } else if (!when && (d.ref || d.title !== "Untitled")) {
        undated.push({ campaign: b.name, label: d.slot || d.title, why: "no parseable date in the slot text" });
      }
    });

    if (b.cadence) {
      for (const when of cadenceDates(b.cadence, from, to)) {
        if (claimed.has(when)) continue; // an authored drop date beats a projected one
        items.push({
          date: when, channel: isBlog ? "Blog" : b.channels[0] ?? "—", kind: "drop",
          campaign: b.name, label: `projected (${cadenceKey(b.cadence)})`, source: "cadence",
        });
        if (promo && isBlog) {
          items.push({
            date: when, channel: SLOT_RULES.promoChannel, kind: "promo",
            campaign: b.name, label: `promo ${SLOT_RULES.promoTime} (projected)`, source: "cadence",
          });
        }
      }
    } else if (!b.arc.some((d) => parseSlotDate(d.slot ?? "", y)) && b.arc.length) {
      undated.push({ campaign: b.name, label: `${b.arc.length} drops`, why: "no typed cadence and no dated slots — set the cadence to project it" });
    }
  }

  for (const s of STANDING_STREAMS) {
    if (!s.day) continue;
    for (let t = new Date(from); t < to; t = new Date(t.getTime() + 86_400_000)) {
      if (t.getUTCDay() === DAY_TO_INDEX[s.day]) {
        items.push({ date: iso(t), channel: s.channel, kind: "stream", campaign: s.label, label: s.label, source: "stream" });
      }
    }
  }

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

  return { month, items, collisions, undated };
}

const cadenceKey = (c: Cadence): string =>
  `${c.days.join("/")}${(c.everyWeeks ?? 1) > 1 ? ` ×${c.everyWeeks}wk` : ""}`;

/** Plain-text rendering, for the MCP tool and for tests to read like a human would. */
export function formatMonth(p: MonthProjection): string {
  const L: string[] = [];
  L.push(`MONTH PROJECTION — ${p.month}  (arithmetic on board data; not the reality view)`);
  L.push("");
  if (!p.items.length) L.push("  (nothing lands this month)");
  let lastDate = "";
  for (const it of p.items) {
    const day = it.date === lastDate ? "          " : it.date;
    lastDate = it.date;
    L.push(`  ${day}  ${it.channel.padEnd(9)} ${it.kind.padEnd(6)} ${it.campaign} — ${it.label}${it.qualifier ? `  ${it.qualifier}` : ""}`);
  }
  if (p.collisions.length) {
    L.push("");
    L.push(`⚠️ ${p.collisions.length} CHANNEL COLLISION${p.collisions.length === 1 ? "" : "S"} — two things on one channel on one day:`);
    for (const c of p.collisions) {
      L.push(`  ${c.date} on ${c.channel}: ${c.items.map((i) => `${i.campaign} (${i.kind})`).join("  +  ")}`);
    }
  }
  if (p.undated.length) {
    L.push("");
    L.push("NOT PLACED — no date to place them on (never guessed):");
    for (const u of p.undated) L.push(`  ${u.campaign} — ${u.label}: ${u.why}`);
  }
  return L.join("\n");
}
