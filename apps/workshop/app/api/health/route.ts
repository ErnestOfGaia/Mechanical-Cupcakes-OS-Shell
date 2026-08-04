import { vaultStatus } from "@/lib/vault";

/** House standard: every app exposes GET /health → 200. */
export async function GET() {
  const v = vaultStatus();
  return Response.json({
    ok: true,
    app: "mcos-workshop",
    // Report the vault as a mode, never the path — the path is a local filesystem
    // location and has no business in an HTTP response.
    storage: v.enabled ? (v.writable ? "vault:rw" : "vault:ro") : "browser",
  });
}
