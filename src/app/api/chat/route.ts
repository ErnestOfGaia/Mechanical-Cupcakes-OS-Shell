import { hootAgent } from "@/mastra/agents/hootAgent";
import { NextResponse } from "next/server";

// Tool calls Hoot made while answering, surfaced so the panel can show what it
// was doing rather than an undifferentiated "thinking" state (issue #13).
// Only the tool NAME crosses this boundary — never arguments or results, which
// can carry knowledge-base contents we don't want echoed into the client.
type ToolActivity = { tool: string };

function extractToolActivity(result: unknown): ToolActivity[] {
  // Mastra's result shape varies by version and by whether the model called
  // tools at all, so read defensively: an unexpected shape costs the indicator,
  // never the answer.
  const steps = (result as { steps?: unknown })?.steps;
  if (!Array.isArray(steps)) return [];

  const names = steps.flatMap((step) => {
    const calls = (step as { toolCalls?: unknown })?.toolCalls;
    if (!Array.isArray(calls)) return [];
    return calls
      .map((call) => {
        const c = call as { toolName?: unknown; toolCallId?: unknown };
        return typeof c?.toolName === "string" ? c.toolName : null;
      })
      .filter((n): n is string => Boolean(n));
  });

  return [...new Set(names)].map((tool) => ({ tool }));
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "A non-empty 'message' is required." },
        { status: 400 },
      );
    }

    const result = await hootAgent.generate(message);

    return NextResponse.json({
      text: result.text,
      toolActivity: extractToolActivity(result),
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: "Failed to process chat" }, { status: 500 });
  }
}
