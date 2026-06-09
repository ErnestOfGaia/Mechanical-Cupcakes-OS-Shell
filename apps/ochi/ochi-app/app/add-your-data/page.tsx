"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  parseLodgingCsv,
  computeTeaser,
  LODGING_TEMPLATE_CSV,
  TEASER_STORAGE_KEY,
} from "../../lib/lodgingUpload";
import { Eyebrow } from "../../components/ochi/primitives";

// A richer in-browser sample so a curious lead can see the teaser without a file.
const SAMPLE_CSV =
  "week_ending,occupancy_pct,sales\n" +
  [
    ["2025-01-11", 28, 6100], ["2025-01-18", 31, 6650], ["2025-02-15", 44, 9200],
    ["2025-03-22", 52, 11800], ["2025-04-19", 61, 14100], ["2025-05-10", 58, 13200],
    ["2025-05-24", 73, 17600], ["2025-06-07", 68, 14200], ["2025-06-21", 81, 19300],
    ["2025-07-05", 96, 26400], ["2025-07-19", 92, 24800], ["2025-08-16", 88, 23100],
    ["2025-09-06", 79, 19800], ["2025-09-20", 64, 15050], ["2025-10-11", 47, 10200],
    ["2025-11-15", 35, 7600], ["2025-12-06", 41, 8900], ["2025-12-27", 69, 16200],
  ].map((r) => r.join(",")).join("\n");

const TEMPLATE_HREF = "data:text/csv;charset=utf-8," + encodeURIComponent(LODGING_TEMPLATE_CSV);

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <section className="ochi-card" style={{ padding: "18px 18px", ...style }}>{children}</section>;
}

export default function AddYourData() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  function ingest(text: string) {
    const parsed = parseLodgingCsv(text);
    const teaser = computeTeaser(parsed);
    if (!teaser) {
      setWarnings(parsed.warnings.length ? parsed.warnings : ["We couldn't read any weekly rows from that file."]);
      return;
    }
    sessionStorage.setItem(TEASER_STORAGE_KEY, JSON.stringify(teaser));
    router.push("/your-read");
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setWarnings([]);
    ingest(await file.text());
  }

  return (
    <div className="ochi-app">
      <main className="ochi-col" style={{ gap: 18 }}>
        <header style={{ padding: "2px 2px 0" }}>
          <Link href="/" style={{ fontSize: 12.5, color: "var(--action)", fontWeight: 600, textDecoration: "none" }}>
            ← OCHI dashboard
          </Link>
          <h1 style={{ margin: "10px 0 0", fontSize: 25, fontWeight: 700, color: "var(--navy)", letterSpacing: "-.02em", lineHeight: 1.1 }}>
            See OCHI&apos;s read on <span style={{ color: "var(--terracotta)" }}>your</span> numbers.
          </h1>
          <p style={{ margin: "8px 0 0", fontSize: 15, lineHeight: 1.55, color: "var(--taupe)", textWrap: "pretty" }}>
            Run a <strong>rental property</strong>? Bring your <strong>occupancy rate</strong> by season. Run a{" "}
            <strong>restaurant</strong>? Bring your <strong>weekly sales</strong> from past years. OCHI reads your own
            history and turns the lagging public baseline into a read tuned to <em>your</em> business.
          </p>
        </header>

        <Card>
          <Eyebrow style={{ color: "var(--action)" }}>Your data stays yours</Eyebrow>
          <p style={{ margin: "8px 0 0", fontSize: 14, lineHeight: 1.55, color: "var(--ink)", textWrap: "pretty" }}>
            Your file is read and analyzed <strong>entirely in your browser</strong>. It is never uploaded to a
            server, never stored, and never shared. Close the tab and it's gone.
          </p>
        </Card>

        <Card>
          <Eyebrow>How to format it</Eyebrow>
          <p style={{ margin: "8px 0 10px", fontSize: 13.5, lineHeight: 1.5, color: "var(--taupe)" }}>
            A simple weekly CSV — one row per week, with a header row. Give us{" "}
            <strong>occupancy, sales, or both</strong>; include whichever you track.
          </p>
          <div style={{ overflowX: "auto", border: "1px solid var(--hairline)", borderRadius: 8 }}>
            <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12.5, fontVariantNumeric: "tabular-nums" }}>
              <thead>
                <tr style={{ background: "var(--soft-navy)", color: "var(--navy)", textAlign: "left" }}>
                  <th style={{ padding: "8px 11px", fontWeight: 700 }}>week_ending</th>
                  <th style={{ padding: "8px 11px", fontWeight: 700 }}>occupancy_pct</th>
                  <th style={{ padding: "8px 11px", fontWeight: 700 }}>sales</th>
                </tr>
              </thead>
              <tbody style={{ color: "var(--ink)" }}>
                {[["2025-06-07", "68", "14200"], ["2025-06-14", "74", "16850"], ["2025-06-21", "81", "19300"]].map((r) => (
                  <tr key={r[0]} style={{ borderTop: "1px solid var(--hairline)" }}>
                    {r.map((c, i) => <td key={i} style={{ padding: "7px 11px" }}>{c}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul style={{ margin: "11px 0 0", paddingLeft: 18, fontSize: 12.5, lineHeight: 1.6, color: "var(--taupe)" }}>
            <li><strong>week_ending</strong> — the date the week ends (any clear date format)</li>
            <li><strong>occupancy_pct</strong> — average occupancy that week, 0–100 (what rental properties track by season)</li>
            <li><strong>sales</strong> — total sales for the week, in dollars (what restaurants track year over year)</li>
            <li>Include <strong>at least one</strong> of occupancy or sales — both is even better.</li>
          </ul>
          <a href={TEMPLATE_HREF} download="ochi-data-template.csv"
            style={{ display: "inline-block", marginTop: 12, fontSize: 13, color: "var(--action)", fontWeight: 600, textDecoration: "none" }}>
            ↓ Download a blank template
          </a>
        </Card>

        <Card style={{ background: "var(--soft-navy)", borderColor: "var(--soft-navy-line)" }}>
          <Eyebrow style={{ color: "var(--action)" }}>Upload &amp; see your read</Eyebrow>
          <p style={{ margin: "8px 0 12px", fontSize: 13.5, lineHeight: 1.5, color: "var(--navy)" }}>
            Pick your CSV — it's analyzed instantly, right here in your browser.
          </p>
          <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={onFile} style={{ display: "none" }} />
          <button onClick={() => fileRef.current?.click()}
            style={{ width: "100%", padding: "12px 14px", borderRadius: 8, background: "var(--action)", color: "#fff", border: "none", font: "inherit", fontSize: 14.5, fontWeight: 700, cursor: "pointer" }}>
            Add CSV Data Now
          </button>
          <button onClick={() => ingest(SAMPLE_CSV)}
            style={{ width: "100%", marginTop: 9, padding: "9px 14px", borderRadius: 8, background: "transparent", color: "var(--action)", border: "1px solid var(--soft-navy-line)", font: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            No file handy? See it with sample data
          </button>
          {warnings.length > 0 && (
            <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 7, background: "var(--st-risk-soft)", color: "var(--st-risk-ink)", fontSize: 12.5, lineHeight: 1.5 }}>
              {warnings.map((w, i) => <div key={i}>{w}</div>)}
            </div>
          )}
        </Card>

        <footer style={{ textAlign: "center", padding: "4px 0", fontSize: 11.5, color: "var(--st-nodata)", lineHeight: 1.5 }}>
          A preview of what OCHI reads from your numbers. Nothing is stored.
        </footer>
      </main>
    </div>
  );
}
