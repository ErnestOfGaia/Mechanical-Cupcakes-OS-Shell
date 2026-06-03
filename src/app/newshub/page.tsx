export default function NewsHubApp() {
  // Evaluated at runtime on the server, avoiding build-time Next.js env issues
  const url = process.env.NEWSHUB_URL || "https://news.ernestofgaia.xyz";

  return (
    <iframe
      src={url}
      className="w-full h-[calc(100vh-48px)] mt-12 border-none animate-in fade-in duration-500"
      title="News Hub World"
    />
  );
}
