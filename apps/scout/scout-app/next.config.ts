import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      root: path.resolve(__dirname, "../../.."),
    },
  },
};

export default nextConfig;
