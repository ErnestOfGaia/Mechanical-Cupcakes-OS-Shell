import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { BarChart3, Search, Sparkles, ChefHat, Newspaper, Terminal } from "lucide-react";

export default function Home() {
  const APPS = [
    {
      id: "pelican",
      name: "PELLITO HUB",
      icon: ChefHat,
      description: "Interactive Recipe Library",
      status: "Operational",
      color: "text-teal",
      bg: "bg-teal/10",
      border: "border-teal/20",
      href: "/pelican"
    },
    {
      id: "newshub",
      name: "News Hub World",
      icon: Newspaper,
      description: "Newsy's Comic Book of Comic Strips",
      status: "Operational",
      color: "text-violet",
      bg: "bg-violet/10",
      border: "border-violet/20",
      href: "/newshub"
    },
    {
      id: "ochi",
      name: "OCHI",
      icon: BarChart3,
      description: "Hospitality Intelligence",
      status: "Alpha-v2",
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      border: "border-blue-400/20",
      href: "/ochi"
    },
    {
      id: "scout",
      name: "SCOUT",
      icon: Search,
      description: "Interstellar Agent Discovery",
      status: "Early Stage",
      color: "text-slate-400",
      bg: "bg-slate-400/10",
      border: "border-slate-400/20",
      href: "/scout"
    }
  ];

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

        {/* App Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {APPS.map((app) => (
            <Link 
              key={app.id}
              href={app.href}
              className="group relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-b from-white/10 to-transparent rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative glass-panel rounded-[40px] p-10 h-full flex flex-col items-center text-center space-y-6 hover:bg-white/[0.03] transition-all-fast hover:-translate-y-2">
                <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center border transition-all duration-500 group-hover:scale-110", app.bg, app.border)}>
                  <app.icon className={cn("w-10 h-10", app.color)} />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-warm-white tracking-tight">{app.name}</h3>
                  <p className="text-xs text-warm-white/40 font-medium leading-relaxed">{app.description}</p>
                </div>

                <div className="pt-4 mt-auto">
                  <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border", app.border, app.color)}>
                    <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", app.id === 'pelican' ? 'bg-teal' : 'bg-violet')} />
                    {app.status}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer HUD */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-12 border-t border-white/5">
          <div className="flex items-center gap-8">
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-warm-white/20 uppercase tracking-[0.2em]">System Uptime</p>
              <p className="text-xs font-bold text-warm-white/60 font-mono tracking-tighter">428:12:04:15</p>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-warm-white/20 uppercase tracking-[0.2em]">Active Agent</p>
              <p className="text-xs font-bold text-violet flex items-center gap-2">
                <Sparkles className="w-3 h-3" /> Hoot v1.0.4
              </p>
            </div>
          </div>

          <div className="px-6 py-2 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-bold text-warm-white/30 uppercase tracking-[0.3em]">
            Access Level: <span className="text-teal">Administrator</span>
          </div>
        </div>
      </div>
    </div>
  );
}

