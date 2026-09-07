import React from "react";
import Link from "next/link";
import { Header } from "../components/Header";
import { PrimaryIndicator } from "../components/PrimaryIndicator";
import { SignalGrid } from "../components/SignalGrid";
import { LogicAnnotation } from "../components/LogicAnnotation";
import { buildDashboardView } from "../lib/dashboardView";

// Re-derive on every request. The stored signals change when the endpoint is
// hit, and a check-in must show the row that exists NOW — a cached page could
// show last week's row for an hour after this week's landed. Weather stays
// cached 30 min inside getCurrentWeather() (Next data cache), so this costs one
// Postgres round-trip per view, not an NWS call.
export const dynamic = "force-dynamic";

export default async function OchiDashboard() {
  // Full pipeline: gatekeeper inputs + REAL weather → derived score → view model.
  const view = await buildDashboardView();

  return (
    <div className="ochi-app">
      <main className="ochi-col">
        <Header />

        {view.dataState === "unavailable" && (
          <div
            role="alert"
            style={{
              border: "1px solid var(--st-risk)", borderRadius: 10,
              padding: "10px 12px", fontSize: 12.5, lineHeight: 1.55,
              color: "var(--ink)", background: "var(--st-risk-soft)",
            }}
          >
            <strong style={{ fontWeight: 700 }}>Signals unavailable.</strong>{" "}
            OCHI could not read its stored gatekeeper signals ({view.unavailableReason}).
            Every stored signal below reads unavailable rather than a number. The
            weather is a live forecast and is the only thing on this page that is.
          </div>
        )}

        {view.dataState === "live" && (
          <div
            style={{
              display: "flex", flexWrap: "wrap", alignItems: "baseline",
              justifyContent: "space-between", gap: "4px 12px", padding: "0 2px",
            }}
          >
            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", letterSpacing: "-.01em" }}>
              {view.weekLabel}
            </span>
            <span style={{ fontSize: 12, color: "var(--taupe)", fontWeight: 500 }}>
              stored signals as of {view.asOf ?? "an unknown time"}
            </span>
          </div>
        )}

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
          <PrimaryIndicator hero={view.hero} note={view.heroNote} />
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
          {view.dataState === "demo"
            ? "OCHI is designed to read public signals on a regular cadence; this preview runs the model on sample values. A staffing aid, not a guarantee."
            : view.dataState === "unavailable"
              ? "OCHI's stored signals could not be read. Nothing above is a reading. A staffing aid, not a guarantee."
              : "OCHI shows stored weekly readings with the time they were recorded, and a live weather forecast. Compare against what you heard. A staffing aid, not a guarantee."}
          <div style={{ marginTop: 5 }}>
            <Link href="/under-the-hood" style={{ color: "var(--action)", textDecoration: "none", fontWeight: 600 }}>
              Under the hood
            </Link>
            {" · "}Built by Ernest of Gaia ·{" "}
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
