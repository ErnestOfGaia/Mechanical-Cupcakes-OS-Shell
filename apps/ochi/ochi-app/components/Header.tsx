import React from "react";

export function Header() {
  return (
    <header className="py-4 border-b border-gray-200">
      <h1 className="text-2xl font-black tracking-tight uppercase" aria-label="OCHI Dashboard">OCHI</h1>
      <div className="flex items-center gap-2 mt-1">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest" aria-label="Pacific City Pilot Live Data Feed">
          Pacific City Pilot | Live Data Feed
        </p>
      </div>
    </header>
  );
}
