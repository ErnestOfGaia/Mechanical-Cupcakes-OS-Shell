import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import Markdown from "markdown-to-jsx";
import { readWriteup } from "@/lib/writeup";

/**
 * "Under the Hood" — the shell's own writeup, rendered.
 *
 * ⭐ THE ONE RULE: this page renders WRITEUP.md and does not restate it. Same
 * arrangement as The Penny Post and The Family Recipe App, which is the point — the
 * per-app writeup is the unit, and each app's page is a rendering of its own file.
 *
 * Read at build time via `force-static`. The running container never touches the
 * filesystem for this, and `markdown-to-jsx` is a devDependency whose output is
 * elements rather than a bundle, so none of it reaches the browser.
 */

export const metadata: Metadata = {
  title: "Under the Hood — Mechanical Cupcakes OS",
  description:
    "How the gallery is built and why: one registry, iframes over shared code, an agent that explains rather than operates, and the checks that were broken.",
};

export const dynamic = "force-static";

function H1({ children }: { children?: React.ReactNode }) {
  return (
    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-warm-white mb-3">
      {children}
    </h1>
  );
}

function H2({ children }: { children?: React.ReactNode }) {
  return (
    <h2 className="text-xl font-black uppercase tracking-wide text-warm-white/90 border-l-4 border-violet pl-4 mt-12 mb-4">
      {children}
    </h2>
  );
}

export default function UnderTheHood() {
  const writeup = readWriteup();

  return (
    <div className="relative min-h-[calc(100vh-48px)] px-8 py-16 overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-violet/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-3xl mx-auto space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-warm-white/30 hover:text-warm-white/60 transition-colors"
        >
          ← Back to the gallery
        </Link>

        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-warm-white/25">
          A description of the mechanism
        </p>

        <div className="writeup">
          <Markdown options={{ overrides: { h1: H1, h2: H2 } }}>{writeup}</Markdown>
        </div>

        <p className="text-[10px] text-warm-white/20 leading-relaxed pt-8 border-t border-white/5">
          This page renders <code className="text-warm-white/40">WRITEUP.md</code> from the
          repository at build time. There is one copy of it, so the page and the repo cannot
          drift apart.
        </p>
      </div>
    </div>
  );
}
