import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAME } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  // Mark the RoleSession as ended in the DB (for accurate analytics)
  const sid = req.cookies.get('pellito_sid')?.value;
  if (sid) {
    try {
      await prisma.roleSession.update({
        where: { id: sid },
        data: { endedAt: new Date() },
      });
    } catch {
      // Session may already be gone — not a fatal error
    }
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE_NAME);
  res.cookies.delete('pellito_sid');
  return res;
}
