#!/usr/bin/env node
// ─── deploy-drift.mjs — the OUTSIDE half of the L10 deploy-drift signal ─────────
//
// Answers, from anywhere with node and internet, for each MCOS app:
//   1. Is it up?            GET /health (or /version.json) answers 200 within the timeout
//   2. Is it current?       the commit the running image reports == the tip of main
//   3. What was published?  the digest GHCR holds for :latest (informational — the
//                           running digest is only visible ON the box; see the
//                           on-box half, scripts/deploy-drift-onbox.sh)
//
// Why this exists (Last Mile L10). Nothing on the VPS signals drift: a container
// crash-looped every six seconds for two months unseen, and a compose change sat
// unapplied because deploys pull images, not the repo. Healthchecks made hangs
// detectable; this makes "behind" and "down" detectable from outside, so the
// routine that runs it needs no VPS access — which matters because Claude has none.
//
// Usage:
//   node scripts/deploy-drift.mjs               human table
//   node scripts/deploy-drift.mjs --json        machine-readable
//   node scripts/deploy-drift.mjs --expect <sha>  compare against this sha instead of
//                                               main's tip (plant a bogus sha to prove
//                                               the check bites)
// Exit codes:
//   0  every app UP and CURRENT
//   1  at least one BEHIND or UNKNOWN (image predates the commit stamp)
//   2  at least one DOWN (no 200 within the timeout) — outranks 1
//   3  the checker itself could not run (GitHub API unreachable, bad args)
//
// Needs nothing installed beyond node ≥ 18. No secrets: the repo and the images
// are public, and GHCR hands out anonymous pull tokens for public images.

const REPO = "ErnestOfGaia/Mechanical-Cupcakes-OS-Shell";
// `health` decides UP/DOWN. `commit` is where the build stamp lives — the same URL
// for the Next apps, a static file for the nginx one. A 404 on `commit` is
// UNKNOWN (an image from before the stamp existed), never DOWN.
const APPS = [
  { name: "mcos-shell", health: "https://mechanicalcupcakes.fun/health", commit: "https://mechanicalcupcakes.fun/health", image: "ernestofgaia/mcos-shell" },
  { name: "mcos-ochi", health: "https://ochi.mechanicalcupcakes.fun/health", commit: "https://ochi.mechanicalcupcakes.fun/health", image: "ernestofgaia/mcos-ochi" },
  { name: "mcos-pennypost", health: "https://pennypost.mechanicalcupcakes.fun/health", commit: "https://pennypost.mechanicalcupcakes.fun/version.json", image: "ernestofgaia/mcos-pennypost" },
];
const TIMEOUT_MS = 15000;

const args = process.argv.slice(2);
const asJson = args.includes("--json");
const expectIdx = args.indexOf("--expect");
const expectOverride = expectIdx >= 0 ? args[expectIdx + 1] : null;
if (expectIdx >= 0 && !expectOverride) { console.error("--expect needs a sha"); process.exit(3); }

async function fetchWithTimeout(url, init = {}) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try { return await fetch(url, { ...init, signal: ctl.signal }); }
  finally { clearTimeout(t); }
}

async function mainTip() {
  if (expectOverride) return { sha: expectOverride, source: "--expect" };
  const res = await fetchWithTimeout(`https://api.github.com/repos/${REPO}/commits/main`, {
    headers: { accept: "application/vnd.github+json", "user-agent": "mcos-deploy-drift" },
  });
  if (!res.ok) throw new Error(`GitHub API answered ${res.status} for commits/main`);
  const data = await res.json();
  return { sha: data.sha, source: "github:main", date: data.commit?.committer?.date ?? null };
}

async function ghcrLatestDigest(image) {
  try {
    const tok = await fetchWithTimeout(`https://ghcr.io/token?scope=repository:${image}:pull`).then((r) => r.json());
    const res = await fetchWithTimeout(`https://ghcr.io/v2/${image}/manifests/latest`, {
      method: "HEAD",
      headers: {
        authorization: `Bearer ${tok.token}`,
        accept: "application/vnd.oci.image.index.v1+json, application/vnd.docker.distribution.manifest.list.v2+json, application/vnd.docker.distribution.manifest.v2+json",
      },
    });
    return res.ok ? res.headers.get("docker-content-digest") : null;
  } catch { return null; }
}

async function probe(app) {
  const started = Date.now();
  const ua = { headers: { "user-agent": "mcos-deploy-drift" } };
  let health;
  try {
    health = await fetchWithTimeout(app.health, ua);
  } catch (e) {
    return { ...app, up: false, http: 0, ms: Date.now() - started, commit: null, error: e?.name === "AbortError" ? `timeout ${TIMEOUT_MS}ms` : String(e?.message ?? e) };
  }
  const ms = Date.now() - started;
  if (!health.ok) return { ...app, up: false, http: health.status, ms, commit: null };

  let commit = null;
  try {
    const res = app.commit === app.health ? health : await fetchWithTimeout(app.commit, ua);
    if (res.ok) commit = (await res.json())?.commit ?? null;
  } catch { /* no stamp readable → UNKNOWN */ }
  return { ...app, up: true, http: health.status, ms, commit };
}

function verdict(p, tipSha) {
  if (!p.up) return "DOWN";
  if (!p.commit || p.commit === "unknown") return "UNKNOWN";
  return p.commit === tipSha ? "CURRENT" : "BEHIND";
}

async function main() {
  let tip;
  try { tip = await mainTip(); }
  catch (e) { console.error(`checker error: ${e.message}`); process.exit(3); }

  const results = await Promise.all(APPS.map(async (app) => {
    const [p, published] = await Promise.all([probe(app), ghcrLatestDigest(app.image)]);
    return { ...p, published, verdict: verdict(p, tip.sha) };
  }));

  const worst = results.some((r) => r.verdict === "DOWN") ? 2
    : results.some((r) => r.verdict === "BEHIND" || r.verdict === "UNKNOWN") ? 1 : 0;

  const report = { checkedAt: new Date().toISOString(), expected: tip, apps: results, exit: worst };

  if (asJson) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`main tip: ${tip.sha.slice(0, 7)} (${tip.source}${tip.date ? ", " + tip.date : ""})`);
    console.log("");
    for (const r of results) {
      const commit = r.commit ? r.commit.slice(0, 7) : "—";
      const pub = r.published ? r.published.slice(7, 19) : "—";
      console.log(`${r.verdict.padEnd(8)} ${r.name.padEnd(15)} http=${r.http} ${String(r.ms).padStart(5)}ms  running=${commit}  published@ghcr=${pub}${r.error ? "  " + r.error : ""}`);
    }
    console.log("");
    console.log(worst === 0 ? "all apps up and current with main"
      : worst === 1 ? "DRIFT: at least one app is behind main, or predates the commit stamp"
      : "DOWN: at least one app did not answer");
  }
  process.exit(worst);
}

main();
