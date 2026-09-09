import { MDocument } from "@mastra/rag";
import fs from "node:fs";
import path from "node:path";
import { embed } from "../lib/embedding";
import { APP_REGISTRY } from "../lib/appRegistry";

/**
 * Builds Hoot's brain (public/brain.json) from the per-app WRITEUPs.
 *
 * ⭐ L9 (2026-09-08). Ernest's ruling of 2026-08-04: the brain is an OUTPUT of the
 * Last Mile — finish an app, write its development + architecture description,
 * and those writeups plus a little personality become the brain. The April-era
 * HOOT_EXHIBIT_NOTES / HOOT_MUSEUM_GUIDE that the previous version of this script
 * read are replaced, not patched. They stay in the vault as history; nothing
 * here reads the vault any more.
 *
 * Sources, all PUBLIC by SEAM-15 ("writeups are public from the first keystroke"):
 *   - WRITEUP.md at the repo root (the shell)
 *   - apps/pennypost/WRITEUP.md
 *   - apps/ochi/ochi-app/WRITEUP.md
 *   - The Family Recipe App's WRITEUP.md, fetched from its own public repo
 *     (github.com/ErnestOfGaia/family-recipe-app) — one app, one repo, one writeup.
 *   - the app registry, rendered as a short inventory so Hoot can say what exists,
 *     what state it is in, and what is a placard rather than a door
 *
 * Delivery (G13, locked by SEAM-15): this runs in CI before the shell image
 * builds, with VOYAGE_API_KEY from Actions secrets. The published image has never
 * contained a brain (/health said `knowledge:"missing"` from 2026-08-04 until
 * this landed); `/health` flipping to `loaded` with a real chunk count is the
 * only acceptable done-signal.
 *
 * Every guard here fails LOUD. The failure this script is built against is the
 * quiet one: a green build that ships an empty or dummy brain, so Hoot answers
 * confidently from the model alone and nothing anywhere reports a problem.
 */

const ROOT = process.cwd();

type Source =
  | { id: string; title: string; file: string }
  | { id: string; title: string; url: string };

const SOURCES: Source[] = [
  { id: "shell", title: "Mechanical Cupcakes OS: development and architecture", file: "WRITEUP.md" },
  { id: "pennypost", title: "The Penny Post: development and architecture", file: "apps/pennypost/WRITEUP.md" },
  { id: "ochi", title: "OCHI: development and architecture", file: "apps/ochi/ochi-app/WRITEUP.md" },
  { id: "scout", title: "Scout Protocol: a deprecation, done on purpose", file: "apps/scout/WRITEUP.md" },
  {
    id: "recipes",
    title: "The Family Recipe App: development and architecture",
    url: "https://raw.githubusercontent.com/ErnestOfGaia/family-recipe-app/main/WRITEUP.md",
  },
];

const MIN_DOC_CHARS = 2000; // a real writeup is thousands of words; a stub is a bug

function fail(msg: string): never {
  throw new Error(msg);
}

async function readSource(s: Source): Promise<string> {
  if ("file" in s) {
    const p = path.join(ROOT, s.file);
    if (!fs.existsSync(p)) fail(`${s.id}: ${s.file} does not exist under ${ROOT}`);
    const text = fs.readFileSync(p, "utf8");
    if (text.length < MIN_DOC_CHARS) fail(`${s.id}: ${s.file} is only ${text.length} chars — not a writeup`);
    return text;
  }
  const res = await fetch(s.url);
  if (!res.ok) fail(`${s.id}: ${s.url} answered ${res.status}`);
  const text = await res.text();
  if (text.length < MIN_DOC_CHARS) fail(`${s.id}: ${s.url} returned only ${text.length} chars`);
  if (!text.startsWith("# ")) fail(`${s.id}: ${s.url} does not look like a markdown writeup`);
  return text;
}

/**
 * The registry as prose. One source: this is a rendering of appRegistry.ts, not
 * a second list. It exists so Hoot can answer "what is in the gallery and what
 * state is it in" from the same facts the landing page renders, including the
 * placards (hasLiveApp: false) and the deprecation in progress.
 */
function renderRegistry(): string {
  const lines: string[] = [
    "# The gallery inventory (from the app registry)",
    "",
    "This is the list of exhibits on mechanicalcupcakes.fun, rendered from the same registry the",
    "landing page uses. Status words mean exactly what they say: operational is live and used;",
    "queued is a brief with no build yet; standby is built but deliberately not deployed;",
    "deprecating is being wound down on purpose; deprecated is finished winding down — archived and removed,",
    "with a writeup in its place; private is not open to the public.",
    "",
  ];
  for (const a of APP_REGISTRY) {
    lines.push(`## ${a.name}`);
    lines.push("");
    lines.push(`- Route in the shell: ${a.route}`);
    lines.push(`- Status: ${a.status}`);
    lines.push(`- Tier: ${a.tier}`);
    lines.push(`- Has a live app to open: ${a.hasLiveApp ? "yes" : "no — this is a placard (a card with no app behind it)"}`);
    lines.push(`- Description: ${a.description}`);
    if (a.note) lines.push(`- Note: ${a.note}`);
    if (a.placardBody?.length) {
      lines.push("");
      for (const p of a.placardBody) lines.push(p);
    }
    lines.push("");
  }
  return lines.join("\n");
}

async function main() {
  if (!process.env.VOYAGE_API_KEY) {
    fail("VOYAGE_API_KEY is not set. Refusing to build a brain with no embeddings.");
  }

  const docs: { id: string; title: string; content: string }[] = [];
  for (const s of SOURCES) {
    const content = await readSource(s);
    docs.push({ id: s.id, title: s.title, content });
    console.log(`read   ${s.id.padEnd(10)} ${content.length.toString().padStart(6)} chars`);
  }
  const registry = renderRegistry();
  docs.push({ id: "registry", title: "The gallery inventory", content: registry });
  console.log(`read   ${"registry".padEnd(10)} ${registry.length.toString().padStart(6)} chars (${APP_REGISTRY.length} entries)`);

  const out: { text: string; embedding: number[]; metadata: Record<string, unknown> }[] = [];
  let dim = 0;

  for (const doc of docs) {
    const mdoc = MDocument.fromMarkdown(doc.content);
    const chunks = await mdoc.chunk({ strategy: "markdown", maxSize: 1500, overlap: 150 });
    if (chunks.length === 0) fail(`${doc.id}: chunker produced zero chunks`);

    // Prefix every chunk with its document title so a retrieved paragraph still
    // says which exhibit it is about — retrieval returns chunks, not documents.
    const texts = chunks.map((c) => `[${doc.title}]\n${c.text}`);
    const embeddings = await embed(texts);
    if (embeddings.length !== texts.length) fail(`${doc.id}: ${texts.length} chunks but ${embeddings.length} embeddings`);

    for (let i = 0; i < texts.length; i++) {
      const e = embeddings[i];
      if (!Array.isArray(e) || e.length === 0) fail(`${doc.id}: chunk ${i} has no embedding`);
      if (dim === 0) dim = e.length;
      if (e.length !== dim) fail(`${doc.id}: chunk ${i} embedding dim ${e.length} != ${dim}`);
      if (e.every((v) => v === 0)) fail(`${doc.id}: chunk ${i} embedding is all zeros — a dummy, not an embedding`);
      out.push({
        text: texts[i],
        embedding: e,
        metadata: { source: doc.id, title: doc.title, ...chunks[i].metadata },
      });
    }
    console.log(`embed  ${doc.id.padEnd(10)} ${chunks.length.toString().padStart(4)} chunks`);
    await new Promise((r) => setTimeout(r, 1000)); // be polite to the rate limit
  }

  if (out.length === 0) fail("zero chunks total — refusing to write an empty brain");

  const publicDir = path.join(ROOT, "public");
  fs.mkdirSync(publicDir, { recursive: true });
  const target = path.join(publicDir, "brain.json");
  fs.writeFileSync(target, JSON.stringify(out));
  console.log(`wrote  ${target}: ${out.length} chunks × ${dim} dims from ${docs.length} documents`);
}

// `.catch(console.error)` alone still exits 0, so a failed embed call or a missing
// API key would log a stack trace into a green build. Fail loudly instead.
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
