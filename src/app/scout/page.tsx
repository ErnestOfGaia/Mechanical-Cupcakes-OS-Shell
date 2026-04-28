"use client";

export default function ScoutApp() {
  const url = process.env.NEXT_PUBLIC_SCOUT_URL || "http://localhost:3004";
  
  return (
    <iframe 
      src={url}
      className="w-full h-[calc(100vh-48px)] mt-12 border-none animate-in fade-in duration-500"
      title="Scout Protocol"
    />
  );
}
