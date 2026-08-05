import type { NextConfig } from "next";
import path from "node:path";

// Two build environments, two roots. In the monorepo the workspace root is three
// levels up (Next warns and mis-traces otherwise). In the Docker build the
// context IS this app — there is no monorepo above /app — and pointing the root
// above the project would make `output: "standalone"` nest its tree by the app's
// repo path, so the Dockerfile sets NEXT_DOCKER_BUILD=1 and gets the app dir.
const inDockerBuild = process.env.NEXT_DOCKER_BUILD === "1";
const workspaceRoot = inDockerBuild ? __dirname : path.resolve(__dirname, "../../..");

const nextConfig: NextConfig = {
  // Standalone only in the image: it is what lets the runtime stage carry
  // server.js + traced node_modules instead of the full source tree and
  // devDependencies (audit finding, 2026-08-04). Not set locally — `next start`
  // does not serve a standalone build, and dev flow is unchanged.
  ...(inDockerBuild ? { output: "standalone" as const } : {}),
  outputFileTracingRoot: workspaceRoot,
  turbopack: {
    root: workspaceRoot,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            // OCHI is embedded cross-origin by the shell (src/app/ochi/page.tsx)
            // but served no frame headers of its own, so any site could frame and
            // re-skin the pilot client-facing dashboard — including nesting it
            // inside a framed copy of the shell (audit finding, 2026-08-04).
            //
            // The apex must be named explicitly: ochi.mechanicalcupcakes.fun is a
            // different origin to mechanicalcupcakes.fun, so 'self' alone would
            // block the shell embed outright. Same reason apps/pennypost/nginx.conf
            // omits X-Frame-Options — SAMEORIGIN has no origin-list form and would
            // break the embed.
            //
            // The www entry matches the canonical string already shipped by
            // pennypost so all apps carry one value. ⚠️ The 2026-08-04 audit found
            // www.mechanicalcupcakes.fun has no NPM host and fails TLS — the token
            // is inert until Ernest either adds a www host that 301s to the apex or
            // drops www from both files. Tracked as a Phase 4 item.
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://mechanicalcupcakes.fun https://www.mechanicalcupcakes.fun",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
