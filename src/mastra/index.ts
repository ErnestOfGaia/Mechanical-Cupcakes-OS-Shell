import { Mastra } from "@mastra/core";
import { hootAgent } from "./agents/hootAgent";

export const mastra = new Mastra({
  agents: { hootAgent },
});
