import { hootAgent } from "@/mastra/agents/hootAgent";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // In a multi-agent setup, we'd route here. 
    // For now, everything goes to hootAgent.
    
    // Mastra agent generation
    // Based on preflight, the router forwards to a local Mastra server usually.
    // However, we can call it directly if it's in the same process.
    
    const result = await hootAgent.generate(message);
    
    return NextResponse.json({ text: result.text });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: "Failed to process chat" }, { status: 500 });
  }
}
