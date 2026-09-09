import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import Markdown from "markdown-to-jsx";
import { cn } from "@/lib/utils";
import { APP_REGISTRY, getStatusLabel } from "@/lib/appRegistry";
import { readScoutWriteup } from "@/lib/writeup";

/**
 * /scout — the headstone. Scout Protocol was deprecated on purpose (SEAM-11,
 * 2026-08-05) and its code removed on 2026-09-09. This page renders
 * apps/scout/WRITEUP.md — what it was, why it stopped, what was kept, how the
 * cleanup was done — under the registry's own card header, so the status word
 * and the note come from the same source as the gallery.
 *
 * ⭐ ONE RULE: this page renders the writeup and does not restate it. Read at
 * build time (force-static); the loader has no try/catch, so a missing file
 * fails the build rather than shipping an empty headstone.
 */

export const metadata: Metadata = {
  title: "Scout Protocol — deprecated — Mechanical Cupcakes OS",
  description:
    "A prototype about agent discovery, deprecated on purpose: what it was, why it stopped, what was worth keeping, and how the cleanup was done.",
};

export const dynamic = "force-static";

function H1({ children }: { children?: React.ReactNode }) {
  return <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-warm-white mt-2 mb-6">{children}</h2>;
}
function H2({ children }: { children?: React.ReactNode }) {
  return (
    <h3 className="text-lg font-black uppercase tracking-wide text-warm-white/90 border-l-4 border-slate-400 pl-4 mt-10 mb-3">
      {children}
    </h3>
  );
}
function P({ children }: { children?: React.ReactNode }) {
  return <p className="text-sm text-warm-white/60 leading-relaxed mb-4">{children}</p>;
}
function LI({ children }: { children?: React.ReactNode }) {
  return <li className="text-sm text-warm-white/60 leading-relaxed mb-2 ml-5 list-disc">{children}</li>;
}
function A({ children, href }: { children?: React.ReactNode; href?: string }) {
  return (
    <a href={href} className="text-slate-300 underline decoration-slate-500 hover:text-warm-white" target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}
function Code({ children }: { children?: React.ReactNode }) {
  return <code className="text-[0.9em] px-1 py-0.5 rounded bg-white/10 text-warm-white/80">{children}</code>;
}
function Strong({ children }: { children?: React.ReactNode }) {
  return <strong className="font-bold text-warm-white/85">{children}</strong>;
}

export default function ScoutHeadstone() {
  const app = APP_REGISTRY.find((a) => a.id === "scout")!;
  const writeup = readScoutWriteup();

  return (
    <div className="relative min-h-[calc(100vh-48px)] flex flex-col items-center px-8 py-16 overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-slate-400/5 rounded-full blur-[160px] pointer-events-none" />

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
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-warm-white">{app.name}</h1>
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
          </div>
          {app.note && <p className="text-base text-warm-white/60 leading-relaxed">{app.note}</p>}
        </div>

        <div className="h-px bg-white/10" />

        <article>
          <Markdown options={{ overrides: { h1: H1, h2: H2, p: P, li: LI, a: A, code: Code, strong: Strong } }}>
            {writeup}
          </Markdown>
        </article>

        <p className="text-[10px] text-warm-white/20 leading-relaxed pt-4 border-t border-white/5">
          This page is <code>apps/scout/WRITEUP.md</code>, rendered at build time. The code it describes
          is in the repository&apos;s history, linked above, and nowhere else.
        </p>
      </div>
    </div>
  );
}
