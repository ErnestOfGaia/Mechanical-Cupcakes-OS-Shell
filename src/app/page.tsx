import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Sparkles, Terminal } from "lucide-react";
import {
  getFeaturedApps,
  getAppsByTier,
  getStatusLabel,
  type AppRegistryEntry,
} from "@/lib/appRegistry";
import { getKnowledgeState, describeKnowledge } from "@/lib/knowledgeState";

/**
 * The landing grid.
 *
 * ⭐ L3 (2026-09-02) DELETED THE HARDCODED `APPS` ARRAY THAT USED TO LIVE HERE.
 * It duplicated APP_REGISTRY and the two drifted: they disagreed on ids (`pelican`
 * here vs `pellito` there), on names, on icons, on descriptions, and on statuses —
 * one of which ("Live Demo") was not even a member of the registry's own type union.
 * Registering an app is now one edit, which is exit criterion 2 of the Last Mile.
 *
 * Rendered per request so the HUD reports the RUNNING container rather than replaying
 * a snapshot taken at image-build time — the same reasoning as /health, and the same
 * trap that shipped a dead localhost iframe to production for weeks.
 */
export const dynamic = "force-dynamic";

export default function Home() {
  // Throws at build if this is not exactly three. See getFeaturedApps.
  const featured = getFeaturedApps();
  const directory = getAppsByTier("directory");
  const priv = getAppsByTier("private");
  const queued = directory.filter((a) => a.status === "queued");

  const knowledge = getKnowledgeState();

  return (
    <div className="relative min-h-[calc(100vh-48px)] flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="scanning-beam" />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-6xl space-y-16">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-warm-white/40 text-[10px] font-bold uppercase tracking-[0.3em] crt-flicker">
            <Terminal className="w-3.5 h-3.5" /> Mechanical Cupcakes OS | Root Module
          </div>
          <div className="space-y-2">
            <h1 className="text-8xl font-black tracking-tighter text-warm-white flex items-center justify-center gap-4">
              <span className="opacity-20 select-none">[</span>
              MCOS
              <span className="opacity-20 select-none">]</span>
            </h1>
            <div className="flex items-center justify-center gap-2">
              <p className="text-sm font-bold text-violet uppercase tracking-[0.4em] typewriter">Initializing Gateway Portal...</p>
            </div>
          </div>
        </div>

        {/* Featured — exactly three, by ruling */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featured.map((app) => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>

        {/* Everything else, honestly */}
        <div className="text-center">
          <p className="text-[10px] font-bold text-warm-white/30 uppercase tracking-[0.25em]">
            {directory.length} more in the directory
            {queued.length > 0 && ` · ${queued.length} queued`}
            {priv.length > 0 && ` · ${priv.length} private`}
          </p>
          <p className="text-[10px] text-warm-white/20 mt-1.5">
            Open the Directory in the top bar to see them all, including the ones that are
            parked, client-owned, or not built yet.
          </p>
        </div>

        {/* Footer HUD */}
        {/*
          ⭐ L3 HUD TRUTH PASS. This block used to show three things that were not true:
            · "System Uptime  428:12:04:15" — a hardcoded string, not a counter
            · "Active Agent   Hoot v1.0.4"  — a version number corresponding to nothing
            · "Access Level: Administrator" — on a public, unauthenticated page

          The third was the worst of them. Theme flavour that claims the visitor is
          signed in as an admin reads as a lie about the system, on the one surface the
          Last Mile plan says must never lie. All three are replaced by values derived
          from the registry and from the real brain state, both of which can be wrong
          out loud rather than plausible and fixed.
        */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-12 border-t border-white/5">
          <div className="flex items-center gap-8">
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-warm-white/20 uppercase tracking-[0.2em]">Exhibits</p>
              <p className="text-xs font-bold text-warm-white/60 font-mono tracking-tighter">
                {featured.length} featured · {directory.length} directory · {priv.length} private
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-warm-white/20 uppercase tracking-[0.2em]">Hoot</p>
              <p className="text-xs font-bold text-violet flex items-center gap-2">
                <Sparkles className="w-3 h-3" /> {describeKnowledge(knowledge)}
              </p>
            </div>
          </div>

          <div className="px-6 py-2 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-bold text-warm-white/30 uppercase tracking-[0.3em]">
            Public gallery · <span className="text-teal">no sign-in</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppCard({ app }: { app: AppRegistryEntry }) {
  const inner = (
    <>
      <div className="absolute -inset-0.5 bg-gradient-to-b from-white/10 to-transparent rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative glass-panel rounded-[40px] p-10 h-full flex flex-col items-center text-center space-y-6 hover:bg-white/[0.03] transition-all-fast hover:-translate-y-2">
        <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center border transition-all duration-500 group-hover:scale-110", app.bg, app.border)}>
          <app.icon className={cn("w-10 h-10", app.color)} />
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-black text-warm-white tracking-tight uppercase">{app.name}</h3>
          <p className="text-xs text-warm-white/40 font-medium leading-relaxed">{app.description}</p>
        </div>

        <div className="pt-4 mt-auto space-y-2">
          <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border", app.border, app.color)}>
            <div className={cn("w-1.5 h-1.5 rounded-full", app.status === "operational" ? "animate-pulse" : "", app.color.replace("text-", "bg-"))} />
            {getStatusLabel(app.status)}
          </div>
          {app.note && (
            <p className="text-[10px] text-warm-white/30 leading-relaxed max-w-[22rem]">{app.note}</p>
          )}
        </div>
      </div>
    </>
  );

  // A placard is a card, not a door. Rendering it as a link would promise a
  // destination that does not exist.
  if (!app.hasLiveApp) {
    return <div className="group relative cursor-default">{inner}</div>;
  }

  return (
    <Link href={app.route} className="group relative">
      {inner}
    </Link>
  );
}
