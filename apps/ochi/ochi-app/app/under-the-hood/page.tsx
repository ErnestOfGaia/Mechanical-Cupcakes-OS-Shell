import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import Markdown from "markdown-to-jsx";
import { readWriteup } from "../../lib/writeup";

/**
 * "Under the Hood" — OCHI's development and architecture writeup, rendered.
 *
 * ⭐ THE ONE RULE: this page renders WRITEUP.md and does not restate it. Same
 * arrangement as The Penny Post and the shell. If you find yourself typing prose
 * into this component, stop — it belongs in WRITEUP.md.
 *
 * Read at BUILD time (`force-static`): the running container never touches the
 * filesystem for this, and `markdown-to-jsx` is a devDependency whose output is
 * elements, so none of it reaches the browser. The dashboard itself is
 * force-dynamic; this page is the opposite on purpose — a document, not a read.
 */

export const metadata: Metadata = {
  title: "Under the Hood — OCHI",
  description:
    "How OCHI was built and why: four gatekeepers, a number that isn't oversold, three honest states, one door into the database, and a routine that fetches and asks.",
};

export const dynamic = "force-static";

/* The writeup opens with its own `#`; this page's masthead owns the h1, so that
   becomes the headline h2 — and the page title comes from the file. */
function WriteupTitle({ children }: { children?: React.ReactNode }) {
  return (
    <h2 style={{ margin: "0 0 6px", fontSize: 26, lineHeight: 1.15, fontWeight: 700, color: "var(--navy)", letterSpacing: "-.02em", textWrap: "pretty" }}>
      {children}
    </h2>
  );
}
function H2({ children }: { children?: React.ReactNode }) {
  return (
    <h3 style={{ margin: "28px 0 8px", fontSize: 17, lineHeight: 1.25, fontWeight: 700, color: "var(--navy)", letterSpacing: "-.01em", textWrap: "pretty" }}>
      {children}
    </h3>
  );
}
function P({ children }: { children?: React.ReactNode }) {
  return <p style={{ margin: "0 0 12px", fontSize: 14.5, lineHeight: 1.65, color: "var(--ink)", textWrap: "pretty" }}>{children}</p>;
}
function A({ children, href }: { children?: React.ReactNode; href?: string }) {
  const external = href?.startsWith("http");
  return (
    <a href={href} style={{ color: "var(--action)", fontWeight: 600, textDecoration: "none" }}
      {...(external && { target: "_blank", rel: "noopener noreferrer" })}>
      {children}
    </a>
  );
}
function Code({ children }: { children?: React.ReactNode }) {
  return (
    <code style={{ fontSize: "0.92em", padding: "1px 5px", borderRadius: 4, background: "var(--soft-navy)", color: "var(--navy)" }}>
      {children}
    </code>
  );
}
function Strong({ children }: { children?: React.ReactNode }) {
  return <strong style={{ fontWeight: 700, color: "var(--navy)" }}>{children}</strong>;
}

export default function UnderTheHood() {
  const writeup = readWriteup();

  return (
    <div className="ochi-app">
      <main className="ochi-col">
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2px 2px 0" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 9, height: 9, borderRadius: "2px 9px 9px 9px", background: "var(--navy)", flex: "none" }} />
              <span style={{ fontSize: 18, fontWeight: 700, color: "var(--navy)", letterSpacing: ".02em" }}>OCHI</span>
            </div>
            <div style={{ fontSize: 12.5, color: "var(--taupe)", marginTop: 3, marginLeft: 17 }}>
              Under the hood · a description of the mechanism
            </div>
          </div>
          <Link href="/" style={{
            display: "inline-flex", alignItems: "center", padding: "8px 12px", borderRadius: 999,
            background: "var(--card)", border: "1px solid var(--hairline-strong)", color: "var(--action)",
            fontSize: 12.5, fontWeight: 600, textDecoration: "none",
          }}>
            ← Dashboard
          </Link>
        </header>

        <article className="ochi-card" style={{ padding: "22px 20px 18px" }}>
          <Markdown
            options={{
              overrides: {
                h1: WriteupTitle,
                h2: H2,
                p: P,
                a: A,
                code: Code,
                strong: Strong,
              },
            }}
          >
            {writeup}
          </Markdown>
        </article>

        <footer style={{ textAlign: "center", padding: "6px 0 4px", fontSize: 11.5, color: "var(--st-nodata)", lineHeight: 1.6 }}>
          One source, two surfaces: this page is <code>apps/ochi/ochi-app/WRITEUP.md</code>, rendered at build time.
        </footer>
      </main>
    </div>
  );
}
