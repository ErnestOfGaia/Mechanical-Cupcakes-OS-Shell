/**
 * ONE-TIME MIGRATION — the 2026-08-03 workspace backup onto the boards on disk.
 *
 * Why this exists. The browser mockup held the only live copy of nine verdicts and
 * Katrina's single call, in one browser's localStorage. Its backup button could not
 * actually write a file, so `_workshop-backups/workshop-2026-08-03.json` is not a test
 * fixture — it is the payload, and the handoff is explicit that import has to be
 * lossless before anything else gets built on top of it.
 *
 * Meanwhile the campaign-workshop skill rewrote the Last Mile board.json on disk at
 * 21:42, AFTER that backup was taken at 20:47. So neither side is a superset:
 *
 *   disk    — 15 seams (3 the backup has never seen), and ZERO verdicts
 *   backup  — 12 seams, all 9 IN verdicts, and Katrina's IDEA-02
 *
 * An overwrite in either direction loses real work, so this merges, and it shows its
 * working before it is allowed to touch anything.
 *
 *   npx tsx scripts/migrate.ts            report only — writes nothing
 *   npx tsx scripts/migrate.ts --write    after Ernest has read the report
 *
 * Requires WORKSHOP_VAULT_ROOT and WORKSHOP_VAULT_WRITE=1 (read from .env.local).
 */
import fs from "node:fs";
import path from "node:path";
import { normalise } from "../lib/board";
import { countsOf, mergeForMigration, type Counts } from "../lib/migrate-merge";
import { listBoards, saveBoard, vaultStatus } from "../lib/vault";
import type { Board, Workspace } from "../lib/types";

/* ------------------------------------------------------------------ env */

/** Load WORKSHOP_* vars from .env.local without adding a dotenv dependency. */
function loadEnvLocal(): void {
  const file = path.join(import.meta.dirname, "..", ".env.local");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = /^\s*(WORKSHOP_[A-Z_]+)\s*=\s*(.*?)\s*$/.exec(line);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

/* ------------------------------------------------------------------ mapping */

/**
 * Explicit, not discovered. A migration that guesses which file a campaign belongs to
 * is a migration that can put nine verdicts in the wrong folder, so an id that is not
 * on this list stops the run.
 */
const MAPPING: Record<string, string> = {
  "last-mile-value-propositions":
    "Campaign Content/01 Committed Blog Campaigns 2026-W30/02 NEXT -Last Mile Value Propositions Campaign/board.json",
  "av-unfinished-loop":
    "Campaign Content/Potential Campaigns/The Unfinished Loop/board.json",
};

/* ------------------------------------------------------------------ report */

const short = (v: unknown, n = 60): string => {
  if (v === undefined || v === null) return "—";
  const t = typeof v === "string" ? v : JSON.stringify(v);
  return t.length > n ? `${t.slice(0, n)}…` : t;
};

const VERDICT = (v: unknown): string => (v === null || v === undefined ? "—" : String(v));



const row = (label: string, c: Counts) =>
  `| ${label} | ${c.ideas} | ${c.in} | ${c.hold} | ${c.cut} | ${c.undecided} | ${c.k} | ${c.seams} | ${c.arc} | ${c.gate} | ${c.strip} |`;

/* ------------------------------------------------------------------ main */

async function main() {
  loadEnvLocal();
  const write = process.argv.includes("--write");
  const st = vaultStatus();

  if (!st.enabled || !st.root) {
    console.error(`REFUSED — the vault is off: ${st.reason}`);
    process.exit(1);
  }
  if (write && !st.writable) {
    console.error("REFUSED — --write given but the vault is read-only. Set WORKSHOP_VAULT_WRITE=1.");
    process.exit(1);
  }

  const fixturePath = path.join(st.root, "Campaign Content", "_workshop-backups", "workshop-2026-08-03.json");
  if (!fs.existsSync(fixturePath)) {
    console.error(`REFUSED — the migration payload is missing:\n  ${fixturePath}`);
    process.exit(1);
  }

  const ws = JSON.parse(fs.readFileSync(fixturePath, "utf8")) as Workspace;
  const { boards: onDisk } = await listBoards();

  const L: string[] = [];
  const say = (s = "") => { L.push(s); console.log(s); };

  say(`# Campaign Workshop — migration report`);
  say();
  say(`Payload: \`Campaign Content/_workshop-backups/workshop-2026-08-03.json\` (${ws.campaigns.length} campaigns)`);
  say(`Mode: **${write ? "WRITE — files will be changed" : "report only — nothing will be written"}**`);
  say();

  const plans: { merged: Board; rel: string; label: string; before: Counts; after: Counts; changed: boolean }[] = [];

  for (const raw of ws.campaigns) {
    const fixture = normalise(raw);
    const rel = MAPPING[fixture.id];
    if (!rel) {
      console.error(`\nREFUSED — the payload holds a campaign this migration has no mapping for: "${fixture.id}".`);
      console.error("Add it to MAPPING (with the exact board.json path) and re-run.");
      process.exit(1);
    }
    const disk = onDisk.find((b) => b.sourcePath === rel);
    if (!disk) {
      console.error(`\nREFUSED — no board.json found on disk at:\n  ${rel}\nThe scanner returned: ${onDisk.map((b) => b.sourcePath).join(", ") || "(nothing)"}`);
      process.exit(1);
    }

    const { merged, diffs } = mergeForMigration(disk, fixture);
    const before = countsOf(disk);
    const after = countsOf(merged);
    const changed = JSON.stringify(before) !== JSON.stringify(after) || diffs.length > 0;
    plans.push({ merged: { ...merged, sourcePath: rel, mtimeMs: disk.mtimeMs }, rel, label: fixture.name, before, after, changed });

    say(`---`);
    say();
    say(`## ${fixture.name}`);
    say();
    say(`\`${rel}\``);
    say();
    say(`| | ideas | in | hold | cut | undecided | K | seams | arc | gate | strip |`);
    say(`|---|---|---|---|---|---|---|---|---|---|---|`);
    say(row("on disk now", before));
    say(row("in the backup", countsOf(fixture)));
    say(row("**after merge**", after));
    say();

    if (!diffs.length) {
      say(`No differences — the disk copy and the backup already agree. **Nothing to write.**`);
      say();
      continue;
    }

    const forked = diffs.filter((d) => d.diverged);
    if (forked.length) {
      say(`> ⚠️ **${forked.length} genuine rewrite(s)** — not an addition on either side, so no rule can`);
      say(`> settle them. The later text is kept and the earlier one stays in the backup file,`);
      say(`> which this migration never modifies. Read these and say if you want the other version:`);
      say(`>`);
      forked.forEach((d) => {
        const idea = fixture.ideas.find((i) => d.field.includes(i.id));
        const field = d.field.split("· ")[1] ?? "";
        const diskVal = (disk.ideas.find((i) => i.id === idea?.id) as unknown as Record<string, string>)?.[field];
        const backVal = (idea as unknown as Record<string, string>)?.[field];
        say(`> **${d.field}**`);
        say(`> - keeping: ${short(diskVal, 200)}`);
        say(`> - not taking: ${short(backVal, 200)}`);
      });
      say();
    }

    say(`### ${diffs.length} difference(s)`);
    say();
    say(`| field | on disk | in the backup | outcome |`);
    say(`|---|---|---|---|`);
    diffs.forEach((d) => say(`| ${d.diverged ? "⚠️ " : ""}${d.field} | ${d.disk} | ${d.fixture} | ${d.outcome} |`));
    say();
  }

  // The acceptance bar from the handoff's §5, computed rather than asserted in prose.
  say(`---`);
  say();
  say(`## Acceptance check (handoff §5)`);
  say();
  const lm = plans.find((p) => p.rel === MAPPING["last-mile-value-propositions"]);
  const checks: [string, boolean, string][] = [];
  if (lm) {
    const c = lm.after;
    checks.push(["Last Mile counts 15 / 9 in / 1 hold / 3 cut / 2 undecided",
      c.ideas === 15 && c.in === 9 && c.hold === 1 && c.cut === 3 && c.undecided === 2,
      `${c.ideas} / ${c.in} in / ${c.hold} hold / ${c.cut} cut / ${c.undecided} undecided`]);
    const k = lm.merged.ideas.find((i) => i.id === "IDEA-02");
    checks.push(["Katrina's IDEA-02 = in survives", k?.v.K === "in", `IDEA-02 v.K = ${VERDICT(k?.v.K)}`]);
    checks.push(["the disk's extra seams are kept", c.seams >= 15, `${c.seams} seams after merge`]);
    checks.push(["the strip is not lost", c.strip > 0, `${c.strip} strip rows`]);
  }
  const loop = plans.find((p) => p.rel === MAPPING["av-unfinished-loop"]);
  if (loop) {
    const c = loop.after;
    checks.push(["Unfinished Loop counts 18 ideas / 6 arc / 9 seams / 20 gate",
      c.ideas === 18 && c.arc === 6 && c.seams === 9 && c.gate === 20,
      `${c.ideas} ideas / ${c.arc} arc / ${c.seams} seams / ${c.gate} gate`]);
  }
  checks.forEach(([name, ok, evidence]) => say(`- [${ok ? "x" : " "}] ${name} — *${evidence}*`));
  say();

  const failed = checks.filter(([, ok]) => !ok);
  if (failed.length) {
    say(`> ⚠️ **${failed.length} acceptance check(s) failed.** Nothing will be written.`);
    say();
  }

  const toWrite = plans.filter((p) => p.changed);
  say(`**${toWrite.length} of ${plans.length} board(s) would change.**`);
  say();

  const reportRel = path.join("Campaign Content", "_workshop-backups", `migration-report-${new Date().toISOString().slice(0, 10)}.md`);
  fs.writeFileSync(path.join(st.root, reportRel), L.join("\n"), "utf8");
  console.log(`\nReport written to: ${reportRel}`);

  if (!write) {
    console.log("\nNothing was written to any board. Read the report, then re-run with --write.");
    return;
  }
  if (failed.length) {
    console.error("\nREFUSED to write — acceptance checks failed (see above).");
    process.exit(1);
  }

  // Snapshot both files before touching either, so one bad write is recoverable.
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const snapDir = path.join(st.root, "Campaign Content", "_workshop-backups", `pre-migration-${stamp}`);
  fs.mkdirSync(snapDir, { recursive: true });
  for (const p of plans) {
    const src = path.join(st.root, p.rel);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(snapDir, `${p.merged.id}.board.json`));
  }
  console.log(`\nPre-migration snapshot: ${path.relative(st.root, snapDir)}`);

  for (const p of toWrite) {
    // force: the mtime guard is for two live writers; here the snapshot is the safety net.
    const res = await saveBoard(p.merged, { force: true });
    if (!res.ok) {
      console.error(`FAILED writing ${p.label}: [${res.step}] ${res.error}`);
      process.exit(1);
    }
    console.log(`  wrote ${p.label} → ${res.path} (verified, previous version at ${res.backup ?? "n/a"})`);
  }

  // Prove it landed by re-reading from disk, rather than trusting the writes returned.
  console.log("\nRe-reading the vault to confirm:");
  const { boards: after } = await listBoards();
  let bad = 0;
  for (const p of plans) {
    const b = after.find((x) => x.sourcePath === p.rel);
    if (!b) { console.error(`  MISSING after write: ${p.rel}`); bad += 1; continue; }
    const c = countsOf(b);
    const ok = JSON.stringify(c) === JSON.stringify(p.after);
    if (!ok) bad += 1;
    console.log(`  ${ok ? "OK  " : "BAD "} ${p.label}: ${c.ideas} ideas, ${c.in} in, ${c.k} K, ${c.seams} seams, ${c.arc} arc, ${c.gate} gate, ${c.strip} strip`);
  }
  const k = after.find((x) => x.sourcePath === MAPPING["last-mile-value-propositions"])?.ideas.find((i) => i.id === "IDEA-02");
  console.log(`  ${k?.v.K === "in" ? "OK  " : "BAD "} Katrina's IDEA-02 on disk = ${VERDICT(k?.v.K)}`);
  if (k?.v.K !== "in") bad += 1;

  if (bad) { console.error(`\n${bad} post-write check(s) FAILED. The snapshot is at ${path.relative(st.root, snapDir)}.`); process.exit(1); }
  console.log("\nMigration complete and verified on disk.");
}

main().catch((e) => { console.error(e); process.exit(1); });
