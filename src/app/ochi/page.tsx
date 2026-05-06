export default function OchiApp() {
  // Evaluated at runtime on the server, avoiding build-time Next.js env issues
  const url = process.env.OCHI_URL || "https://ochi.mechanicalcupcakes.fun";
  
  return (
    <iframe 
      src={url}
      className="w-full h-[calc(100vh-48px)] mt-12 border-none animate-in fade-in duration-500"
      title="OCHI Dashboard"
    />
  );
}
