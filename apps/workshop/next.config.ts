import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output so the app can ship as its own container, per the MCOS
  // invariant that sub-apps keep working on their own subdomain.
  output: "standalone",

  // This app's whole point is running locally against the vault, and browsers
  // increasingly force http://localhost to https. Reaching it as 127.0.0.1 is the
  // reliable way in — but Next then treats dev resources as cross-origin and the
  // client never hydrates, leaving the page stuck on its loading line. Dev only;
  // it has no effect on a built image.
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
