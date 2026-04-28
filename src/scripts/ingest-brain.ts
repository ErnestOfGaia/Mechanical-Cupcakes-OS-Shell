import { MDocument } from "@mastra/rag";
import { embed } from "../lib/embedding";
import fs from "fs";
import path from "path";

async function loadMarkdownDocs() {
  const baseDir = "C:\\Users\\Owner\\.claude\\Ideas & Projects\\Projects Management\\Product Projects\\Mechanical Cupcakes OS";
  const projectDirs = [
    "OS Notes",
    "Pelican Recipe Library",
    "love.postcards",
    "OCHI Dashboard"
  ];

  const docs = [];

  for (const dir of projectDirs) {
    let briefPath = path.join(baseDir, dir, "PROJECT_BRIEF.md");
    if (!fs.existsSync(briefPath)) {
      // Check for other common names like Project DNA Brief.md
      briefPath = path.join(baseDir, dir, "Project DNA Brief.md");
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

  console.log("Chunking documents...");
  // MDocument.fromMarkdown is static in some versions, or instance based. 
  // Based on preflight: MDocument.fromMarkdown(docs, { ... })
  // Assuming 'docs' is a string or array of strings for content
  
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

ingestBrain().catch(console.error);
