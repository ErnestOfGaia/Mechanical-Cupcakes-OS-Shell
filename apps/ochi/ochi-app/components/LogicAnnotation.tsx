"use client";

import React, { useState } from "react";
import type { DashboardView } from "../lib/dashboardView";
import { Eyebrow, Chevron, Collapse } from "./ochi/primitives";

// Forecast / Logic. Today's computed read + a band-derived recommended action,
// with an expandable breakdown of how the Multiplier is weighted (real weights
// from tenant.config).
export function LogicAnnotation({ view }: { view: DashboardView }) {
  const [open, setOpen] = useState(false);
  const maxWeight = Math.max(...view.weights.map((w) => w.percent), 1);
  const ordered = view.weights.slice().sort((a, b) => b.percent - a.percent);

  return (
    <section className="ochi-card" style={{ padding: "18px 18px 16px" }} aria-labelledby="logic-annotation-title">
      <Eyebrow><span id="logic-annotation-title">Today&apos;s read</span></Eyebrow>
      <p style={{ margin: "10px 0 0", fontSize: 14.5, lineHeight: 1.6, color: "var(--ink)", textWrap: "pretty" }}>
        {view.summary}
      </p>

      {/* recommended action — the one decisive block */}
      <div style={{
        marginTop: 15, padding: "13px 14px", borderRadius: 7,
        background: "var(--soft-navy)", border: "1px solid var(--soft-navy-line)",
      }}>
        <Eyebrow style={{ fontSize: 10.5, color: "var(--action)" }}>Recommended action</Eyebrow>
        <p style={{ margin: "6px 0 0", fontSize: 14.5, lineHeight: 1.55, color: "var(--navy)", fontWeight: 600, textWrap: "pretty" }}>
          {view.action}
        </p>
      </div>

      <button className="ochi-tap" onClick={() => setOpen((o) => !o)} aria-expanded={open}
        style={{
          marginTop: 13, width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 2px 2px", background: "none", border: "none", borderTop: "1px solid var(--hairline)",
          font: "inherit", color: "var(--action)", fontWeight: 600, fontSize: 13.5, cursor: "pointer",
        }}>
        How the Multiplier is built
        <Chevron open={open} />
      </button>

      <Collapse open={open}>
        <div style={{ marginTop: 12, display: "grid", gap: 11 }}>
          <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.5, color: "var(--taupe)", textWrap: "pretty" }}>
            Each live signal contributes by how reliably it leads visitor volume. The lodging-tax pulse is
            downweighted while it lags.
          </p>
          {ordered.map((w) => (
            <div key={w.id} style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <span style={{ flex: "0 0 96px", fontSize: 12.5, color: "var(--ink)", fontWeight: 600 }}>{w.label}</span>
              <div style={{ flex: "1 1 auto", height: 6, borderRadius: 999, background: "var(--track)", overflow: "hidden" }}>
                <div style={{
                  width: (w.percent * 100 / maxWeight) + "%", height: "100%", borderRadius: 999,
                  background: w.lagging ? "var(--st-nodata)" : "var(--action2)",
                }} />
              </div>
              <span style={{
                flex: "0 0 34px", textAlign: "right", fontSize: 12, color: "var(--taupe)",
                fontWeight: 600, fontVariantNumeric: "tabular-nums",
              }}>{w.percent}%</span>
            </div>
          ))}
          <div style={{ fontSize: 12, color: "var(--taupe)", paddingTop: 2 }}>
            Confidence — <span style={{ color: "var(--ink)", fontWeight: 600 }}>{view.confidence}</span>
          </div>
        </div>
      </Collapse>
    </section>
  );
}
