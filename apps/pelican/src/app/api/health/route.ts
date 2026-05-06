import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Lightweight DB probe — just check connectivity
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status:    'ok',
      service:   'pellito',
      db:        'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[health] DB check failed:', err);
    return NextResponse.json(
      { status: 'error', service: 'pellito', db: 'unreachable', timestamp: new Date().toISOString() },
      { status: 503 }
    );
  }
}
