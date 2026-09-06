import { readFileSync } from "node:fs";
import path from "node:path";

export interface KnowledgeState {
  /** "loaded" with real chunks, "empty" for a well-formed but empty index, "missing" for no file. */
  knowledge: "loaded" | "empty" | "missing";
  chunks: number;
}

/**
 * Hoot's RAG index, as it actually is right now.
 *
 * Extracted at L3 (2026-09-02) so the /health route and the landing HUD read the
 * same source. Before this the HUD displayed "Hoot v1.0.4" — a version string that
 * corresponds to nothing, sitting next to a fabricated uptime counter, on a public
 * page. Duplicating the check into the HUD would have swapped one lie for two
 * copies of a truth that could drift apart.
 *
 * ⚠️ Counts chunks rather than testing existence, and that distinction is the whole
 * point: the ingest script's real failure mode is writing a well-formed EMPTY array,
 * which an existence check happily reports as "loaded". That is a check that cannot
 * fail in the one way this thing actually breaks.
 *
 * A missing brain does not stop the OS serving, so this never throws. It reports.
 */
export function getKnowledgeState(): KnowledgeState {
  try {
    const parsed = JSON.parse(
      readFileSync(path.join(process.cwd(), "public", "brain.json"), "utf-8"),
    );
    const chunks = Array.isArray(parsed) ? parsed.length : 0;
    return { knowledge: chunks > 0 ? "loaded" : "empty", chunks };
  } catch {
    return { knowledge: "missing", chunks: 0 };
  }
}

/** How the HUD says it out loud. Never a version number, because there isn't one. */
export function describeKnowledge(state: KnowledgeState): string {
  if (state.knowledge === "loaded") return `${state.chunks} chunks loaded`;
  if (state.knowledge === "empty") return "index empty";
  return "no knowledge base";
}
