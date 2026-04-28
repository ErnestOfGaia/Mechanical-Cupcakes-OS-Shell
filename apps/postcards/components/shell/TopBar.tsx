"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, MessageSquare } from "lucide-react";

interface TopBarProps {
  appName?: string;
  onOpenDirectory: () => void;
  onOpenHoot: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  appName = "Postcards",
  onOpenDirectory,
  onOpenHoot,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-12 glass-top-bar z-[900] flex items-center justify-between px-4 select-none">
      <div className="flex items-center gap-3 cursor-pointer" onClick={onOpenHoot}>
        <div className="w-8 h-8 flex items-center justify-center text-xl">🦉</div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium tracking-tight text-[#EAEAF0]/90">Mechanical Cupcakes</span>
          <span className="text-sm text-[#EAEAF0]/40">|</span>
          <span className="text-sm font-medium text-[#EAEAF0]">{appName}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenDirectory}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-[#EAEAF0]/80 hover:bg-white/5 transition-all duration-200 glow-violet"
        >
          Directory <ChevronDown className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onOpenHoot}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium bg-[#7C5CFF]/20 text-[#7C5CFF] border border-[#7C5CFF]/30 hover:bg-[#7C5CFF]/30 transition-all duration-200 glow-violet"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Chat w/ Hoot
        </button>
      </div>
    </header>
  );
};
