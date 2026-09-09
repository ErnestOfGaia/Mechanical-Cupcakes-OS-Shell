/**
 * Voyage embeddings, for the ingest script and for Hoot's query at runtime.
 *
 * ⛔ No dummy fallback. The previous version returned 512 zeros when the key was
 * unset "so nothing breaks". That is the quiet failure this whole system is built
 * against: an ingest with no key would have written a brain full of zero vectors,
 * every cosine similarity would be NaN, and Hoot would answer confidently from the
 * model alone under a green build. Missing key → throw. The ingest fails the CI
 * job; the runtime tool catches it and tells the agent the knowledge base is
 * unavailable, which is the truth.
 */
export async function embed(texts: string[]): Promise<number[][]> {
  const apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey) {
    throw new Error("VOYAGE_API_KEY is not set — cannot embed");
  }

  const response = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ input: texts, model: "voyage-3-lite" }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Voyage API returned ${response.status}: ${JSON.stringify(data).slice(0, 300)}`);
  }
  return data.data.map((item: { embedding: number[] }) => item.embedding);
}
