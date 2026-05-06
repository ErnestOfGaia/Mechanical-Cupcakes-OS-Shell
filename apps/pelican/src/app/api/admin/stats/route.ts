/**
 * GET /api/admin/stats
 * Returns anonymous usage metrics for the admin dashboard.
 * Protected — requires admin role session.
 *
 * Adding new metrics in the future: add a new key to the JSON response below.
 * The dashboard reads this endpoint and renders whatever keys it finds.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifySession, COOKIE_NAME } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const cookieValue = req.cookies.get(COOKIE_NAME)?.value;
  const role = cookieValue ? await verifySession(cookieValue) : null;
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }

  const now       = new Date();
  const todayStart = new Date(now); todayStart.setHours(0,0,0,0);
  const weekStart  = new Date(now); weekStart.setDate(now.getDate() - 7);

  const [
    activeSessions,
    sessionsByRoleToday,
    sessionsByRoleWeek,
    totalSessionsAllTime,
    recipeCount,
    publishedRecipeCount,
    recentMetrics,
    avgQuizScoreByRole,
  ] = await Promise.all([

    // Currently active (no endedAt)
    prisma.roleSession.groupBy({
      by: ['role'],
      where: { endedAt: null },
      _count: { id: true },
    }),

    // Sessions started today, grouped by role
    prisma.roleSession.groupBy({
      by: ['role'],
      where: { startedAt: { gte: todayStart } },
      _count: { id: true },
    }),

    // Sessions in the last 7 days, grouped by role
    prisma.roleSession.groupBy({
      by: ['role'],
      where: { startedAt: { gte: weekStart } },
      _count: { id: true },
    }),

    // All-time session count
    prisma.roleSession.count(),

    // Total recipes
    prisma.masterRecipes.count(),

    // Published recipes
    prisma.masterRecipes.count({ where: { status: 'published' } }),

    // 10 most recent quiz results
    prisma.metric.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: { role: true, language: true, quiz_score: true, createdAt: true },
    }),

    // Average quiz score grouped by role
    prisma.metric.groupBy({
      by: ['role'],
      _avg: { quiz_score: true },
      _count: { id: true },
    }),
  ]);

  return NextResponse.json({
    generatedAt: now.toISOString(),
    activeSessions,
    sessionsByRoleToday,
    sessionsByRoleWeek,
    totalSessionsAllTime,
    recipes: { total: recipeCount, published: publishedRecipeCount },
    quiz: { recentResults: recentMetrics, averageByRole: avgQuizScoreByRole },
  });
}
