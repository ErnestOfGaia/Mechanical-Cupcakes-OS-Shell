// Render per request so RECIPES_URL is read from the RUNTIME environment (the VPS
// .env via compose env_file). Without this the page is statically prerendered during
// the image build — where no .env exists — and the fallback URL gets baked in, making
// the VPS env var silently inert. src/app/postcards/page.tsx carries the full story:
// that trap shipped a dead localhost:3001 iframe to production for weeks.
export const dynamic = "force-dynamic";

export default function FamilyRecipeApp() {
  // Evaluated at runtime on the server. ⛔ Must NOT become a "use client" component
  // reading a NEXT_PUBLIC_* var — those are inlined into the client bundle at image
  // build time, which is the exact failure mode this comment block exists to prevent.
  //
  // ⚠️ The fallback happens to equal the production URL, so a missing RECIPES_URL
  // fails silently rather than loudly. Define it explicitly in the VPS .env and in
  // compose — the same gap NEWSHUB_URL still has.
  const url = process.env.RECIPES_URL || "https://recipes.mechanicalcupcakes.fun";

  return (
    <iframe
      src={url}
      className="w-full h-[calc(100vh-48px)] mt-12 border-none animate-in fade-in duration-500"
      title="The Family Recipe App"
    />
  );
}
