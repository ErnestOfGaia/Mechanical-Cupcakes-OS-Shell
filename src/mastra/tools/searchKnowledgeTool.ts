import { createTool } from "@mastra/core/tools";
import { embed } from "../../lib/embedding";
import { brain } from "../../lib/brain";

export const searchKnowledgeTool = createTool({
  id: "search_knowledge",
  description: "Search project knowledge base for relevant facts about Mechanical Cupcakes OS and its apps.",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string", description: "What to search for" },
    },
    required: ["query"],
  },
  execute: async ({ query }: any) => {
    const queryEmbeddings = await embed([query]);
    const results = brain.search(queryEmbeddings[0], { topK: 5 });
    return results.map((r) => r.text).join("\n---\n");
  },
});
