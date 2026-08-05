/**
 * House standard (DEPLOYMENT_STANDARDS): every app exposes GET /health → 200.
 * OCHI had no health route and no compose healthcheck, so a hung-but-running
 * Next process was indistinguishable from a healthy one and NPM kept routing to
 * it (audit finding, 2026-08-04). `restart: unless-stopped` covers a crash; it
 * does not cover a hang.
 */

// Must reflect the running container, not the build — without this Next would
// statically prerender the route and every probe would replay a build-time answer.
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ ok: true, app: "mcos-ochi" });
}
