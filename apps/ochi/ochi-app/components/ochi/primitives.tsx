import React from "react";
import type { StatusToken, BandTone, WeatherIcon as WeatherIconKind } from "../../lib/dashboardView";

/* weather glyphs — calm line/fill, weather-app legible but not cartoonish */
export function WeatherIcon({ kind, size = 22 }: { kind: WeatherIconKind; size?: number }) {
  const s = size;
  if (kind === "sun") {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="4.2" fill="var(--st-watch)" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <line key={a} x1="12" y1="3" x2="12" y2="5.2" stroke="var(--st-watch)" strokeWidth="1.6"
            strokeLinecap="round" transform={`rotate(${a} 12 12)`} />
        ))}
      </svg>
    );
  }
  if (kind === "cloud") {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M7 17h9.5a3.3 3.3 0 0 0 .4-6.57A4.8 4.8 0 0 0 7.6 9.4 3.8 3.8 0 0 0 7 17Z"
          fill="var(--st-nodata-soft2)" stroke="var(--taupe)" strokeWidth="1.3" strokeLinejoin="round" />
      </svg>
    );
  }
  if (kind === "rain") {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M7 14h9.5a3.3 3.3 0 0 0 .4-6.57A4.8 4.8 0 0 0 7.6 6.4 3.8 3.8 0 0 0 7 14Z"
          fill="var(--st-nodata-soft2)" stroke="var(--taupe)" strokeWidth="1.3" strokeLinejoin="round" />
        {[8.5, 12, 15.5].map((x) => (
          <line key={x} x1={x} y1="17" x2={x - 1.2} y2="20.5" stroke="var(--action2)" strokeWidth="1.6"
            strokeLinecap="round" />
        ))}
      </svg>
    );
  }
  // storm
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 13h9.5a3.3 3.3 0 0 0 .4-6.57A4.8 4.8 0 0 0 7.6 5.4 3.8 3.8 0 0 0 7 13Z"
        fill="var(--st-nodata-soft2)" stroke="var(--taupe)" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M12.5 14l-2.5 4h2.2l-1.6 3.2 3.9-4.4h-2.2l1.5-2.8z" fill="var(--st-watch)" />
    </svg>
  );
}

/* ── tiny stroke icons (UI only) ──────────────────────────────────────────── */
export function Chevron({ open, size = 16 }: { open: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none"
      style={{ transition: "transform .22s ease", transform: open ? "rotate(180deg)" : "none" }}>
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none"
      style={{ animation: spinning ? "ochi-spin .7s linear infinite" : "none" }}>
      <path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M13.6 2.4v3.2h-3.2" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* small uppercase label used across tiles */
export function Eyebrow({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      fontSize: 12, fontWeight: 700, letterSpacing: ".09em",
      textTransform: "uppercase", color: "var(--taupe)", ...style,
    }}>{children}</div>
  );
}

/* status: ALWAYS color + text label */
export function StatusChip({ token, label, size }: { token: StatusToken; label: string; size?: "sm" }) {
  const color = `var(--st-${token})`;
  const sm = size === "sm";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: sm ? 5 : 6,
      padding: sm ? "2px 7px 2px 6px" : "3px 9px 3px 7px",
      borderRadius: 999, background: `var(--st-${token}-soft)`, color: `var(--st-${token}-ink)`,
      fontSize: sm ? 11 : 12, fontWeight: 600, letterSpacing: ".01em",
      lineHeight: 1, whiteSpace: "nowrap",
    }}>
      <span style={{
        width: sm ? 6 : 7, height: sm ? 6 : 7, borderRadius: 999, background: color, flex: "none",
        boxShadow: `0 0 0 ${token === "nodata" ? 0 : 2}px var(--st-${token}-ring)`,
      }} />
      {label}
    </span>
  );
}

/* the hero's calm 0..1 scale (a marker on a track, not a gauge) */
export function MultiplierScale({ value, tone }: { value: number; tone: BandTone }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  const marker = tone === "high" ? "var(--st-risk)" : tone === "mid" ? "var(--st-watch)" : "var(--navy)";
  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ position: "relative", height: 8 }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", gap: 3 }}>
          <div style={{ flex: "0 0 38%", borderRadius: "999px 2px 2px 999px", background: "var(--zone-low)" }} />
          <div style={{ flex: "0 0 30%", background: "var(--zone-mid)" }} />
          <div style={{ flex: "1 1 auto", borderRadius: "2px 999px 999px 2px", background: "var(--zone-high)" }} />
        </div>
        <div style={{
          position: "absolute", top: "50%", left: pct + "%", transform: "translate(-50%,-50%)",
          width: 16, height: 16, borderRadius: 999, background: "var(--canvas)",
          border: `3px solid ${marker}`, boxShadow: "0 1px 3px rgba(51,49,46,.22)",
        }} />
      </div>
      <div style={{
        display: "flex", justifyContent: "space-between", marginTop: 8,
        fontSize: 11, fontWeight: 600, letterSpacing: ".06em",
        textTransform: "uppercase", color: "var(--taupe)",
      }}>
        <span style={{ opacity: tone === "low" ? 1 : 0.5 }}>Low</span>
        <span style={{ opacity: tone === "mid" ? 1 : 0.5 }}>Moderate</span>
        <span style={{ opacity: tone === "high" ? 1 : 0.5 }}>High</span>
      </div>
    </div>
  );
}

/* Expand/collapse — conditionally MOUNT the content (no height transition). */
export function Collapse({ open, children }: { open: boolean; children: React.ReactNode }) {
  if (!open) return null;
  return <div>{children}</div>;
}
