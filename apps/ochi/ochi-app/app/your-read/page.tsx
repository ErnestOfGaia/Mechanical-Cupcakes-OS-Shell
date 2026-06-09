"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { TEASER_STORAGE_KEY, lockedTeasers, type Teaser } from "../../lib/lodgingUpload";
import {
  bookingRequestIsValid,
  submitBookingRequest,
  CONTACT,
  type BookingRequest,
} from "../../lib/booking";
import { Eyebrow } from "../../components/ochi/primitives";

type Stage = "form" | "confirm" | "sent";

const emptyForm = { name: "", business: "", email: "", phone: "", preferredTime: "", note: "" };

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <section className="ochi-card" style={{ padding: "18px 18px", ...style }}>{children}</section>;
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
  const [result, setResult] = useState<string>("");

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
      context: { weeksCount: teaser.weeksCount, avgOccupancy: teaser.avgOccupancy, swingWeeks: teaser.swingWeeks },
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
              No reading yet — upload your weekly lodging data first and we'll show you what OCHI sees.
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

  const locked = lockedTeasers(teaser);

  return (
    <div className="ochi-app">
      <main className="ochi-col" style={{ gap: 18 }}>
        <header style={{ padding: "2px 2px 0" }}>
          <Link href="/add-your-data" style={{ fontSize: 12.5, color: "var(--action)", fontWeight: 600, textDecoration: "none" }}>
            ← Upload different data
          </Link>
          <h1 style={{ margin: "10px 0 0", fontSize: 24, fontWeight: 700, color: "var(--navy)", letterSpacing: "-.02em", lineHeight: 1.12 }}>
            Here's what OCHI sees in your <span style={{ color: "var(--terracotta)" }}>{teaser.weeksCount} weeks</span>.
          </h1>
          <p style={{ margin: "8px 0 0", fontSize: 14, lineHeight: 1.55, color: "var(--taupe)" }}>
            Computed live in your browser from the file you just chose — {teaser.rangeStart} to {teaser.rangeEnd}.
          </p>
        </header>

        {/* the few REAL highlights */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
          {teaser.highlights.map((h) => (
            <div key={h.label} className="ochi-card" style={{ padding: "14px 15px" }}>
              <Eyebrow style={{ fontSize: 11 }}>{h.label}</Eyebrow>
              <div style={{ fontSize: 26, fontWeight: 700, color: "var(--ink)", marginTop: 6, letterSpacing: "-.01em" }}>{h.value}</div>
              <div style={{ fontSize: 11.5, color: "var(--taupe)", marginTop: 4, lineHeight: 1.35 }}>{h.sub}</div>
            </div>
          ))}
        </div>

        {/* the WITHHELD hooks — locked */}
        <Card>
          <Eyebrow style={{ color: "var(--action)" }}>What a 20-minute review unlocks</Eyebrow>
          <div style={{ display: "grid", gap: 9, marginTop: 11 }}>
            {locked.map((l, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: 10, padding: "11px 12px",
                borderRadius: 8, border: "1px dashed var(--hairline-strong)", background: "var(--card)",
              }}>
                <span style={{ flex: "none", fontSize: 14, lineHeight: 1.4 }} aria-hidden>🔒</span>
                <span style={{ fontSize: 13, lineHeight: 1.5, color: "var(--ink)", textWrap: "pretty" }}>{l}</span>
              </div>
            ))}
          </div>
          <p style={{ margin: "12px 0 0", fontSize: 12.5, lineHeight: 1.5, color: "var(--taupe)", textWrap: "pretty" }}>
            We held those back on purpose — they're specific to your numbers, and they're the conversation.
          </p>
        </Card>

        {/* booking */}
        <Card style={{ background: "var(--soft-navy)", borderColor: "var(--soft-navy-line)" }}>
          <Eyebrow style={{ color: "var(--action)" }}>Book a 20-minute read-through</Eyebrow>

          {stage === "sent" ? (
            <p style={{ margin: "10px 0 0", fontSize: 14.5, fontWeight: 600, color: "var(--navy)", lineHeight: 1.5 }}>
              {result || "Sent — Ernest's assistant will reach out to confirm your time."}
            </p>
          ) : stage === "confirm" ? (
            <div style={{ marginTop: 10 }}>
              <p style={{ margin: 0, fontSize: 13, color: "var(--navy)", fontWeight: 600 }}>Send this to book your call?</p>
              <div style={{ margin: "10px 0 0", padding: "11px 12px", borderRadius: 8, background: "var(--canvas)", border: "1px solid var(--soft-navy-line)", fontSize: 13, lineHeight: 1.7, color: "var(--ink)" }}>
                <div><strong>{form.name}</strong>{form.business ? ` · ${form.business}` : ""}</div>
                <div>{form.email}{form.phone ? ` · ${form.phone}` : ""}</div>
                {form.preferredTime && <div>Prefers: {form.preferredTime}</div>}
                {form.note && <div style={{ color: "var(--taupe)" }}>“{form.note}”</div>}
                <div style={{ color: "var(--taupe)", marginTop: 4, fontSize: 12 }}>
                  + your read ({teaser.weeksCount} wks, {teaser.avgOccupancy}% avg occ)
                </div>
              </div>
              {result && <p style={{ margin: "9px 0 0", fontSize: 12.5, color: "var(--st-risk-ink)" }}>{result}</p>}
              <div style={{ display: "flex", gap: 9, marginTop: 12 }}>
                <button onClick={() => setStage("form")} disabled={sending}
                  style={{ flex: "0 0 auto", padding: "10px 14px", borderRadius: 7, background: "transparent", color: "var(--action)", border: "1px solid var(--soft-navy-line)", font: "inherit", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>
                  Edit
                </button>
                <button onClick={confirmSend} disabled={sending}
                  style={{ flex: "1 1 auto", padding: "10px 14px", borderRadius: 7, background: "var(--action)", color: "#fff", border: "none", font: "inherit", fontSize: 13.5, fontWeight: 700, cursor: sending ? "default" : "pointer", opacity: sending ? 0.7 : 1 }}>
                  {sending ? "Sending…" : "Confirm & send"}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 11, display: "grid", gap: 10 }}>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: "var(--navy)" }}>
                Tell us where to reach you — Ernest's assistant handles the scheduling. No spam, just your slot.
              </p>
              <Field label="Name" value={form.name} onChange={set("name")} placeholder="Your name" />
              <Field label="Business" value={form.business} onChange={set("business")} placeholder="Property / restaurant" />
              <Field label="Email" value={form.email} onChange={set("email")} placeholder="you@business.com" type="email" />
              <Field label="Phone" value={form.phone} onChange={set("phone")} placeholder="(optional)" type="tel" />
              <Field label="Best time for a call" value={form.preferredTime} onChange={set("preferredTime")} placeholder="e.g. weekday mornings" />
              <Field label="Anything to flag?" value={form.note} onChange={set("note")} placeholder="(optional)" />
              <button onClick={() => setStage("confirm")} disabled={!bookingRequestIsValid(form)}
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 8,
                  background: bookingRequestIsValid(form) ? "var(--action)" : "var(--hairline-strong)",
                  color: "#fff", border: "none", font: "inherit", fontSize: 14, fontWeight: 700,
                  cursor: bookingRequestIsValid(form) ? "pointer" : "default",
                }}>
                Review &amp; book
              </button>
            </div>
          )}

          {/* instant fallbacks */}
          <div style={{ marginTop: 14, paddingTop: 13, borderTop: "1px solid var(--soft-navy-line)", display: "flex", gap: 9, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--taupe)", fontWeight: 500 }}>Rather not wait?</span>
            <a href={CONTACT.phoneHref} style={{ fontSize: 13, color: "var(--action)", fontWeight: 700, textDecoration: "none" }}>Text {CONTACT.phone}</a>
            <span style={{ color: "var(--hairline-strong)" }}>·</span>
            <a href={CONTACT.emailHref} style={{ fontSize: 13, color: "var(--action)", fontWeight: 700, textDecoration: "none" }}>Email Ernest</a>
          </div>
        </Card>

        <footer style={{ textAlign: "center", padding: "4px 0 2px", fontSize: 11.5, color: "var(--st-nodata)", lineHeight: 1.5 }}>
          Your numbers never left your browser. This page is a preview, not a contract.
        </footer>
      </main>
    </div>
  );
}
