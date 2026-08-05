import { existsSync } from "node:fs";
import path from "node:path";

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
  // Hoot's RAG index is the shell's one runtime file dependency (src/lib/brain.ts
  // resolves it through process.cwd() on every lookup). A missing brain.json does
  // not stop the OS serving, so it must not fail the check — but it degrades Hoot
  // silently, which is exactly the failure worth surfacing here.
  const knowledge = existsSync(path.join(process.cwd(), "public", "brain.json"))
    ? "loaded"
    : "missing";

  // Report the STATE, never the path. A filesystem location has no business in an
  // unauthenticated HTTP response (same rule as apps/workshop/app/health/route.ts).
  return Response.json({ ok: true, app: "mcos-shell", knowledge });
}
