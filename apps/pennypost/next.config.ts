import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: The Penny Post has no server, no API routes, no database and no
  // secrets. It ships as a folder of HTML/JS/CSS with zero runtime — that is a
  // deliberate property of the app, not a deployment convenience: "nothing leaves
  // your browser" is only verifiable if there is nothing on the other end to leave
  // to. It rides in a thin nginx:alpine container (see Dockerfile) only so it can
  // reuse the shell's existing GHCR→compose→NPM pipeline; the app itself still
  // makes zero server-side requests and reads zero env vars or secrets.
  output: "export",

  // Multi-page export (this is not an SPA): without this, /about exports as
  // about.html and a bare `try_files $uri $uri/ /index.html` fallback silently
  // serves the homepage for it instead of 404ing or resolving. trailingSlash emits
  // about/index.html so any static server's directory-index behavior finds it.
  trailingSlash: true,

  // No next/image anywhere — the card fronts are inline SVG. Set explicitly so a future
  // <Image> import fails loudly at build rather than silently needing an optimiser that
  // a static export cannot run.
  images: { unoptimized: true },
};

export default nextConfig;
