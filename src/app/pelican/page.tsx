"use client";

export default function PelicanApp() {
  const url = process.env.NEXT_PUBLIC_PELICAN_URL || "http://localhost:3002";
  
  return (
    <iframe 
      src={url}
      className="w-full h-[calc(100vh-48px)] mt-12 border-none animate-in fade-in duration-500"
      title="Pelican App"
    />
  );
}
