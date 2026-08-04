import { vaultStatus } from "@/lib/vault";

/** House standard (DEPLOYMENT_STANDARDS): every app exposes GET /health → 200. */
export async function GET() {
  const v = vaultStatus();
  return Response.json({
    ok: true,
    app: "mcos-workshop",
    // The storage MODE, never the path. A filesystem location has no business in an
    // HTTP response, least of all an unauthenticated one.
    storage: v.enabled ? (v.writable ? "vault:rw" : "vault:ro") : "browser",
  });
}
