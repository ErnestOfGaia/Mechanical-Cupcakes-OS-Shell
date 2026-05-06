import { NextRequest, NextResponse } from 'next/server';
import { validateCredentials, signSession, COOKIE_NAME, ROLE_LABELS } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (typeof username !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
    }

    const role = validateCredentials(username, password);
    if (!role) {
      return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
    }

    // Record anonymous session start for analytics dashboard
    const session = await prisma.roleSession.create({ data: { role } });

    const res = NextResponse.json({
      ok: true,
      role,
      label: ROLE_LABELS[role],
      sessionId: session.id,
    });

    // Session cookie — no maxAge means it expires when the browser closes
    res.cookies.set(COOKIE_NAME, await signSession(role), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    // Store session ID in a separate cookie so logout can close it in the DB
    res.cookies.set('pellito_sid', session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return res;
  } catch (err) {
    console.error('[auth/login]', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
