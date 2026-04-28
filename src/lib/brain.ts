import fs from "fs";
import path from "path";

interface Chunk {
  text: string;
  embedding: number[];
  metadata?: any;
}

function dotProduct(a: number[], b: number[]) {
  return a.reduce((sum, val, i) => sum + val * b[i], 0);
}

function magnitude(a: number[]) {
  return Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
}

function cosineSimilarity(a: number[], b: number[]) {
  return dotProduct(a, b) / (magnitude(a) * magnitude(b));
}

export const brain = {
  _data: null as Chunk[] | null,

  load() {
    if (this._data) return this._data;
    const filePath = path.join(process.cwd(), "public", "brain.json");
    if (fs.existsSync(filePath)) {
      this._data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } else {
      console.warn("brain.json not found. Run 'npm run ingest' first.");
      this._data = [];
    }
    return this._data;
  },

  search(queryEmbedding: number[], options: { topK: number } = { topK: 5 }) {
    const data = this.load();
    if (!data || data.length === 0) return [];

    const scored = data.map((chunk) => ({
      ...chunk,
      score: cosineSimilarity(chunk.embedding, queryEmbedding),
    }));

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, options.topK);
  },
};
