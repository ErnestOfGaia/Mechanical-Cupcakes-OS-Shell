/**
 * Ernest's placement rule as a standalone check, for the campaign-workshop skill.
 *
 *   npx tsx scripts/check-placement.ts <path to board.json> [campaign-id]
 *
 * Exit code 1 when an idea marked IN produces neither a drop nor a seed and no seam
 * names it — so this is a check that can actually fail, which is the only kind worth
 * running. Needs no vault: it reads the file it is given.
 *
 * The logic lives in lib/rule.ts and is the same code the app and the MCP server run,
 * including the fix for seams that write id runs in shorthand — "IDEA-06/07/08" names
 * three ideas, and the substring match that missed that reported two false violations.
 */
import fs from "node:fs";
import path from "node:path";
import { normalise } from "../lib/board";
import { checkPlacement, formatPlacementReport } from "../lib/rule";
import type { Board, Workspace } from "../lib/types";

const file = process.argv[2];
if (!file) {
  console.error("usage: npx tsx scripts/check-placement.ts <path to board.json> [campaign-id]");
  process.exit(2);
}

const full = path.resolve(file);
if (!fs.existsSync(full)) {
  console.error(`No such file: ${full}`);
  process.exit(2);
}

let parsed: unknown;
try {
  parsed = JSON.parse(fs.readFileSync(full, "utf8"));
} catch (e) {
  console.error(`Not valid JSON: ${e instanceof Error ? e.message : String(e)}`);
  process.exit(2);
}

const ws = parsed as Partial<Workspace>;
const list: Partial<Board>[] = Array.isArray(ws.campaigns) ? ws.campaigns : [parsed as Partial<Board>];
const wanted = process.argv[3];
const picked = wanted ? list.filter((c) => c.id === wanted) : list;

if (!picked.length) {
  console.error(`No campaign "${wanted}" in that file. Found: ${list.map((c) => c.id).join(", ")}`);
  process.exit(2);
}

let failed = 0;
for (const raw of picked) {
  const b = normalise(raw);
  console.log(`\n=== ${b.name} [${b.id}] ===`);
  console.log(formatPlacementReport(b));
  if (!checkPlacement(b).ok) failed += 1;
}

if (failed) {
  console.error(`\n${failed} board(s) have IN ideas that land nowhere.`);
  process.exit(1);
}
console.log("\nEvery IN idea is accounted for.");
