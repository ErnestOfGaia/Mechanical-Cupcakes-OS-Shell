"use client";

import { useState } from "react";
import { projectMonth, STANDING_STREAMS } from "@/lib/calendar";
import type { Board } from "@/lib/types";

/**
 * The §5.8 month-view projection, as a tab. Arithmetic on the boards already loaded —
 * no live integrations, deliberately: the reality view (blog + Postiz + manual
 * channels) is a different, deferred thing, and Seasonal Sprint Work is a third thing
 * that is research-gated. This answers exactly one question: "what would the month
 * look like if I commit this campaign at this cadence?"
 */

const CHANNEL_COLOUR: Record<string, string> = {
  Blog: "var(--teal)",
  LinkedIn: "var(--amber)",
  X: "var(--ink-soft)",
  YouTube: "var(--cut)",
};

function monthShift(month: string, by: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + by, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}

/** The grid's cells: leading blanks to align weekday columns (Mon-first), then the days. */
function monthCells(month: string): (string | null)[] {
  const [y, m] = month.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const lead = (first.getUTCDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`),
  ];
}

export default function CalendarPanel({ boards, initialMonth }: { boards: Board[]; initialMonth: string }) {
  const [month, setMonth] = useState(initialMonth);
  const p = projectMonth(boards, month);
  const byDate = new Map<string, typeof p.items>();
  for (const it of p.items) byDate.set(it.date, [...(byDate.get(it.date) ?? []), it]);
  const collisionDates = new Set(p.collisions.map((c) => `${c.date}|${c.channel}`));

  return (
    <section>
      <p className="eyebrow">Month projection</p>
      <h1 className="display" style={{ fontSize: 34, margin: "0 0 6px" }}>The calendar</h1>
      <p style={{ fontSize: 15, color: "var(--ink-soft)", maxWidth: "70ch", margin: 0 }}>
        What the month looks like if these boards run at these cadences — arithmetic on the
        boards, nothing else. It is <em>not</em> what is actually scheduled in Postiz or the
        blog admin (that is the deferred reality view), and dates here are internal —
        intentions live in the vault; promises live in published copy.
      </p>

      <div style={{ display: "flex", gap: 10, alignItems: "baseline", margin: "18px 0 10px" }}>
        <button type="button" style={ui.nav} onClick={() => setMonth(monthShift(month, -1))} aria-label="Previous month">←</button>
        <h2 className="display" style={{ fontSize: 21, margin: 0, minWidth: 180, textAlign: "center" }}>{monthLabel(month)}</h2>
        <button type="button" style={ui.nav} onClick={() => setMonth(monthShift(month, 1))} aria-label="Next month">→</button>
      </div>

      {p.collisions.length > 0 && (
        <div style={ui.collisionBanner} role="alert">
          <b style={{ color: "var(--ink)" }}>
            ⚠️ {p.collisions.length} channel collision{p.collisions.length === 1 ? "" : "s"} — two things on one channel on one day.
          </b>
          {p.collisions.map((c, i) => (
            <span key={i}>
              {c.date} on {c.channel}: {c.items.map((it) => `${it.campaign} (${it.kind})`).join("  +  ")}
            </span>
          ))}
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        <div style={ui.grid}>
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="mono" style={ui.dayHead}>{d}</div>
          ))}
          {monthCells(month).map((date, i) => {
            if (!date) return <div key={`x${i}`} style={{ ...ui.cell, background: "transparent", border: "none" }} />;
            const items = byDate.get(date) ?? [];
            return (
              <div key={date} style={ui.cell}>
                <span className="mono" style={ui.cellDate}>{Number(date.slice(8))}</span>
                {items.map((it, j) => {
                  const hot = collisionDates.has(`${it.date}|${it.channel}`);
                  return (
                    <div key={j}
                      title={`${it.campaign} — ${it.label}${it.qualifier ? ` ${it.qualifier}` : ""} · from ${it.source}`}
                      style={{
                        ...ui.item,
                        borderLeftColor: CHANNEL_COLOUR[it.channel] ?? "var(--rule)",
                        ...(hot ? { borderColor: "var(--cut)", background: "var(--cut-wash, var(--paper-raised))" } : {}),
                        ...(it.source === "cadence" ? { opacity: 0.72, fontStyle: "italic" } : {}),
                      }}>
                      <span className="mono" style={{ fontSize: 8.5, textTransform: "uppercase", color: "var(--ink-faint)" }}>
                        {it.channel}{it.kind === "promo" ? " promo" : ""}{hot ? " ⚠️" : ""}
                      </span>
                      <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {it.campaign}{it.qualifier ? ` ${it.qualifier}` : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {p.undated.length > 0 && (
        <>
          <h2 className="display" style={{ fontSize: 18, margin: "22px 0 6px" }}>Not placed — no date to put them on</h2>
          <p style={{ fontSize: 13, color: "var(--ink-faint)", maxWidth: "70ch", margin: "0 0 8px" }}>
            Listed rather than guessed: an empty-looking calendar with silent omissions would
            read as free time. Set a typed cadence on the Pitch tab, or date the arc slots, and
            these move onto the grid.
          </p>
          {p.undated.map((u, i) => (
            <div key={i} style={{ fontSize: 13, color: "var(--ink-soft)", padding: "3px 0" }}>
              <b>{u.campaign}</b> — {u.label} <span style={{ color: "var(--ink-faint)" }}>({u.why})</span>
            </div>
          ))}
        </>
      )}

      <p style={{ fontSize: 12, color: "var(--ink-faint)", marginTop: 22, maxWidth: "72ch" }}>
        Standing streams without a fixed day are not drawn:{" "}
        {STANDING_STREAMS.filter((s) => !s.day).map((s) => `${s.label} (${s.note})`).join("; ")}.
        Blog slots are Tue · Wed · Thu 9:00 AM PT; a blog drop generates its LinkedIn promo at
        10:30 when the campaign declares LinkedIn. Solid items carry authored dates; italic
        ones are projected from a cadence.
      </p>
    </section>
  );
}

const ui: Record<string, React.CSSProperties> = {
  nav: { font: "inherit", fontSize: 14, padding: "4px 12px", background: "transparent",
    color: "var(--ink-soft)", border: "1px solid var(--rule)", borderRadius: 3, cursor: "pointer" },
  grid: { display: "grid", gridTemplateColumns: "repeat(7, minmax(96px, 1fr))", gap: 4, minWidth: 700, marginTop: 6 },
  dayHead: { fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ink-faint)", padding: "2px 4px" },
  cell: { minHeight: 74, border: "1px solid var(--rule)", borderRadius: 3, background: "var(--paper-raised)", padding: "3px 4px" },
  cellDate: { fontSize: 10, color: "var(--ink-faint)", display: "block", marginBottom: 2 },
  item: { fontSize: 11, lineHeight: 1.3, border: "1px solid var(--rule)", borderLeft: "3px solid var(--rule)",
    borderRadius: 2, padding: "2px 5px", marginBottom: 3, background: "var(--paper)" },
  collisionBanner: { display: "flex", flexDirection: "column", gap: 4, border: "1px solid var(--cut)",
    borderLeft: "3px solid var(--cut)", background: "var(--paper-raised)", padding: "11px 15px",
    margin: "0 0 14px", fontSize: 13, color: "var(--ink-soft)", maxWidth: "80ch" },
};
