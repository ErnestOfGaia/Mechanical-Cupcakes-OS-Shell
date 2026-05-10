"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { APP_REGISTRY, getStatusLabel } from "@/lib/appRegistry";

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
          {APP_REGISTRY.map((app) => (
            <Link key={app.id} href={app.route} onClick={onClose} className="block">
              <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-all-fast group border border-transparent hover:border-white/5">
                <div className={cn("p-2.5 rounded-lg border transition-all duration-300 group-hover:scale-110 shadow-sm", app.bg, app.border)}>
                  <app.icon className={cn("w-5 h-5", app.color)} />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-warm-white tracking-tight">
                      {app.name}
                    </span>
                  </div>
                  <p className="text-[10px] text-warm-white/40 leading-relaxed font-medium">
                    {app.description}
                  </p>
                  <div className={cn("inline-flex items-center gap-1.5 mt-1 text-[8px] font-black uppercase tracking-widest", app.color)}>
                    <div className={cn("w-1 h-1 rounded-full", app.status === "operational" ? "bg-teal animate-pulse" : "bg-current opacity-50")} />
                    {getStatusLabel(app.status)}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};
