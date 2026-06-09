import React from "react";
import { Header } from "../components/Header";
import { PrimaryIndicator } from "../components/PrimaryIndicator";
import { SignalGrid } from "../components/SignalGrid";
import { LogicAnnotation } from "../components/LogicAnnotation";
import { buildDashboardView } from "../lib/dashboardView";

export default function OchiDashboard() {
  // Full pipeline: live inputs → derived score → display view model.
  const view = buildDashboardView();

  return (
    <div className="ochi-app">
      <main className="ochi-col">
        <Header />
        <PrimaryIndicator hero={view.hero} />
        <SignalGrid gatekeepers={view.gatekeepers} />
        <LogicAnnotation view={view} />
        <footer style={{
          textAlign: "center", padding: "6px 0 4px", fontSize: 11.5,
          color: "var(--st-nodata)", lineHeight: 1.5,
        }}>
          OCHI reads public signals on a regular cadence. A staffing aid, not a guarantee.
        </footer>
      </main>
    </div>
  );
}
