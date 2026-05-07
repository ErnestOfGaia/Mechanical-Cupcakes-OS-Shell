import { hootAgent } from "@/mastra/agents/hootAgent";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const result = await hootAgent.generate(message);
    
    return NextResponse.json({ text: result.text });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: "Failed to process chat" }, { status: 500 });
  }
}
