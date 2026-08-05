import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            // The shell shipped no frame protection at all: this config was empty,
            // there is no middleware, and Dockerfile.node runs `next start`, so
            // nothing emitted a header — the apex returned 200 with neither
            // X-Frame-Options nor CSP (audit finding, 2026-08-04). Any site could
            // iframe mechanicalcupcakes.fun and clickjack the Hoot panel and
            // Directory, with the framed sub-apps nested inside.
            //
            // 'self' is the correct ceiling here: the shell is the OUTERMOST frame
            // and is embedded by nobody. The mini-apps need a wider value because
            // the shell embeds them cross-origin — see apps/pennypost/nginx.conf
            // and apps/ochi/ochi-app/next.config.ts.
            //
            // No X-Frame-Options: it has no origin-list form, so SAMEORIGIN would
            // add nothing here and breaks the embeds where the apps use it.
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
