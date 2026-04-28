"use client";

export default function OchiApp() {
  const url = process.env.NEXT_PUBLIC_OCHI_URL || "http://localhost:3003";
  
  return (
    <iframe 
      src={url}
      className="w-full h-[calc(100vh-48px)] mt-12 border-none animate-in fade-in duration-500"
      title="OCHI Dashboard"
    />
  );
}
