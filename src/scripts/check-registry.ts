/**
 * Registry invariants, checked at BUILD time.
 *
 * ⭐ WHY THIS IS A SCRIPT AND NOT A THROW INSIDE getFeaturedApps().
 *
 * The first version of this guard threw from `getFeaturedApps()`, on the assumption
 * that the landing page importing it meant a bad registry would fail `next build`.
 * It did not. The landing page is `force-dynamic` so it is never prerendered, the
 * function is only called per request, and a planted fourth featured app built
 * perfectly cleanly. The guard was decorative, and I only know that because I
 * planted the defect and watched the build pass.
 *
 * Worse: because the page IS dynamic, that throw would have fired at REQUEST time
 * instead — turning a registry typo into a 500 on the public gallery. A check that
 * cannot fail during the build, and takes the site down at runtime, is the wrong
 * shape twice over.
 *
 * So: the invariants are asserted here, wired to `prebuild`, where failing is the
 * whole job. `getFeaturedApps()` no longer throws and simply reports what it finds.
 *
 * Run it directly:  npx tsx src/scripts/check-registry.ts
 * To prove it bites: flip any entry's tier to "featured" and run `npm run build`.
 */
import { APP_REGISTRY, FEATURED_COUNT, type AppRegistryEntry } from "../lib/appRegistry";

const problems: string[] = [];

const featured = APP_REGISTRY.filter((a) => a.tier === "featured");
if (featured.length !== FEATURED_COUNT) {
  problems.push(
    `Featured must be exactly ${FEATURED_COUNT} (SEAM-16b); found ${featured.length}: ` +
      `${featured.map((a) => a.id).join(", ") || "(none)"}. ` +
      `Promoting one means demoting another in the same edit.`,
  );
}

const roots = APP_REGISTRY.filter((a) => a.tier === "root");
if (roots.length !== 1) {
  problems.push(`Exactly one "root" entry expected (the shell); found ${roots.length}.`);
}

const ids = APP_REGISTRY.map((a) => a.id);
const dupeIds = ids.filter((id, i) => ids.indexOf(id) !== i);
if (dupeIds.length) problems.push(`Duplicate ids: ${[...new Set(dupeIds)].join(", ")}`);

const routes = APP_REGISTRY.map((a) => a.route);
const dupeRoutes = routes.filter((r, i) => routes.indexOf(r) !== i);
if (dupeRoutes.length) problems.push(`Duplicate routes: ${[...new Set(dupeRoutes)].join(", ")}`);

// A featured app that cannot be opened is a contradiction: the landing grid's whole
// job is to be the way in.
for (const a of featured) {
  if (!a.hasLiveApp) problems.push(`"${a.id}" is featured but has hasLiveApp: false.`);
}

// `queued` means a brief with no build. If it has a live app, it is not queued.
for (const a of APP_REGISTRY.filter((x: AppRegistryEntry) => x.status === "queued")) {
  if (a.hasLiveApp) problems.push(`"${a.id}" is status "queued" but hasLiveApp: true.`);
}

if (problems.length) {
  console.error("\n❌ APP_REGISTRY invariants violated:\n");
  for (const p of problems) console.error(`   • ${p}`);
  console.error("");
  process.exit(1);
}

console.log(
  `✅ APP_REGISTRY ok — ${APP_REGISTRY.length} entries: ` +
    `${featured.length} featured, ` +
    `${APP_REGISTRY.filter((a) => a.tier === "directory").length} directory, ` +
    `${APP_REGISTRY.filter((a) => a.tier === "private").length} private, ` +
    `${roots.length} root.`,
);
