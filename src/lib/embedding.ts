export async function embed(texts: string[]): Promise<number[][]> {
  const apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey) {
    console.warn("VOYAGE_API_KEY is not set. Returning dummy embeddings.");
    return texts.map(() => new Array(512).fill(0));
  }

  const response = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      input: texts,
      model: "voyage-3-lite",
    }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error("Voyage API Error:", data);
    throw new Error(`Voyage API returned ${response.status}: ${JSON.stringify(data)}`);
  }

  return data.data.map((item: any) => item.embedding);
}
