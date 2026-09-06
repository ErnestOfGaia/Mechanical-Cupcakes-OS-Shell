import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cn } from "@/lib/utils";
import { APP_REGISTRY, getStatusLabel } from "@/lib/appRegistry";

/**
 * A placard: a card for something real that you cannot open.
 *
 * The gallery's rule is that it tells the truth about state. A project with a brief
 * and no build, or a finished tool that is deliberately not deployed, is a real thing
 * — so it gets a card. What it does not get is a link, because a link promises a
 * destination.
 *
 * ⭐ Everything here is rendered from the registry entry. There is no second copy of
 * a placard's description anywhere, which is the same rule L3 applied to the landing
 * grid after its hardcoded array drifted away from APP_REGISTRY.
 */
export function Placard({ id }: { id: string }) {
  const app = APP_REGISTRY.find((a) => a.id === id);

  // A placard route for an id that is not in the registry is a bug, not a 404 to
  // paper over — but shipping a crash is worse than shipping a not-found.
  if (!app) notFound();

  return (
    <div className="relative min-h-[calc(100vh-48px)] flex flex-col items-center px-8 py-16 overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-violet/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl space-y-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-warm-white/30 hover:text-warm-white/60 transition-colors"
        >
          ← Back to the gallery
        </Link>

        <div className="space-y-6">
          <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center border", app.bg, app.border)}>
            <app.icon className={cn("w-10 h-10", app.color)} />
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-warm-white">
              {app.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={cn(
                  "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                  app.border,
                  app.color,
                )}
              >
                <div className={cn("w-1.5 h-1.5 rounded-full", app.color.replace("text-", "bg-"))} />
                {getStatusLabel(app.status)}
              </span>
              {!app.hasLiveApp && (
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-warm-white/25">
                  Nothing to open
                </span>
              )}
            </div>
          </div>

          <p className="text-base text-warm-white/60 leading-relaxed">{app.description}</p>
        </div>

        <div className="h-px bg-white/10" />

        <div className="space-y-5">
          {(app.placardBody ?? []).map((para, i) => (
            <p key={i} className="text-sm text-warm-white/50 leading-relaxed">
              {para}
            </p>
          ))}
        </div>

        {app.note && (
          <div className="glass-panel rounded-2xl p-6 border border-white/10">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-warm-white/30 mb-2">
              Where it stands
            </p>
            <p className="text-sm text-warm-white/50 leading-relaxed">{app.note}</p>
          </div>
        )}

        <p className="text-[10px] text-warm-white/20 leading-relaxed pt-4 border-t border-white/5">
          This is a placard rather than an exhibit. It is listed because the gallery should be
          honest about what exists, including the parts that are not finished, not deployed, or
          not built at all yet.
        </p>
      </div>
    </div>
  );
}
