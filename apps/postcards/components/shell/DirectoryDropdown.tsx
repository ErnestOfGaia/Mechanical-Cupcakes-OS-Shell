"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

interface AppEntry {
  id: string;
  name: string;
  icon: string;
  description: string;
  url: string;
}

const APPS: AppEntry[] = [
  {
    id: "hoot",
    name: "Hoot Dashboard",
    icon: "🦉",
    description: "View and explore structured data",
    url: "https://hoot.mechanicalcupcakes.fun",
  },
  {
    id: "pelican",
    name: "Pelican",
    icon: "🪶",
    description: "Interactive recipe library",
    url: "https://pelican.mechanicalcupcakes.fun",
  },
  {
    id: "postcards",
    name: "Postcards",
    icon: "💌",
    description: "Create visual messages",
    url: "https://love.mechanicalcupcakes.fun",
  },
  {
    id: "ochi",
    name: "OCHI Dashboard",
    icon: "📊",
    description: "Oregon Coastal Hospitality Intelligence",
    url: "https://ochi.mechanicalcupcakes.fun",
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
      <div className="fixed top-14 right-4 w-[300px] glass-panel glass-shadow rounded-xl z-[1000] overflow-hidden border border-white/10 animate-in fade-in slide-in-from-top-2 duration-200">
        <div className="p-4 border-b border-white/5 bg-white/5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#EAEAF0]/40">Directory</h3>
        </div>
        <div className="py-2">
          {APPS.map((app) => (
            <a
              key={app.id}
              href={app.url}
              className="flex items-start gap-3 p-4 hover:bg-white/5 transition-all duration-200 group"
            >
              <div className="text-2xl pt-0.5">{app.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#EAEAF0] group-hover:text-[#7C5CFF] transition-colors">
                    {app.name}
                  </span>
                  <ExternalLink className="w-3 h-3 text-[#EAEAF0]/20 group-hover:text-[#7C5CFF]/50" />
                </div>
                <p className="text-xs text-[#EAEAF0]/50 leading-relaxed truncate">
                  {app.description}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </>
  );
};
