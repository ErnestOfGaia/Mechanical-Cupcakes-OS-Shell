import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output so the app can ship as its own container, per the MCOS
  // invariant that sub-apps keep working on their own subdomain.
  output: "standalone",
};

export default nextConfig;
