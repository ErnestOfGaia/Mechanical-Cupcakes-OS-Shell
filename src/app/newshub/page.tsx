// Render per request so NEWSHUB_URL is read from the RUNTIME environment.
//
// ⚠️ THIS FILE USED TO CLAIM IT ALREADY DID THIS. The comment below said the URL was
// "evaluated at runtime on the server" while the page had no `dynamic` directive at
// all — so Next statically prerendered it during the image build, where no .env
// exists, and baked the fallback in. The env var was inert and the comment said
// otherwise. Found 2026-09-06 while writing the shell's own writeup.
//
// It went unnoticed because every fallback happens to equal its production URL, so
// the page worked and nothing reported it. `/postcards` is the version of this bug
// that DID get noticed: it shipped a dead localhost:3001 iframe to production for
// weeks (src/app/postcards/page.tsx carries that story).
export const dynamic = "force-dynamic";

export default function NewsHubApp() {
  const url = process.env.NEWSHUB_URL || "https://news.ernestofgaia.xyz";

  return (
    <iframe
      src={url}
      className="w-full h-[calc(100vh-48px)] mt-12 border-none animate-in fade-in duration-500"
      title="News Hub World"
    />
  );
}
