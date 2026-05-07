"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ScoutApp() {
  const url = process.env.NEXT_PUBLIC_SCOUT_URL || "http://localhost:3004";
  
  return (
    <div className="relative w-full h-[calc(100vh-48px)] mt-12 flex flex-col items-center justify-center animate-in fade-in duration-500 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/interstellar_garage.png"
          alt="Interstellar Garage"
          fill
          className="object-cover opacity-30"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-base-bg via-base-bg/80 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center space-y-6 text-center p-8 glass-panel rounded-3xl max-w-2xl w-full mx-4">
        <h1 className="text-4xl md:text-5xl font-black text-warm-white tracking-tight">SCOUT PROTOCOL</h1>
        <p className="text-lg text-warm-white/70 font-medium">Garage v0.1 — Interstellar Agent Discovery</p>

        <Link
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "mt-8 px-8 py-4 rounded-xl font-bold tracking-wide transition-all",
            "bg-violet hover:bg-violet/80 text-white shadow-lg shadow-violet/20 hover:shadow-violet/40 hover:-translate-y-1"
          )}
        >
          Open Local Garage
        </Link>
      </div>
    </div>
  );
}
