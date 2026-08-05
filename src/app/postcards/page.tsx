// Render per request so POSTCARDS_URL is read from the RUNTIME environment (the
// VPS .env via compose env_file). Without this the page is statically prerendered
// during the image build — where no .env exists — and the fallback URL gets baked
// in, making the VPS env var silently inert. (The other iframe pages share this
// latent trap; their fallbacks happen to equal their production URLs.)
export const dynamic = "force-dynamic";

export default function PennyPostApp() {
  // Evaluated at runtime on the server, avoiding build-time Next.js env issues.
  // NOTE: must NOT be a "use client" component reading a NEXT_PUBLIC_* var —
  // those are inlined into the client bundle at image build time, where no .env
  // exists, which is exactly how this page shipped a dead localhost:3001 iframe
  // to production for weeks. src/app/ochi/page.tsx is the reference pattern.
  const url = process.env.POSTCARDS_URL || "https://pennypost.mechanicalcupcakes.fun";

  return (
    <iframe
      src={url}
      className="w-full h-[calc(100vh-48px)] mt-12 border-none animate-in fade-in duration-500"
      title="The Penny Post"
    />
  );
}
