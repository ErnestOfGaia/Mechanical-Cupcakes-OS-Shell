/**
 * Merge rules for the one-time 2026-08-03 migration.
 *
 * This lives in lib/ rather than in the script because the rules are subtle enough to
 * need tests: they decide which of two versions of a real campaign survives, and the
 * losing side is not recoverable from the board file afterwards.
 */
import { normalise } from "./board";
import type { Board, Idea, Seam } from "./types";

export interface Diff {
  field: string;
  disk: string;
  fixture: string;
  outcome: string;
  /** True when neither side contains the other — a real fork a human should see. */
  diverged?: boolean;
}

export interface TextPick {
  take: "disk" | "backup";
  why: string;
  diverged: boolean;
}

/**
 * Which of two versions of the same text to keep.
 *
 * Neither file is simply "newer" in the way that matters. The backup is a snapshot of
 * the artifact at 20:47 and carries things Ernest typed there — a YouTube thought, a
 * security-audit worry, a joke. The disk copy was rewritten by the skill at 21:42 and
 * carries three seams the backup never had. Taking either side wholesale throws away
 * real work.
 *
 * So: when one version contains the other it is an addition, and the fuller one wins
 * whichever file it came from. When the two genuinely fork — a real rewrite, like
 * IDEA-13's title — nothing can decide that automatically, so the later text is kept
 * and the difference is flagged. Nothing is lost either way: the migration never
 * modifies the backup file, so the version not taken is still on disk.
 */
export function pickText(diskText: string, backupText: string): TextPick {
  const d = (diskText ?? "").trim();
  const b = (backupText ?? "").trim();
  if (d === b) return { take: "disk", why: "identical", diverged: false };
  if (!b) return { take: "disk", why: "backup is empty", diverged: false };
  if (!d) return { take: "backup", why: "disk is empty", diverged: false };
  if (b.includes(d)) return { take: "backup", why: "backup is the disk text plus more", diverged: false };
  if (d.includes(b)) return { take: "disk", why: "disk is the backup text plus more", diverged: false };
  return { take: "disk", why: "⚠️ REWRITTEN — kept the later text; the other is still in the backup file", diverged: true };
}

const short = (v: unknown, n = 60): string => {
  if (v === undefined || v === null) return "—";
  const s = typeof v === "string" ? v : JSON.stringify(v);
  return s.length > n ? `${s.slice(0, n)}…` : s;
};

const VERDICT = (v: unknown): string => (v === null || v === undefined ? "—" : String(v));

export const countsOf = (b: Board) => ({
  ideas: b.ideas.length,
  in: b.ideas.filter((i) => i.v.E === "in").length,
  hold: b.ideas.filter((i) => i.v.E === "hold").length,
  cut: b.ideas.filter((i) => i.v.E === "cut").length,
  undecided: b.ideas.filter((i) => i.v.E === null).length,
  k: b.ideas.filter((i) => i.v.K).length,
  seams: b.seams.length,
  arc: b.arc.length,
  gate: b.gate.length,
  strip: b.strip.length,
});

export type Counts = ReturnType<typeof countsOf>;

/**
 * Merge one campaign. The backup's verdicts are authoritative because the disk copy
 * came back blank; seams are unioned because both sides wrote real ones; text takes
 * whichever side is fuller. Every decision lands in `diffs` — nothing is silent.
 */
export function mergeForMigration(disk: Board, fixture: Board): { merged: Board; diffs: Diff[] } {
  const diffs: Diff[] = [];
  const merged: Board = normalise({ ...disk });

  for (const f of ["name", "tagline", "stage"] as const) {
    if (disk[f] !== fixture[f]) {
      const pick = f === "stage" ? { take: "backup" as const, why: "backup wins", diverged: false } : pickText(String(disk[f]), String(fixture[f]));
      diffs.push({ field: f, disk: short(disk[f]), fixture: short(fixture[f]), outcome: `${pick.take} wins — ${pick.why}`, diverged: pick.diverged });
      if (pick.take === "backup") (merged[f] as string) = fixture[f] as string;
    }
  }

  // Channels: union. Dropping one silently un-plans a channel.
  const channels = [...new Set([...disk.channels, ...fixture.channels])];
  if (JSON.stringify(channels) !== JSON.stringify(disk.channels)) {
    diffs.push({ field: "channels", disk: short(disk.channels), fixture: short(fixture.channels), outcome: `union → ${short(channels)}` });
  }
  merged.channels = channels;

  if (JSON.stringify(disk.strip) !== JSON.stringify(fixture.strip)) {
    diffs.push({
      field: "strip", disk: `${disk.strip.length} rows`, fixture: `${fixture.strip.length} rows`,
      outcome: disk.strip.length ? "disk wins (written later by the skill)" : "backup wins (disk had none)",
    });
  }
  merged.strip = disk.strip.length ? disk.strip : fixture.strip;

  const diskById = new Map(disk.ideas.map((i) => [i.id, i]));
  const fixById = new Map(fixture.ideas.map((i) => [i.id, i]));
  const mergedIdeas: Idea[] = [];

  for (const d of disk.ideas) {
    const f = fixById.get(d.id);
    if (!f) {
      diffs.push({ field: `idea ${d.id}`, disk: short(d.title), fixture: "absent", outcome: "kept — only on disk" });
      mergedIdeas.push(d);
      continue;
    }
    const out: Idea = { ...d };

    // Verdicts: the backup is the ONLY record of what was decided — the disk copy was
    // regenerated by the skill and came back blank. This is the migration's whole point.
    for (const p of ["E", "K"] as const) {
      if (d.v[p] === f.v[p]) continue;
      diffs.push({
        field: `idea ${d.id} · verdict ${p}`, disk: VERDICT(d.v[p]), fixture: VERDICT(f.v[p]),
        outcome: f.v[p] !== null ? "backup wins — it holds the decision" : "kept disk (backup undecided)",
      });
      if (f.v[p] !== null) out.v = { ...out.v, [p]: f.v[p] };
    }

    for (const p of ["E", "K"] as const) {
      if ((d.n[p] ?? "") === (f.n[p] ?? "")) continue;
      const pick = pickText(d.n[p] ?? "", f.n[p] ?? "");
      diffs.push({
        field: `idea ${d.id} · note ${p}`, disk: short(d.n[p] || "—", 40), fixture: short(f.n[p] || "—", 40),
        outcome: `${pick.take} wins — ${pick.why}`, diverged: pick.diverged,
      });
      if (pick.take === "backup") out.n = { ...out.n, [p]: f.n[p] };
    }

    for (const t of ["title", "story", "asset", "proves", "tag", "cover"] as const) {
      if (d[t] === f[t]) continue;
      const pick = pickText((d[t] as string) ?? "", (f[t] as string) ?? "");
      diffs.push({
        field: `idea ${d.id} · ${t}`, disk: short(d[t], 40), fixture: short(f[t], 40),
        outcome: `${pick.take} wins — ${pick.why}`, diverged: pick.diverged,
      });
      if (pick.take === "backup") (out[t] as string) = f[t] as string;
    }
    mergedIdeas.push(out);
  }

  for (const f of fixture.ideas) {
    if (diskById.has(f.id)) continue;
    diffs.push({ field: `idea ${f.id}`, disk: "absent", fixture: short(f.title), outcome: "added from backup" });
    mergedIdeas.push(f);
  }
  merged.ideas = mergedIdeas;

  // Seams: unioned on heading. Both sides wrote seams the other never saw.
  const seams: Seam[] = [];
  const byHeading = new Map<string, Seam>();
  for (const s of disk.seams) { byHeading.set(s.h, s); seams.push(s); }
  for (const s of fixture.seams) {
    const existing = byHeading.get(s.h);
    if (!existing) {
      diffs.push({ field: `seam "${short(s.h, 44)}"`, disk: "absent", fixture: "present", outcome: "added from backup" });
      seams.push(s);
      byHeading.set(s.h, s);
      continue;
    }
    if (existing.p !== s.p || existing.tag !== s.tag) {
      diffs.push({ field: `seam "${short(s.h, 44)}"`, disk: short(existing.tag), fixture: short(s.tag), outcome: "backup wins on body/tag" });
      Object.assign(existing, s);
    }
  }
  merged.seams = seams;

  for (const f of ["arc", "gate", "roles"] as const) {
    const d = disk[f] as unknown[];
    const x = fixture[f] as unknown[];
    if (JSON.stringify(d) === JSON.stringify(x)) continue;
    const backupWins = x.length >= d.length;
    diffs.push({
      field: f, disk: `${d.length} rows`, fixture: `${x.length} rows`,
      outcome: backupWins ? "backup wins" : "disk wins (more rows)",
    });
    (merged[f] as unknown[]) = backupWins ? x : d;
  }

  return { merged: normalise(merged), diffs };
}
