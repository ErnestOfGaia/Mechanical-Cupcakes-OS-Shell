"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { GatekeeperView } from "../lib/dashboardView";
import { Eyebrow, StatusChip, Chevron, Collapse, WeatherIcon } from "./ochi/primitives";

// Lead card: Hwy 6 + weather read together — the at-a-glance "should I worry
// today?" signal. Road status on the left, weather icon/temp on the right, with a
// paired verdict that reads the road+weather combination, not either alone.
function ConditionsCard({ card }: { card: GatekeeperView }) {
  const [open, setOpen] = useState(false);
  const w = card.weather!;
  return (
    <button className="ochi-card ochi-tap" onClick={() => setOpen((o) => !o)} aria-expanded={open}
      style={{
        padding: "15px 16px", textAlign: "left", display: "block", width: "100%",
        font: "inherit", cursor: "pointer",
        borderColor: open ? "var(--hairline-strong)" : "var(--hairline)",
      }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <Eyebrow style={{ fontSize: 11 }}>{card.label}</Eyebrow>
        <span style={{ color: "var(--taupe)", flex: "none" }}><Chevron open={open} /></span>
      </div>

      {/* the pair: road on the left, weather on the right */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
        <div style={{ flex: "1 1 auto", minWidth: 0 }}>
          <div style={{ fontSize: 11, color: "var(--taupe)", fontWeight: 600, letterSpacing: ".04em" }}>HWY 6</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "var(--ink)", letterSpacing: "-.01em", lineHeight: 1.05 }}>
            {card.value}
          </div>
        </div>
        <div style={{ width: 1, alignSelf: "stretch", background: "var(--hairline)", margin: "2px 0" }} />
        <div style={{ flex: "1 1 auto", minWidth: 0, display: "flex", alignItems: "center", gap: 9 }}>
          <WeatherIcon kind={w.icon} size={30} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", lineHeight: 1.1 }}>{w.summary}</div>
            <div style={{ fontSize: 12.5, color: "var(--taupe)", fontWeight: 500 }}>{w.tempF}°F</div>
          </div>
        </div>
      </div>

      {/* the at-a-glance paired verdict */}
      <div style={{ marginTop: 11, display: "flex", alignItems: "center", gap: 9 }}>
        <StatusChip token={card.status} label={card.statusLabel} size="sm" />
        <span style={{ fontSize: 12.5, color: "var(--ink)", fontWeight: 500, textWrap: "pretty" }}>{card.verdict}</span>
      </div>

      <Collapse open={open}>
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--hairline)", display: "grid", gap: 9 }}>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: "var(--ink)", textWrap: "pretty" }}>
            <span style={{ fontWeight: 700, color: "var(--action)" }}>Why this matters — </span>{card.why}
          </p>
          <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.5, color: "var(--taupe)", textWrap: "pretty" }}>
            {card.weatherNote}
          </p>
          <div style={{ fontSize: 11, color: "var(--st-nodata)", fontWeight: 500 }}>
            Road updates {card.cadence} · weather hourly
          </div>
        </div>
      </Collapse>
    </button>
  );
}

// The "make this signal live with your own data" conversion block — shown on the
// lagging Lodging Pulse card. The CTA opens the dedicated upload funnel.
function UpgradeCTA({ upgrade }: { upgrade: NonNullable<GatekeeperView["upgrade"]> }) {
  return (
    <div style={{
      marginTop: 12, padding: "12px 13px", borderRadius: 8,
      background: "var(--soft-navy)", border: "1px solid var(--soft-navy-line)",
    }}>
      <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.5, color: "var(--navy)", textWrap: "pretty" }}>
        {upgrade.pitch}
      </p>
      <ul style={{ margin: "9px 0 0", padding: 0, listStyle: "none", display: "grid", gap: 5 }}>
        {upgrade.points.map((p, i) => (
          <li key={i} style={{ fontSize: 12, color: "var(--ink)", display: "flex", gap: 7, alignItems: "flex-start", lineHeight: 1.4 }}>
            <span style={{ color: "var(--st-good)", fontWeight: 700, flex: "none" }}>✓</span>{p}
          </li>
        ))}
      </ul>
      <Link href="/add-your-data"
        style={{
          display: "block", marginTop: 11, width: "100%", padding: "10px 12px", borderRadius: 7,
          background: "var(--action)", color: "#fff", textAlign: "center", textDecoration: "none",
          fontSize: 13.5, fontWeight: 700, boxSizing: "border-box",
        }}>
        + {upgrade.cta}
      </Link>
    </div>
  );
}

// One gatekeeper as a full-width ledger row. Collapsed: reading + status on one
// line. Expanded: the real "why this matters" from tenant.config (and, for the
// lagging Lodging Pulse, the conversion offer), given the full row width to read.
function GatekeeperRow({ card }: { card: GatekeeperView }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="ochi-card" style={{
      overflow: "hidden",
      borderColor: open ? "var(--hairline-strong)" : "var(--hairline)",
    }}>
      <button className="ochi-tap" onClick={() => setOpen((o) => !o)} aria-expanded={open}
        style={{
          padding: "14px 15px", textAlign: "left", display: "block", width: "100%",
          background: "none", border: "none", font: "inherit", cursor: "pointer",
        }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: "1 1 auto", minWidth: 0 }}>
            <Eyebrow style={{ fontSize: 11 }}>{card.label}</Eyebrow>
            <div style={{
              fontSize: 22, fontWeight: 700, color: "var(--ink)", marginTop: 3,
              letterSpacing: "-.01em", lineHeight: 1.05,
            }}>{card.value}</div>
            <div style={{ fontSize: 11.5, color: "var(--st-nodata)", marginTop: 4, fontWeight: 500 }}>
              updates {card.cadence}
            </div>
          </div>
          <div style={{ flex: "none" }}>
            <StatusChip token={card.status} label={card.statusLabel} size="sm" />
          </div>
          <span style={{ color: "var(--taupe)", flex: "none" }}><Chevron open={open} /></span>
        </div>
      </button>

      <Collapse open={open}>
        <div style={{ padding: "0 15px 14px" }}>
          <div style={{ paddingTop: 12, borderTop: "1px solid var(--hairline)" }}>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: "var(--ink)", textWrap: "pretty" }}>
              <span style={{ fontWeight: 700, color: "var(--action)" }}>Why this matters — </span>
              {card.why}
            </p>
            {card.sourceLabel && (
              <p style={{ margin: "8px 0 0", fontSize: 11.5, color: "var(--st-nodata)", fontWeight: 500 }}>
                Source — {card.sourceLabel}
              </p>
            )}
          </div>
          {card.upgrade && <UpgradeCTA upgrade={card.upgrade} />}
        </div>
      </Collapse>
    </div>
  );
}

export function SignalGrid({ gatekeepers }: { gatekeepers: GatekeeperView[] }) {
  return (
    <section aria-labelledby="signal-grid-title">
      <div style={{
        display: "flex", alignItems: "baseline", justifyContent: "space-between",
        gap: 10, padding: "0 2px", marginBottom: 11,
      }}>
        <h2 id="signal-grid-title" style={{
          margin: 0, fontSize: 16, fontWeight: 700, color: "var(--navy)",
          letterSpacing: "-.01em", whiteSpace: "nowrap",
        }}>The four gatekeepers</h2>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          fontSize: 12, color: "var(--taupe)", fontWeight: 500, whiteSpace: "nowrap",
        }}>tap <Chevron open={false} size={14} /> to expand</span>
      </div>
      <div style={{ display: "grid", gap: 9 }}>
        {gatekeepers.map((c) =>
          c.weather
            ? <ConditionsCard key={c.id} card={c} />
            : <GatekeeperRow key={c.id} card={c} />,
        )}
      </div>
    </section>
  );
}
