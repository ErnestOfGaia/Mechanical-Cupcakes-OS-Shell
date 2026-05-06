import { NextRequest, NextResponse } from 'next/server';
import { pellitoAgent } from '@/mastra/agents/pellito';
import { verifySession, COOKIE_NAME, type Role } from '@/lib/auth';

export async function POST(req: NextRequest) {
  // Verify session
  const cookieValue = req.cookies.get(COOKIE_NAME)?.value;
  const role: Role | null = cookieValue ? await verifySession(cookieValue) : null;
  if (!role) {
    return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 });
  }

  try {
    const { message } = await req.json();
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    // Prepend role context so Pellito knows how to filter its response
    const contextualMessage = `[Role: ${role}] ${message.trim()}`;

    const result = await pellitoAgent.generate([
      { role: 'user', content: contextualMessage },
    ]);

    return NextResponse.json({ reply: result.text });
  } catch (err) {
    console.error('[api/agent]', err);
    return NextResponse.json({ error: 'Pellito is unavailable right now.' }, { status: 500 });
  }
}
