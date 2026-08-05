import { MDocument } from "@mastra/rag";
import { embed } from "../lib/embedding";
import fs from "fs";
import path from "path";

// Where Hoot's exhibit copy lives. Defaults to Ernest's vault for local runs;
// HOOT_CONTENT_DIR overrides it so a CI runner (which has no C:\Users\Owner) can
// point at a checked-out copy. Until that copy exists, CI cannot run this script
// at all — see the zero-document guard below, which is what makes that failure
// loud instead of silent.
const DEFAULT_CONTENT_DIR =
  "C:\\Users\\Owner\\.claude\\Ideas & Projects\\Projects Management\\Product Projects\\Mechanical Cupcakes OS";

async function loadMarkdownDocs() {
  const baseDir = process.env.HOOT_CONTENT_DIR || DEFAULT_CONTENT_DIR;
  const projectDirs = [
    "OS Notes",
    "Pellito Hub",
    "love.postcards",
    "OCHI Dashboard",
    "Scout Protocol Prototype",
    "The Penny Post"
  ];

  const docs = [];

  for (const dir of projectDirs) {
    let briefPath = path.join(baseDir, dir, "HOOT_EXHIBIT_NOTES.md");
    if (dir === "OS Notes") {
      briefPath = path.join(baseDir, dir, "HOOT_MUSEUM_GUIDE.md");
    }
    
    if (fs.existsSync(briefPath)) {
      const content = fs.readFileSync(briefPath, "utf-8");
      docs.push({
        id: dir,
        content: content,
        metadata: { project: dir }
      });
    }
  }

  return docs;
}

async function ingestBrain() {
  console.log("Loading documents...");
  const docs = await loadMarkdownDocs();

  // Every source path is an existsSync away from silently vanishing — a moved
  // vault, a renamed folder, or a CI runner with no C:\ drive all produce zero
  // documents, and without this the script would write an EMPTY brain.json and
  // exit 0. That is the worst possible outcome: green build, shipped image, Hoot
  // knows nothing, and nothing anywhere reports a problem.
  if (docs.length === 0) {
    throw new Error(
      `No exhibit documents found under ${process.env.HOOT_CONTENT_DIR || DEFAULT_CONTENT_DIR}. ` +
        `Refusing to write an empty brain.json. Set HOOT_CONTENT_DIR to a directory ` +
        `containing the per-app HOOT_EXHIBIT_NOTES.md files and OS Notes/HOOT_MUSEUM_GUIDE.md.`,
    );
  }
  console.log(`Loaded ${docs.length} document(s): ${docs.map((d) => d.id).join(", ")}`);

  console.log("Chunking documents...");

  const allEmbedded = [];

  for (const doc of docs) {
    console.log(`Processing ${doc.id}...`);
    const mdoc = MDocument.fromMarkdown(doc.content);
    const chunks = await mdoc.chunk({
      strategy: "markdown",
      maxSize: 1500,
      overlap: 150,
    });

    console.log(`Embedding ${chunks.length} chunks for ${doc.id}...`);
    const embeddings = await embed(chunks.map(c => c.text));
    
    const embedded = chunks.map((chunk, i) => ({
      text: chunk.text,
      embedding: embeddings[i],
      metadata: { ...doc.metadata, ...chunk.metadata }
    }));

    allEmbedded.push(...embedded);
    
    // Small delay between documents to respect 3 RPM
    if (docs.indexOf(doc) < docs.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 20000));
    }
  }

  console.log(`Writing ${allEmbedded.length} total chunks to brain.json...`);
  const publicDir = path.join(process.cwd(), "public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }

  fs.writeFileSync(
    path.join(publicDir, "brain.json"),
    JSON.stringify(allEmbedded, null, 2)
  );
  
  console.log("Ingestion complete!");
}

// `.catch(console.error)` alone still exits 0, so a failed embed call or a missing
// API key would log a stack trace into a green build. Fail loudly instead.
ingestBrain().catch((err) => {
  console.error(err);
  process.exit(1);
});
