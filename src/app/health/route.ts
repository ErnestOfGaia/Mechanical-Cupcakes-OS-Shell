import { getKnowledgeState } from "@/lib/knowledgeState";

/**
 * House standard (DEPLOYMENT_STANDARDS): every app exposes GET /health → 200.
 * The shell was the last deployed image without one — `curl -sI
 * https://mechanicalcupcakes.fun/health` returned 404 as of 2026-08-04.
 */

// A health check must report the running container, never the build. Without
// this Next would statically prerender the route and every probe would replay a
// snapshot taken at image-build time.
export const dynamic = "force-dynamic";

export async function GET() {
  // The knowledge check moved to src/lib/knowledgeState.ts at L3 so the landing
  // HUD reads the same source rather than growing its own copy. The reasoning for
  // counting chunks instead of testing existence lives there.
  const { knowledge, chunks } = getKnowledgeState();

  // Report the STATE, never the path. A filesystem location has no business in an
  // unauthenticated HTTP response (same rule as apps/workshop/app/health/route.ts).
  return Response.json({ ok: true, app: "mcos-shell", knowledge, chunks });
}
