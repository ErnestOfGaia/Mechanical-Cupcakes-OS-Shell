"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronDown, MessageSquare } from "lucide-react";

interface TopBarProps {
  appName?: string;
  onOpenDirectory: () => void;
  onOpenHoot: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  appName = "Hoot Dashboard",
  onOpenDirectory,
  onOpenHoot,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-12 glass-top-bar z-[900] flex items-center justify-between px-4 select-none">
      <div className="flex items-center gap-3">
        <button 
          onClick={onOpenHoot}
          className="w-8 h-8 flex items-center justify-center text-xl hover:scale-110 transition-transform hover:drop-shadow-[0_0_8px_rgba(124,92,255,0.8)]"
          title="Open Hoot"
        >
          🦉
        </button>
        <div className="flex items-center gap-2">
          <Link 
            href="/"
            className="text-sm font-medium tracking-tight text-warm-white/90 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all"
            title="Return to Gateway Portal"
          >
            Mechanical Cupcakes
          </Link>
          <span className="text-sm text-warm-white/40">|</span>
          <span className="text-sm font-medium text-warm-white">{appName}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenDirectory}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-warm-white/80 hover:bg-white/5 transition-all-fast glow-violet"
        >
          Directory <ChevronDown className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onOpenHoot}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium bg-violet/20 text-violet border border-violet/30 hover:bg-violet/30 transition-all-fast glow-violet"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Chat w/ Hoot
        </button>
      </div>
    </header>
  );
};
