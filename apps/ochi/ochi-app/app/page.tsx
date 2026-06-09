import React from "react";
import Link from "next/link";
import { Header } from "../components/Header";
import { PrimaryIndicator } from "../components/PrimaryIndicator";
import { SignalGrid } from "../components/SignalGrid";
import { LogicAnnotation } from "../components/LogicAnnotation";
import { buildDashboardView } from "../lib/dashboardView";

export default async function OchiDashboard() {
  // Full pipeline: live inputs + REAL weather → derived score → display view model.
  const view = await buildDashboardView();

  return (
    <div className="ochi-app">
      <main className="ochi-col">
        <Header />
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
          OCHI reads public signals on a regular cadence. A staffing aid, not a guarantee.
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
