"use client";

export default function PostcardsApp() {
  const url = process.env.NEXT_PUBLIC_POSTCARDS_URL || "http://localhost:3001";
  
  return (
    <iframe 
      src={url}
      className="w-full h-[calc(100vh-48px)] mt-12 border-none animate-in fade-in duration-500"
      title="Postcards App"
    />
  );
}
