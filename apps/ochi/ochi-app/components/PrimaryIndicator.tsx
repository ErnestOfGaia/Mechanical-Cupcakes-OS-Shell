import React from "react";
import type { HeroView } from "../lib/dashboardView";
import { Eyebrow, MultiplierScale } from "./ochi/primitives";

interface PrimaryIndicatorProps {
  hero: HeroView;
}

// Hero — Master Multiplier. A humble synthesis of the four gatekeepers, not an
// oracle. Number accent in terracotta; band pill + scale marker keyed to tone.
export function PrimaryIndicator({ hero }: PrimaryIndicatorProps) {
  const pill = {
    background: `var(--band-${hero.bandTone})`,
    color: `var(--band-${hero.bandTone}-ink)`,
  };
  return (
    <section className="ochi-card" style={{ padding: "20px 20px 22px", position: "relative" }}
      aria-labelledby="primary-indicator-title">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <Eyebrow><span id="primary-indicator-title">Master Multiplier</span></Eyebrow>
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginTop: 12 }}>
        <div style={{
          fontSize: 52, lineHeight: 0.92, fontWeight: 700, color: "var(--terracotta)",
          letterSpacing: "-.02em", fontVariantNumeric: "tabular-nums", flex: "none",
        }} aria-label={`Multiplier value ${hero.scoreText}`}>
          {hero.scoreText}
        </div>
        <span style={{
          padding: "4px 11px", borderRadius: 6, whiteSpace: "nowrap",
          fontSize: 13, fontWeight: 700, letterSpacing: ".04em", ...pill,
        }}>{hero.band}</span>
      </div>

      <MultiplierScale value={hero.score} tone={hero.bandTone} />

      <p style={{ margin: "18px 0 0", fontSize: 16.5, fontWeight: 600, color: "var(--ink)", letterSpacing: "-.01em" }}>
        {hero.headline}
      </p>

      <div style={{
        marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--hairline)",
        display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--taupe)",
      }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--st-good)", flex: "none" }} />
        A synthesis of the four gatekeepers below — not an oracle.
      </div>
    </section>
  );
}
