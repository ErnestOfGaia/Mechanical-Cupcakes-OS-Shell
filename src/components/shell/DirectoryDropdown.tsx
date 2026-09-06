"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  getAppsByTier,
  getStatusLabel,
  type AppRegistryEntry,
} from "@/lib/appRegistry";

interface DirectoryDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * The three-tier directory (L3, 2026-09-02).
 *
 * This used to render APP_REGISTRY as one flat list, which meant a parked prototype,
 * a client's login-gated deployment and a finished public exhibit all looked like the
 * same kind of thing. The tiers say what each one actually is.
 *
 * ⛔ Private apps are LISTED, not reachable. SEAM-01 revised the earlier
 * "keep it unlisted" call: the people who have logins should be able to find them,
 * and hiding a door does not lock it.
 */
export const DirectoryDropdown: React.FC<DirectoryDropdownProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const featured = getAppsByTier("featured");
  const directory = getAppsByTier("directory");
  const priv = getAppsByTier("private");

  return (
    <>
      <div className="fixed inset-0 z-[950]" onClick={onClose} />
      <div className="fixed top-14 right-4 w-[360px] max-h-[calc(100vh-5rem)] overflow-y-auto glass-panel glass-shadow rounded-2xl z-[1000] border border-white/20 animate-in fade-in slide-in-from-top-2 duration-250 shadow-2xl">
        <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between sticky top-0 backdrop-blur-xl z-10">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-warm-white/60">System Modules</h3>
          <div className="w-1.5 h-1.5 rounded-full bg-teal shadow-[0_0_8px_rgba(46,211,183,0.8)] animate-pulse" />
        </div>

        <Section title="Featured" apps={featured} onClose={onClose} />
        <Section
          title="Directory"
          caption="Parked, client-owned, guest exhibits, and briefs with no build yet."
          apps={directory}
          onClose={onClose}
        />
        <Section
          title="Private"
          caption="Listed so the people with logins can find them. Gated on arrival."
          apps={priv}
          onClose={onClose}
        />
      </div>
    </>
  );
};

function Section({
  title,
  caption,
  apps,
  onClose,
}: {
  title: string;
  caption?: string;
  apps: AppRegistryEntry[];
  onClose: () => void;
}) {
  if (apps.length === 0) return null;

  return (
    <div className="border-b border-white/5 last:border-b-0">
      <div className="px-4 pt-3 pb-1">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-warm-white/40">
          {title} <span className="text-warm-white/20">· {apps.length}</span>
        </p>
        {caption && <p className="text-[9px] text-warm-white/25 mt-0.5 leading-relaxed">{caption}</p>}
      </div>
      <div className="p-2 pt-1 space-y-1">
        {apps.map((app) => (
          <Row key={app.id} app={app} onClose={onClose} />
        ))}
      </div>
    </div>
  );
}

function Row({ app, onClose }: { app: AppRegistryEntry; onClose: () => void }) {
  return (
    <Link href={app.route} onClick={onClose} className="block">
      <div className="flex items-start gap-4 p-3 rounded-xl transition-all-fast group border border-transparent hover:bg-white/5 hover:border-white/5">
        <div className={cn("p-2.5 rounded-lg border transition-all duration-300 shadow-sm group-hover:scale-110", app.bg, app.border)}>
          <app.icon className={cn("w-5 h-5", app.color)} />
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <span className="text-sm font-bold text-warm-white tracking-tight">{app.name}</span>
          <p className="text-[10px] text-warm-white/40 leading-relaxed font-medium">{app.description}</p>
          {app.note && (
            <p className="text-[10px] text-warm-white/25 leading-relaxed italic">{app.note}</p>
          )}
          <div className={cn("inline-flex items-center gap-1.5 mt-1 text-[8px] font-black uppercase tracking-widest", app.color)}>
            <div className={cn("w-1 h-1 rounded-full", app.status === "operational" ? "bg-teal animate-pulse" : "bg-current opacity-50")} />
            {getStatusLabel(app.status)}
            {/* Both kinds of row link, but they lead to different kinds of thing: an
                app, or a page explaining why there is no app. Saying which up front
                stops the click being a small disappointment. */}
            {!app.hasLiveApp && (
              <span className="text-warm-white/25 not-italic">· placard, not an app</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
