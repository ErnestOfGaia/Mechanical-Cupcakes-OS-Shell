"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ExternalLink, Terminal, ChefHat, Heart, BarChart3, Radio } from "lucide-react";

interface AppEntry {
  id: string;
  name: string;
  icon: any;
  description: string;
  url: string;
  status: string;
  color: string;
  bg: string;
  border: string;
  isExternal?: boolean;
}

const APPS: AppEntry[] = [
  {
    id: "hoot",
    name: "Gateway Portal",
    icon: Terminal,
    description: "System Entry & Control",
    url: "/",
    status: "Operational",
    color: "text-warm-white",
    bg: "bg-white/5",
    border: "border-white/10",
  },
  {
    id: "pelican",
    name: "Pelican",
    icon: ChefHat,
    description: "Interactive Recipe Library",
    url: "/pelican",
    status: "Operational",
    color: "text-teal",
    bg: "bg-teal/10",
    border: "border-teal/20",
  },
  {
    id: "postcards",
    name: "Postcards",
    icon: Heart,
    description: "Creative Visual Messages",
    url: "/postcards",
    status: "Standby",
    color: "text-violet",
    bg: "bg-violet/10",
    border: "border-violet/20",
  },
  {
    id: "ochi",
    name: "OCHI",
    icon: BarChart3,
    description: "Hospitality Intelligence",
    url: "/ochi",
    status: "Alpha-v2",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
  },
  {
    id: "scout",
    name: "Scout Protocol",
    icon: Radio,
    description: "Decentralized Infrastructure",
    url: "https://scout.mechanicalcupcakes.fun",
    status: "Dev",
    color: "text-slate-400",
    bg: "bg-slate-400/10",
    border: "border-slate-400/20",
    isExternal: true,
  },
];

interface DirectoryDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DirectoryDropdown: React.FC<DirectoryDropdownProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[950]" onClick={onClose} />
      <div className="fixed top-14 right-4 w-[340px] glass-panel glass-shadow rounded-2xl z-[1000] overflow-hidden border border-white/20 animate-in fade-in slide-in-from-top-2 duration-250 shadow-2xl">
        <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-warm-white/60">System Modules</h3>
          <div className="w-1.5 h-1.5 rounded-full bg-teal shadow-[0_0_8px_rgba(46,211,183,0.8)] animate-pulse" />
        </div>
        <div className="p-2 space-y-1">
          {APPS.map((app) => {
            const Content = (
              <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-all-fast group border border-transparent hover:border-white/5">
                <div className={cn("p-2.5 rounded-lg border transition-all duration-300 group-hover:scale-110 shadow-sm", app.bg, app.border)}>
                  <app.icon className={cn("w-5 h-5", app.color)} />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-warm-white tracking-tight">
                      {app.name}
                    </span>
                    {app.isExternal && <ExternalLink className="w-3 h-3 text-warm-white/20" />}
                  </div>
                  <p className="text-[10px] text-warm-white/40 leading-relaxed font-medium">
                    {app.description}
                  </p>
                  <div className={cn("inline-flex items-center gap-1.5 mt-1 text-[8px] font-black uppercase tracking-widest", app.color)}>
                    <div className={cn("w-1 h-1 rounded-full", app.status === "Operational" ? "bg-teal animate-pulse" : "bg-current opacity-50")} />
                    {app.status}
                  </div>
                </div>
              </div>
            );

            return app.isExternal ? (
              <a key={app.id} href={app.url} target="_blank" rel="noopener noreferrer" onClick={onClose} className="block">
                {Content}
              </a>
            ) : (
              <Link key={app.id} href={app.url} onClick={onClose} className="block">
                {Content}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};
