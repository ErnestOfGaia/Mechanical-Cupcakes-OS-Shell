import React from "react";
import Link from "next/link";
import { Header } from "../components/Header";
import { PrimaryIndicator } from "../components/PrimaryIndicator";
import { SignalGrid } from "../components/SignalGrid";
import { LogicAnnotation } from "../components/LogicAnnotation";
import { buildDashboardView } from "../lib/dashboardView";

// Re-derive hourly. The weather read is the only live input, and NWS itself is
// cached 30 min upstream, so an hour is the honest ceiling on freshness.
export const revalidate = 3600;

export default async function OchiDashboard() {
  // Full pipeline: gatekeeper inputs + REAL weather → derived score → view model.
  const view = await buildDashboardView();

  return (
    <div className="ochi-app">
      <main className="ochi-col">
        <Header />

        {view.isDemoData && (
          <div
            role="note"
            style={{
              border: "1px solid var(--st-nodata)", borderRadius: 10,
              padding: "10px 12px", fontSize: 12.5, lineHeight: 1.55,
              color: "var(--ink)", background: "var(--card)",
            }}
          >
            <strong style={{ fontWeight: 700 }}>Demonstration data.</strong>{" "}
            The four gatekeeper readings below are sample values, not observations —
            the formula is real and runs on them live, and the weather is a real
            forecast, but the signals themselves are not yet wired to a data source.
          </div>
        )}

        {/* Master Multiplier + Today's Read share one card at the top */}
        <section className="ochi-card" style={{ padding: "20px 20px 18px" }}>
          <PrimaryIndicator hero={view.hero} />
          <LogicAnnotation view={view} />
        </section>
        <SignalGrid gatekeepers={view.gatekeepers} />

        {/* page-level CTA into the bring-your-own-data funnel */}
        <div style={{ display: "grid", gap: 8, textAlign: "center" }}>
          <span style={{ fontSize: 12.5, color: "var(--taupe)" }}>
            Run OCHI on your own numbers — free, right in your browser.
          </span>
          <Link href="/add-your-data" style={{
            display: "block", width: "100%", padding: "14px 16px", borderRadius: 10,
            background: "var(--action)", color: "#fff", textAlign: "center",
            textDecoration: "none", fontSize: 15, fontWeight: 700, boxSizing: "border-box",
          }}>
            + Add sales or occupancy-rate data
          </Link>
        </div>

        <footer style={{
          textAlign: "center", padding: "6px 0 4px", fontSize: 11.5,
          color: "var(--st-nodata)", lineHeight: 1.6,
        }}>
          {view.isDemoData
            ? "OCHI is designed to read public signals on a regular cadence; this preview runs the model on sample values. A staffing aid, not a guarantee."
            : "OCHI reads public signals on a regular cadence. A staffing aid, not a guarantee."}
          <div style={{ marginTop: 5 }}>
            Built by Ernest of Gaia ·{" "}
            <a href="https://ernestofgaia.xyz" target="_blank" rel="noopener noreferrer"
              style={{ color: "var(--action)", textDecoration: "none", fontWeight: 600 }}>
              ernestofgaia.xyz
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
