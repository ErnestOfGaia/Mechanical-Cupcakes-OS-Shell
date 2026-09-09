import { createTool } from "@mastra/core/tools";
import { embed } from "../../lib/embedding";
import { brain } from "../../lib/brain";

/**
 * Hoot's only tool: look things up in the brain built from the per-app writeups.
 *
 * Honesty rules, in code rather than in the prompt:
 *  - if the brain is missing or empty, say so in the tool result — the agent must
 *    be told it has nothing, not handed an empty string it can paper over;
 *  - if embedding the query fails (no key, API down), say that too;
 *  - results carry the document title in the chunk text (set at ingest), so the
 *    agent can name which exhibit a fact came from.
 */
export const searchKnowledgeTool = createTool({
  id: "search_knowledge",
  description:
    "Search the writeups of the Mechanical Cupcakes OS exhibits (how each app was built and why, " +
    "what state it is in, what is unfinished). Use it before answering any question about an app.",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string", description: "What to search for" },
    },
    required: ["query"],
  },
  execute: async (inputData: unknown) => {
    const { query } = (inputData ?? {}) as { query?: string };
    if (!query || !query.trim()) return "NO MATCH: empty query.";
    const data = brain.load();
    if (!data || data.length === 0) {
      return (
        "KNOWLEDGE BASE UNAVAILABLE: no writeups are loaded on this server. " +
        "Tell the visitor plainly that you cannot look this up right now; do not answer from memory."
      );
    }
    let queryEmbedding: number[];
    try {
      queryEmbedding = (await embed([query]))[0];
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      return (
        `KNOWLEDGE BASE UNAVAILABLE: the search could not run (${reason}). ` +
        "Tell the visitor plainly that you cannot look this up right now; do not answer from memory."
      );
    }
    const results = brain.search(queryEmbedding, { topK: 5 });
    if (results.length === 0) return "NO MATCH: the writeups say nothing about this. Say so.";
    return results.map((r) => r.text).join("\n---\n");
  },
});
