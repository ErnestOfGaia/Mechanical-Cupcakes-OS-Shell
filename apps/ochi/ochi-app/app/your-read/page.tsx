"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  TEASER_STORAGE_KEY,
  nextWithOchi,
  type Teaser,
  type SeriesPoint,
} from "../../lib/lodgingUpload";
import {
  bookingRequestIsValid,
  submitBookingRequest,
  CONTACT,
  type BookingRequest,
} from "../../lib/booking";
import { Eyebrow, MultiplierScale } from "../../components/ochi/primitives";

type Stage = "form" | "confirm" | "sent";
type Tone = "low" | "mid" | "high";

const emptyForm = { name: "", business: "", email: "", phone: "", preferredTime: "", note: "" };

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <section className="ochi-card" style={{ padding: "18px 18px", ...style }}>{children}</section>;
}

function toneOf(avg: number): Tone {
  if (avg >= 70) return "high";
  if (avg >= 50) return "mid";
  return "low";
}
function bandLabel(avg: number): string {
  if (avg >= 70) return "STRONG SEASON";
  if (avg >= 50) return "MODERATE";
  return "SOFT SEASON";
}
function headlineOf(avg: number): string {
  if (avg >= 70) return "A strong stretch overall.";
  if (avg >= 50) return "A mixed, swingy stretch.";
  return "A soft stretch overall.";
}

// The wow: their actual weekly demand, drawn — occupancy rate or sales, indexed
// to a 0–100 demand shape. Busy weeks in terracotta, soft weeks muted, the steady
// middle in OCHI navy, with the average as a dashed reference line.
function WeeklyChart({ series, avgIndex }: { series: SeriesPoint[]; avgIndex: number }) {
  const H = 132;
  const tight = series.length > 60;
  return (
    <div>
      <div style={{ position: "relative", height: H }}>
        {/* avg reference line */}
        <div style={{
          position: "absolute", left: 0, right: 0, top: (1 - avgIndex / 100) * H,
          borderTop: "1px dashed var(--hairline-strong)", zIndex: 1,
        }} />
        <div style={{ display: "flex", alignItems: "flex-end", gap: tight ? 1 : 3, height: H }}>
          {series.map((p, i) => {
            const h = Math.max(2, (p.idx / 100) * H);
            const color = p.idx >= 80 ? "var(--terracotta)" : p.idx <= 50 ? "var(--st-nodata-soft2)" : "var(--action2)";
            return (
              <div key={i} title={`${p.label}: ${p.idx}`}
                style={{ flex: "1 1 0", minWidth: 0, height: h, background: color, borderRadius: tight ? 1 : 2 }} />
            );
          })}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: "var(--taupe)", fontWeight: 500 }}>
        <span>{series[0]?.label}</span>
        <span style={{ color: "var(--st-nodata)" }}>– – average</span>
        <span>{series[series.length - 1]?.label}</span>
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 10, fontSize: 11.5, color: "var(--taupe)", flexWrap: "wrap" }}>
        <Legend color="var(--terracotta)" label="Busy" />
        <Legend color="var(--action2)" label="Steady" />
        <Legend color="var(--st-nodata-soft2)" label="Soft" />
      </div>
    </div>
  );
}
function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span style={{ width: 9, height: 9, borderRadius: 2, background: color, flex: "none" }} />{label}
    </span>
  );
}

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div className="ochi-card" style={{ padding: "14px 15px" }}>
      <Eyebrow style={{ fontSize: 11 }}>{label}</Eyebrow>
      <div style={{ fontSize: 26, fontWeight: 700, marginTop: 6, letterSpacing: "-.01em", color: accent ? "var(--terracotta)" : "var(--ink)" }}>{value}</div>
      <div style={{ fontSize: 11.5, color: "var(--taupe)", marginTop: 4, lineHeight: 1.35, textWrap: "pretty" }}>{sub}</div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--taupe)" }}>{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} type={type}
        style={{
          display: "block", width: "100%", marginTop: 4, padding: "9px 11px", borderRadius: 7,
          border: "1px solid var(--hairline-strong)", background: "var(--canvas)", color: "var(--ink)",
          font: "inherit", fontSize: 14,
        }} />
    </label>
  );
}

export default function YourRead() {
  const [teaser, setTeaser] = useState<Teaser | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [stage, setStage] = useState<Stage>("form");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState("");

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(TEASER_STORAGE_KEY);
      if (raw) setTeaser(JSON.parse(raw));
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function confirmSend() {
    if (!teaser) return;
    setSending(true);
    const req: BookingRequest = {
      ...form,
      context: { weeksCount: teaser.weeksCount, avgOccupancy: teaser.avgIndex, swingWeeks: teaser.swingWeeks },
    };
    const res = await submitBookingRequest(req);
    setSending(false);
    setResult(res.message);
    if (res.ok) setStage("sent");
  }

  if (loaded && !teaser) {
    return (
      <div className="ochi-app">
        <main className="ochi-col" style={{ gap: 16 }}>
          <Card>
            <p style={{ margin: 0, fontSize: 14.5, color: "var(--ink)", lineHeight: 1.55 }}>
              No reading yet — upload your weekly lodging data first and we&apos;ll show you what OCHI sees.
            </p>
            <Link href="/add-your-data" style={{ display: "inline-block", marginTop: 12, fontSize: 13.5, color: "var(--action)", fontWeight: 700, textDecoration: "none" }}>
              Add your lodging data →
            </Link>
          </Card>
        </main>
      </div>
    );
  }
  if (!teaser) return null;

  const tone = toneOf(teaser.avgIndex);
  const next = nextWithOchi(teaser);
  const avgEyebrow = teaser.metric === "occupancy" ? "Your average occupancy" : "Your average weekly sales";

  return (
    <div className="ochi-app">
      <main className="ochi-col" style={{ gap: 16 }}>
        {/* app bar — mirrors the dashboard */}
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2px 2px 0" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 9, height: 9, borderRadius: "2px 9px 9px 9px", background: "var(--navy)", flex: "none" }} />
              <span style={{ fontSize: 18, fontWeight: 700, color: "var(--navy)", letterSpacing: ".02em" }}>OCHI</span>
            </div>
            <div style={{ fontSize: 12.5, color: "var(--taupe)", marginTop: 3, marginLeft: 17 }}>Your read · from your data</div>
          </div>
          <Link href="/add-your-data" style={{ fontSize: 12.5, color: "var(--action)", fontWeight: 600, textDecoration: "none" }}>
            ← New upload
          </Link>
        </header>

        {/* hero — your demand, read like the Master Multiplier */}
        <section className="ochi-card" style={{ padding: "20px 20px 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <Eyebrow>{avgEyebrow}</Eyebrow>
            <span style={{ fontSize: 12, color: "var(--taupe)", fontWeight: 500 }}>{teaser.weeksCount} weeks</span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginTop: 12 }}>
            <div style={{ fontSize: 52, lineHeight: 0.92, fontWeight: 700, color: "var(--terracotta)", letterSpacing: "-.02em", fontVariantNumeric: "tabular-nums" }}>
              {teaser.avgText}
            </div>
            <span style={{ padding: "4px 11px", borderRadius: 6, whiteSpace: "nowrap", fontSize: 13, fontWeight: 700, letterSpacing: ".04em", background: `var(--band-${tone})`, color: `var(--band-${tone}-ink)` }}>
              {bandLabel(teaser.avgIndex)}
            </span>
          </div>
          <MultiplierScale value={teaser.avgIndex / 100} tone={tone} />
          <p style={{ margin: "18px 0 0", fontSize: 16.5, fontWeight: 600, color: "var(--ink)", letterSpacing: "-.01em" }}>{headlineOf(teaser.avgIndex)}</p>
          <p style={{ margin: "5px 0 0", fontSize: 14, lineHeight: 1.5, color: "var(--taupe)", textWrap: "pretty" }}>
            {teaser.rangeStart} → {teaser.rangeEnd}. Of these, <strong style={{ color: "var(--ink)" }}>{teaser.swingWeeks} swing weeks</strong> sit in the ambiguous middle — exactly where the staffing call is hardest.
          </p>
        </section>

        {/* the chart — their year(s), drawn */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 13 }}>
            <Eyebrow>Your {teaser.weeksCount} weeks of {teaser.metricNoun}</Eyebrow>
          </div>
          <WeeklyChart series={teaser.series} avgIndex={teaser.avgIndex} />
        </Card>

        {/* the insights — shown, not gated */}
        <div>
          <h2 style={{ margin: "0 2px 11px", fontSize: 16, fontWeight: 700, color: "var(--navy)", letterSpacing: "-.01em" }}>What OCHI already sees</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
            {teaser.highlights.map((h, i) => (
              <StatCard key={h.label} label={h.label} value={h.value} sub={h.sub} accent={i === 0} />
            ))}
            <StatCard label="Busy stretch" value={String(teaser.peakStretch)} sub="weeks in the top band — your peak season" />
            <StatCard label="Soft stretch" value={String(teaser.softStretch)} sub="weeks in the low band — your quiet season" />
          </div>
        </div>

        {/* where OCHI takes it — forward value, not a paywall */}
        <Card style={{ background: "var(--soft-navy)", borderColor: "var(--soft-navy-line)" }}>
          <Eyebrow style={{ color: "var(--action)" }}>Where OCHI takes this</Eyebrow>
          <p style={{ margin: "8px 0 11px", fontSize: 13.5, lineHeight: 1.55, color: "var(--navy)", textWrap: "pretty" }}>
            That&apos;s the rear-view from your own numbers. Connected as a live source, OCHI turns it forward:
          </p>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 8 }}>
            {next.map((n, i) => (
              <li key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start", fontSize: 13, lineHeight: 1.5, color: "var(--ink)" }}>
                <span style={{ color: "var(--action)", fontWeight: 700, flex: "none" }}>→</span>{n}
              </li>
            ))}
          </ul>
        </Card>

        {/* booking — an invitation, with instant fallbacks */}
        <Card>
          <Eyebrow style={{ color: "var(--action)" }}>Get OCHI tuned to your numbers</Eyebrow>

          {stage === "sent" ? (
            <p style={{ margin: "10px 0 0", fontSize: 14.5, fontWeight: 600, color: "var(--navy)", lineHeight: 1.5 }}>
              {result || "Sent — Ernest's assistant will reach out to confirm your time."}
            </p>
          ) : stage === "confirm" ? (
            <div style={{ marginTop: 10 }}>
              <p style={{ margin: 0, fontSize: 13, color: "var(--navy)", fontWeight: 600 }}>Send this to book your call?</p>
              <div style={{ margin: "10px 0 0", padding: "11px 12px", borderRadius: 8, background: "var(--soft-navy)", border: "1px solid var(--soft-navy-line)", fontSize: 13, lineHeight: 1.7, color: "var(--ink)" }}>
                <div><strong>{form.name}</strong>{form.business ? ` · ${form.business}` : ""}</div>
                <div>{form.email}{form.phone ? ` · ${form.phone}` : ""}</div>
                {form.preferredTime && <div>Prefers: {form.preferredTime}</div>}
                {form.note && <div style={{ color: "var(--taupe)" }}>“{form.note}”</div>}
                <div style={{ color: "var(--taupe)", marginTop: 4, fontSize: 12 }}>+ your read ({teaser.weeksCount} wks, {teaser.avgText} avg {teaser.metricNoun})</div>
              </div>
              {result && <p style={{ margin: "9px 0 0", fontSize: 12.5, color: "var(--st-risk-ink)" }}>{result}</p>}
              <div style={{ display: "flex", gap: 9, marginTop: 12 }}>
                <button onClick={() => setStage("form")} disabled={sending}
                  style={{ flex: "0 0 auto", padding: "10px 14px", borderRadius: 7, background: "transparent", color: "var(--action)", border: "1px solid var(--hairline-strong)", font: "inherit", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>Edit</button>
                <button onClick={confirmSend} disabled={sending}
                  style={{ flex: "1 1 auto", padding: "10px 14px", borderRadius: 7, background: "var(--action)", color: "#fff", border: "none", font: "inherit", fontSize: 13.5, fontWeight: 700, cursor: sending ? "default" : "pointer", opacity: sending ? 0.7 : 1 }}>
                  {sending ? "Sending…" : "Confirm & send"}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 11, display: "grid", gap: 10 }}>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: "var(--ink)" }}>
                A free 20-minute read-through of these numbers. Tell us where to reach you — Ernest&apos;s assistant handles the scheduling.
              </p>
              <Field label="Name" value={form.name} onChange={set("name")} placeholder="Your name" />
              <Field label="Business" value={form.business} onChange={set("business")} placeholder="Property / restaurant" />
              <Field label="Email" value={form.email} onChange={set("email")} placeholder="you@business.com" type="email" />
              <Field label="Phone" value={form.phone} onChange={set("phone")} placeholder="(optional)" type="tel" />
              <Field label="Best time for a call" value={form.preferredTime} onChange={set("preferredTime")} placeholder="e.g. weekday mornings" />
              <Field label="Anything to flag?" value={form.note} onChange={set("note")} placeholder="(optional)" />
              <button onClick={() => setStage("confirm")} disabled={!bookingRequestIsValid(form)}
                style={{ width: "100%", padding: "12px 14px", borderRadius: 8, background: bookingRequestIsValid(form) ? "var(--action)" : "var(--hairline-strong)", color: "#fff", border: "none", font: "inherit", fontSize: 14, fontWeight: 700, cursor: bookingRequestIsValid(form) ? "pointer" : "default" }}>
                Review &amp; book
              </button>
            </div>
          )}

          <div style={{ marginTop: 14, paddingTop: 13, borderTop: "1px solid var(--hairline)", display: "flex", gap: 9, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--taupe)", fontWeight: 500 }}>Rather not wait?</span>
            <a href={CONTACT.phoneHref} style={{ fontSize: 13, color: "var(--action)", fontWeight: 700, textDecoration: "none" }}>Text {CONTACT.phone}</a>
            <span style={{ color: "var(--hairline-strong)" }}>·</span>
            <a href={CONTACT.emailHref} style={{ fontSize: 13, color: "var(--action)", fontWeight: 700, textDecoration: "none" }}>Email Ernest</a>
          </div>
        </Card>

        <footer style={{ textAlign: "center", padding: "4px 0 2px", fontSize: 11.5, color: "var(--st-nodata)", lineHeight: 1.5 }}>
          Computed live in your browser — your numbers never left this device.
        </footer>
      </main>
    </div>
  );
}
