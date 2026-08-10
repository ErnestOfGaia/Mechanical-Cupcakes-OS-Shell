"use client";

import { useCallback, useMemo, useState } from "react";
import { KINDS, kindOf } from "@/lib/kinds";
import {
  blankBoard, blocks, cadenceLine, decided, flagged, mergeBoard, normalise,
  nudge, openBlockers, setVerdict, settle, slug, toMarkdown,
} from "@/lib/board";
import { prefixError, tokenError } from "@/lib/token";
import { voiceWarning } from "@/lib/voice";
import { parseSlotDate, projectMonth, withSlotDate } from "@/lib/calendar";
import { checkPlacement, noteBlockerNudge, placement, placementNudge } from "@/lib/rule";
import CalendarPanel from "./CalendarPanel";
import ReadmePanel from "./ReadmePanel";
import type { Board, BoardKind, Person, Verdict, Weekday, Workspace } from "@/lib/types";

const KEY = "mcos-workshop-v1";
const WHO: Record<Person, string> = { E: "Ernest", K: "Katrina" };
const STAGES: Record<string, string> = {
  spark: "Spark", shaping: "Shaping", ready: "Ready to commit", archived: "Archived",
};
const CHANNELS = ["Blog", "LinkedIn", "YouTube", "Medium", "X", "Facebook", "Google Business"];

type Tab = "pitch" | "bench" | "arc" | "gate" | "handoff" | "calendar" | "readme";

interface Props {
  initialBoards: Board[];
  vault: { enabled: boolean; writable: boolean; reason?: string };
  loadErrors: string[];
}

export default function Workshop({ initialBoards, vault, loadErrors }: Props) {
  /**
   * Initialised synchronously — this component is never server-rendered (see
   * WorkshopClient), so localStorage is available on the very first render and there
   * is no effect, no cascade, and no hydration mismatch.
   *
   * The vault wins when it is on: what is on disk is what the automations read, so it
   * is the truth. Browser storage is the fallback, and the only store a client has.
   */
  const [ws, setWs] = useState<Workspace>(() => {
    let stored: Workspace | null = null;
    try {
      const raw = typeof localStorage !== "undefined" ? localStorage.getItem(KEY) : null;
      if (raw) stored = JSON.parse(raw) as Workspace;
    } catch { stored = null; }

    if (vault.enabled && initialBoards.length) {
      const boards = initialBoards.map((b) => normalise(b));
      return { version: 3, identity: stored?.identity ?? "E", activeId: boards[0].id, campaigns: boards };
    }
    if (stored?.campaigns?.length) {
      return { ...stored, campaigns: stored.campaigns.map((b) => normalise(b)) };
    }
    const b = blankBoard("My first campaign", "campaign");
    return { version: 3, identity: "E", activeId: b.id, campaigns: [b] };
  });
  const [tab, setTab] = useState<Tab>("pitch");
  const [filter, setFilter] = useState("all");
  const [msg, setMsg] = useState("");
  /** Set when a save was refused because the file moved underneath us. */
  const [conflict, setConflict] = useState<string | null>(null);

  const persist = useCallback((next: Workspace) => {
    setWs(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* private mode */ }
  }, []);

  const cur = useMemo(
    () => ws.campaigns.find((b) => b.id === ws.activeId) ?? ws.campaigns[0] ?? null,
    [ws],
  );

  const update = useCallback((fn: (b: Board) => void) => {
    if (!cur) return;
    const next: Workspace = { ...ws, campaigns: ws.campaigns.map((b) => (b.id === cur.id ? { ...b } : b)) };
    const target = next.campaigns.find((b) => b.id === cur.id)!;
    fn(target);
    persist(next);
  }, [ws, cur, persist]);

  if (!cur) return <main style={{ padding: 40 }} className="eyebrow">No boards. Add one from the rail.</main>;

  const K = kindOf(cur.kind);
  const me = ws.identity;
  const other: Person = me === "E" ? "K" : "E";
  const [head, tail] = nudge(cur);
  const today = new Date().toISOString().slice(0, 10);

  // This month, for the calendar tab badge — the projection runs over ALL boards.
  const thisMonth = today.slice(0, 7);
  const monthCollisions = projectMonth(ws.campaigns, thisMonth).collisions.length;

  // Computed once per render rather than per card: the rule scans the whole board.
  const placeState: Record<string, string> = Object.fromEntries(
    checkPlacement(cur).rows.map((r) => [r.id, r.state]),
  );

  const visible = cur.ideas.filter((i) => {
    if (filter === "all") return true;
    if (filter === "undecided") return !decided(i);
    if (filter === "in") return decided(i) === "in";
    if (filter === "cut") return decided(i) === "cut";
    if (filter === "flagged") return flagged(i);
    return true;
  });

  async function saveToVault(force = false) {
    setMsg("Saving…");
    setConflict(null);
    try {
      const res = await fetch("/api/boards", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ board: cur, force }),
      });
      const data = await res.json();
      // Check ok before trusting the body — a 409 still parses as JSON.
      if (res.ok && data.ok) {
        // Carry the new mtime so the next save can prove which version it edited.
        update((b) => { b.mtimeMs = data.mtimeMs; });
        setMsg(`Saved to ${data.path}${data.backup ? " — previous version copied aside" : ""}`);
        return;
      }
      if (res.status === 409 && data.conflict) {
        setConflict(data.error ?? "that board changed on disk");
        setMsg("");
        return;
      }
      setMsg(`Not saved — ${data.error ?? res.status}`);
    } catch (e) {
      setMsg(`Not saved — ${e instanceof Error ? e.message : "request failed"}`);
    }
  }

  /**
   * Re-read the vault. Needed because this app is no longer the only writer — the MCP
   * server edits the same board.json from a Claude session — so "what is on screen" and
   * "what is on disk" can drift while the page sits open.
   */
  async function reloadFromVault() {
    setMsg("Re-reading the vault…");
    try {
      const res = await fetch("/api/boards");
      const data = await res.json();
      if (!data.enabled) { setMsg(`Not reloaded — ${data.reason ?? "the vault is off"}`); return; }
      const fresh = (data.boards as Board[]).map((b) => normalise(b));
      if (!fresh.length) { setMsg("Not reloaded — the vault returned no boards."); return; }
      const keep = fresh.some((b) => b.id === ws.activeId) ? ws.activeId : fresh[0].id;
      persist({ ...ws, campaigns: fresh, activeId: keep });
      setConflict(null);
      setMsg(`Re-read ${fresh.length} board(s) from the vault.`);
    } catch (e) {
      setMsg(`Not reloaded — ${e instanceof Error ? e.message : "request failed"}`);
    }
  }

  function download(name: string, text: string) {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    setMsg(`Downloaded ${name}`);
  }

  const S = styles;

  return (
    <div style={S.shell}>
      <aside style={S.rail}>
        <div>
          <div className="eyebrow">EOG Back Office</div>
          <div className="display" style={{ fontSize: 22, lineHeight: 1.1 }}>Campaign<br />Workshop</div>
        </div>

        <div style={S.block}>
          <span className="eyebrow">Board</span>
          <select
            value={cur.id}
            onChange={(e) => persist({ ...ws, activeId: e.target.value })}
            style={S.select}
            aria-label="Open a board"
          >
            {ws.campaigns
              .filter((b) => ws.showArchived || b.stage !== "archived" || b.id === ws.activeId)
              .map((b) => (
                <option key={b.id} value={b.id}>
                  {KINDS[b.kind].label} · {b.name} · {STAGES[b.stage]}
                </option>
              ))}
          </select>
          <div style={S.miniRow}>
            {(Object.keys(KINDS) as BoardKind[]).map((k) => (
              <button
                key={k}
                type="button"
                style={S.mini}
                onClick={() => {
                  const name = window.prompt(`Name this ${KINDS[k].label.toLowerCase()}:`, "");
                  if (name === null) return;
                  const b = blankBoard(name.trim() || `Untitled ${k}`, k);
                  persist({ ...ws, campaigns: [...ws.campaigns, b], activeId: b.id });
                }}
              >
                + {KINDS[k].label}
              </button>
            ))}
          </div>
        </div>

        <div style={S.block}>
          <span className="eyebrow">Signed in as</span>
          <div style={{ display: "flex", gap: 6 }}>
            {(["E", "K"] as Person[]).map((p) => (
              <button
                key={p}
                type="button"
                aria-pressed={me === p}
                onClick={() => persist({ ...ws, identity: p })}
                style={{ ...S.mini, flex: 1, ...(me === p ? S.miniOn : {}) }}
              >
                {WHO[p]}
              </button>
            ))}
          </div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 1 }} aria-label="Sections">
          {(["pitch", "bench", "arc", "gate", "handoff", "calendar", "readme"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              aria-current={tab === t}
              onClick={() => setTab(t)}
              style={{ ...S.tab, ...(tab === t ? S.tabOn : {}) }}
            >
              {t === "arc" ? K.arcTitle.replace("The ", "") : t === "readme" ? "README" : t[0].toUpperCase() + t.slice(1)}
              <span className="mono" style={{ fontSize: 11, color: "var(--ink-faint)" }}>
                {t === "bench" ? cur.ideas.length : t === "arc" ? cur.arc.length
                  : t === "gate" ? `${cur.gate.filter((g) => g.d).length}/${cur.gate.length}`
                  : t === "calendar" ? (monthCollisions ? `⚠️${monthCollisions}` : "") : ""}
              </span>
            </button>
          ))}
        </nav>

        <div style={S.storage}>
          <div className="eyebrow" style={{ marginBottom: 4 }}>Storage</div>
          {vault.enabled ? (
            <>Vault {vault.writable ? "read/write" : "read-only"} — boards live in the Marketing
            department and the automations read them from there.</>
          ) : (
            <>Browser only. {vault.reason ?? "The vault is switched off."} Nothing is written to disk.</>
          )}
          {loadErrors.length > 0 && (
            <div style={{ color: "var(--cut)", marginTop: 6 }}>{loadErrors.length} scan problem(s)</div>
          )}
          {vault.enabled && (
            <button type="button" style={{ ...S.mini, width: "100%", marginTop: 8 }} onClick={reloadFromVault}>
              Re-read the vault
            </button>
          )}
        </div>
      </aside>

      <main style={S.main}>
        {tab === "pitch" && (
          <section>
            <p className="eyebrow" style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {K.label}
              <select
                value={cur.stage}
                onChange={(e) => update((b) => { b.stage = e.target.value as Board["stage"]; })}
                style={S.stagePick}
                aria-label="How far along is this board"
              >
                {Object.entries(STAGES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </p>
            <input
              className="ed display"
              style={{ fontSize: 34, padding: 0, marginBottom: 6 }}
              value={cur.name}
              aria-label="Board name"
              onChange={(e) => update((b) => { b.name = e.target.value; })}
            />
            <textarea
              className="ed"
              rows={2}
              style={{ fontSize: 16, color: "var(--ink-soft)", maxWidth: "62ch", marginBottom: 18 }}
              placeholder="One line: what is this and who is it for?"
              value={cur.tagline}
              onChange={(e) => update((b) => { b.tagline = e.target.value; })}
            />

            <div style={S.nudge}>
              <b style={{ color: "var(--ink)" }}>{head}</b>
              <span>{tail}</span>
            </div>

            <h2 className="display" style={S.h2}>Channels it will need</h2>
            <p style={S.p}>
              Channels are not campaigns — they are the machinery a campaign pulls in when it needs
              them. Declaring one here does not copy its mechanics; those stay in the channel&apos;s
              own board and folder.
            </p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
              {CHANNELS.map((ch) => {
                const on = cur.channels.includes(ch);
                return (
                  <button
                    key={ch}
                    type="button"
                    aria-pressed={on}
                    onClick={() => update((b) => {
                      b.channels = on ? b.channels.filter((c) => c !== ch) : [...b.channels, ch];
                    })}
                    style={{ ...S.chip, ...(on ? S.chipOn : {}) }}
                  >
                    {ch}
                  </button>
                );
              })}
            </div>

            {cur.kind === "campaign" && (
              <>
                <h2 className="display" style={S.h2}>Commitment</h2>
                <p style={S.p}>
                  The Workshop is the commitment gate: approving a campaign approves its cadence
                  too, and minting a UTM token and declaring it in the register are the same act.
                  One campaign, one token — two campaigns sharing one is unrecoverable.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 22px", maxWidth: 560, marginTop: 12 }}>
                  <Field label="utm_campaign token">
                    <input className="ed mono" style={{ fontSize: 13 }} value={cur.token}
                      placeholder="lowercase-kebab, ≤24 chars"
                      onChange={(e) => update((b) => { b.token = e.target.value; })} />
                    {tokenError(cur.token) && <span style={{ fontSize: 11.5, color: "var(--cut)" }}>{tokenError(cur.token)}</span>}
                  </Field>
                  <Field label="utm_content prefix (posts become prefix-NN)">
                    <input className="ed mono" style={{ fontSize: 13 }} value={cur.contentPrefix}
                      placeholder="e.g. lmvp"
                      onChange={(e) => update((b) => { b.contentPrefix = e.target.value; })} />
                    {prefixError(cur.contentPrefix) && <span style={{ fontSize: 11.5, color: "var(--cut)" }}>{prefixError(cur.contentPrefix)}</span>}
                  </Field>
                </div>

                <Field label="Cadence — internal only (rule 11): typed here, computed everywhere">
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                    {(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as Weekday[]).map((d) => {
                      const on = cur.cadence?.days.includes(d) ?? false;
                      return (
                        <button key={d} type="button" aria-pressed={on}
                          style={{ ...S.chip, fontSize: 11, padding: "3px 9px", ...(on ? S.chipOn : {}) }}
                          onClick={() => update((b) => {
                            const days = new Set(b.cadence?.days ?? []);
                            if (on) days.delete(d); else days.add(d);
                            const ordered = (["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as Weekday[]).filter((x) => days.has(x));
                            b.cadence = ordered.length ? { ...(b.cadence ?? { start: "" }), days: ordered } : null;
                          })}>
                          {d}
                        </button>
                      );
                    })}
                    <select
                      value={String(cur.cadence?.everyWeeks ?? 1)}
                      disabled={!cur.cadence}
                      aria-label="How often"
                      style={S.stagePick}
                      onChange={(e) => update((b) => {
                        if (b.cadence) b.cadence = { ...b.cadence, everyWeeks: Number(e.target.value) };
                      })}>
                      <option value="1">weekly</option>
                      <option value="2">every 2 weeks</option>
                    </select>
                    <input type="date" className="ed mono" aria-label="First drop date"
                      style={{ fontSize: 12.5, width: 150 }}
                      value={cur.cadence?.start ?? ""}
                      disabled={!cur.cadence}
                      onChange={(e) => update((b) => {
                        if (b.cadence) b.cadence = { ...b.cadence, start: e.target.value };
                      })} />
                  </div>
                  <span className="mono" style={{ fontSize: 11.5, color: "var(--ink-faint)" }}>
                    {cadenceLine(cur.cadence)}
                  </span>
                </Field>
              </>
            )}

            {cur.seams.length > 0 && (
              <>
                <h2 className="display" style={S.h2}>Seams — open, flagged not hidden</h2>
                {cur.seams.map((s, i) => (
                  <div key={i} style={S.seam}>
                    <h3 style={S.seamH}><span style={S.seamTag}>{s.tag}</span>{s.h}</h3>
                    <p style={{ margin: 0, fontSize: 13.5, color: "var(--ink-soft)" }}>{s.p}</p>
                  </div>
                ))}
              </>
            )}
          </section>
        )}

        {tab === "bench" && (
          <section>
            <p className="eyebrow">Ideation</p>
            <h1 className="display" style={S.h1}>The bench</h1>
            <p style={S.p}>{K.benchBlurb}</p>

            <PlacementNudge board={cur} />

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "16px 0" }}>
              {["all", "undecided", "in", "cut", "flagged"].map((f) => (
                <button
                  key={f}
                  type="button"
                  aria-pressed={filter === f}
                  onClick={() => setFilter(f)}
                  style={{ ...S.chip, ...(filter === f ? S.filterOn : {}) }}
                >
                  {f === "flagged" ? "Katrina differs" : f[0].toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {cur.ideas.length === 0 && (
              <div style={S.empty}>
                Nothing on the bench yet. Add the first one — even a bad idea gives the next one
                something to be better than.
              </div>
            )}

            {visible.map((idea) => {
              const st = settle(idea);
              const border = st === "settled-in" ? "var(--in)"
                : st === "settled-cut" ? "var(--cut)"
                : st === "settled-hold" ? "var(--hold)"
                : st === "input" ? "var(--teal)" : "var(--rule)";
              const idx = cur.ideas.indexOf(idea);
              return (
                <article key={idea.id} style={{ ...S.cue, borderLeftColor: border, opacity: st === "settled-cut" ? 0.62 : 1 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
                      <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-faint)" }}>{idea.id}</span>
                      <span style={S.tagChip}>{idea.tag}</span>
                      {/* Flags one idea as screen-recording material without claiming
                          YouTube as a channel for the whole campaign. */}
                      <button type="button" aria-pressed={idea.yt}
                        title="Good YouTube material — a demonstration beat that is a screen recording by nature."
                        style={{ ...S.chip, fontSize: 10, padding: "1px 8px", ...(idea.yt ? S.chipOn : {}) }}
                        onClick={() => update((b) => { b.ideas[idx] = { ...b.ideas[idx], yt: !b.ideas[idx].yt }; })}>
                        YT seed
                      </button>
                      {flagged(idea) && <span className="mono" style={{ fontSize: 10, color: "var(--amber)", textTransform: "uppercase" }}>Katrina differs — worth a read</span>}
                      {st === "input" && <span className="mono" style={{ fontSize: 10, color: "var(--teal)", textTransform: "uppercase" }}>her input, waiting on you</span>}
                      {decided(idea) === "in" && (() => {
                        const p = placement(idea, cur);
                        if (p === "drop") return <span className="mono" style={{ fontSize: 10, color: "var(--in)", textTransform: "uppercase" }}>has a drop</span>;
                        if (p === "placedIn") return (
                          <button type="button" aria-pressed
                            title={`Lives inside ${idea.placedIn!.ref}${idea.placedIn!.role ? ` as its ${idea.placedIn!.role}` : ""}. Click to clear.`}
                            style={{ ...S.chip, fontSize: 10, padding: "1px 8px", borderColor: "var(--in)", color: "var(--in)" }}
                            onClick={() => {
                              if (!window.confirm(`${idea.id} is marked as living inside ${idea.placedIn!.ref}. Clear that?`)) return;
                              update((b) => {
                                const t = b.ideas.findIndex((x) => x.id === idea.id);
                                b.ideas[t] = { ...b.ideas[t], placedIn: null };
                              });
                            }}>
                            inside {idea.placedIn!.ref}{idea.placedIn!.role ? ` · ${idea.placedIn!.role}` : ""}
                          </button>
                        );
                        // Held by a seam is an answer, not a gap — saying "unplaced"
                        // there would push Ernest to re-solve something already tracked.
                        const held = placeState[idea.id] === "held";
                        // A drop is derived from the arc, so it is not togglable here —
                        // only the seed is, and only Ernest's column moves it.
                        return (
                          <button type="button" aria-pressed={p === "seed"}
                            title={held
                              ? "A seam names this idea, so it is accounted for. Click to send it to the seed bank instead."
                              : "Seed bank: it ships, but inside another post or another campaign — not as its own drop."}
                            style={{ ...S.chip, fontSize: 10, padding: "1px 8px",
                              ...(p === "seed" ? S.chipOn : held ? { borderColor: "var(--amber-bright)", color: "var(--amber)" } : { borderColor: "var(--cut)", color: "var(--cut)" }) }}
                            onClick={() => update((b) => {
                              const t = b.ideas.findIndex((x) => x.id === idea.id);
                              b.ideas[t] = { ...b.ideas[t], placed: b.ideas[t].placed === "seed" ? null : "seed" };
                            })}>
                            {p === "seed" ? "seed bank" : held ? "held by a seam" : "unplaced"}
                          </button>
                        );
                      })()}
                      {decided(idea) === "in" && placement(idea, cur) !== "drop" && placement(idea, cur) !== "placedIn" && (
                        <button type="button"
                          title="This idea ships INSIDE another drop or idea — a frame, a paragraph, an opening — rather than getting its own slot or going back to the bank."
                          style={{ ...S.chip, fontSize: 10, padding: "1px 8px" }}
                          onClick={() => {
                            const ref = window.prompt(`${idea.id} lives inside which drop or idea? (e.g. IDEA-04)`, "");
                            if (!ref?.trim()) return;
                            const role = window.prompt("Its role there (frame · paragraph · opening · promo hook):", "") ?? "";
                            update((b) => {
                              const t = b.ideas.findIndex((x) => x.id === idea.id);
                              b.ideas[t] = { ...b.ideas[t], placedIn: { ref: ref.trim(), role: role.trim() }, placed: null };
                            });
                          }}>
                          place inside…
                        </button>
                      )}
                    </div>
                    <textarea className="ed display" rows={1} style={{ fontSize: 18 }} value={idea.title}
                      onChange={(e) => update((b) => { b.ideas[idx].title = e.target.value; })} />
                    <Field label="The story">
                      <textarea className="ed" rows={3} value={idea.story}
                        onChange={(e) => update((b) => { b.ideas[idx].story = e.target.value; })} />
                    </Field>
                    <Field label="Asset it carries">
                      <textarea className="ed mono" rows={1} style={{ fontSize: 12 }} value={idea.asset}
                        onChange={(e) => update((b) => { b.ideas[idx].asset = e.target.value; })} />
                    </Field>
                    <Field label="What it proves">
                      <textarea className="ed" rows={2} style={{ fontSize: 13 }} value={idea.proves}
                        onChange={(e) => update((b) => { b.ideas[idx].proves = e.target.value; })} />
                    </Field>
                    <Field label="Cover image seed">
                      <textarea className="ed" rows={2} style={{ fontSize: 13 }} value={idea.cover}
                        placeholder="What the cover shows. No figures, no third-party marks — and keep anything that will date out of the image."
                        onChange={(e) => update((b) => { b.ideas[idx].cover = e.target.value; })} />
                    </Field>
                    <button type="button" style={S.link}
                      onClick={() => update((b) => { b.ideas.splice(idx, 1); })}>Remove</button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {[me, other].map((p) => (
                      <div key={p} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        <span className="eyebrow">
                          {p === "E" ? "Ernest — decides" : "Katrina — input, optional"}{p === me ? " (you)" : ""}
                        </span>
                        <div style={{ display: "flex", gap: 4 }}>
                          {(["in", "hold", "cut"] as Verdict[]).map((v) => (
                            <button key={v} type="button" aria-pressed={idea.v[p] === v}
                              style={{ ...S.vbtn, ...(idea.v[p] === v ? vOn(v!) : {}) }}
                              onClick={() => update((b) => {
                                // Placement moves with the verdict — see setVerdict:
                                // the seed is created automatically, the drop never is.
                                b.ideas = b.ideas.map((x) => (x.id === idea.id ? { ...x } : x));
                                const warn = setVerdict(b, idea.id, p, v);
                                setMsg(warn.join("  "));
                              })}>
                              {v === "in" ? "In" : v === "hold" ? "Not yet" : "Cut"}
                            </button>
                          ))}
                        </div>
                        <textarea className="ed" rows={2} style={{ fontSize: 13 }} value={idea.n[p]}
                          placeholder={p === me ? "Your note" : `${WHO[p]}'s note`}
                          onChange={(e) => update((b) => {
                            b.ideas[idx] = { ...b.ideas[idx], n: { ...b.ideas[idx].n, [p]: e.target.value } };
                          })} />
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}

            <button type="button" style={S.btnGhost} onClick={() => update((b) => {
              let n = b.ideas.length + 1; let id = "";
              do { id = `IDEA-${String(n).padStart(2, "0")}`; n += 1; } while (b.ideas.some((x) => x.id === id));
              b.ideas.push({ id, tag: cur.kind === "channel" ? "format" : "post", title: "Untitled",
                story: "", asset: "", proves: "", cover: "", yt: false, placed: null, placedIn: null,
                v: { E: null, K: null }, n: { E: "", K: "" } });
            })}>Add {cur.kind === "channel" ? "a format" : "an idea"}</button>
          </section>
        )}

        {tab === "arc" && (
          <section>
            <p className="eyebrow">{cur.kind === "channel" ? "Operating rhythm" : "Storyboard"}</p>
            <h1 className="display" style={S.h1}>{K.arcTitle}</h1>
            <p style={S.p}>{K.arcBlurb}</p>

            <PlacementNudge board={cur} />

            {cur.arc.length === 0 && (
              <div style={{ ...S.empty, marginTop: 16 }}>
                No {K.arcNoun}s yet. This section is for when the bench has settled enough that an
                order suggests itself — there is no rush to fill it.
              </div>
            )}

            {cur.arc.map((d, i) => (
              <div key={i} style={S.drop}>
                <div className="mono" style={{ fontSize: 11, color: "var(--ink-faint)", textTransform: "uppercase" }}>
                  <b className="display" style={{ display: "block", fontSize: 30, color: "var(--amber)", fontWeight: 400 }}>{i + 1}</b>
                  {K.arcNoun}
                </div>
                <div>
                  <textarea className="ed display" rows={1} style={{ fontSize: 18 }} value={d.title}
                    onChange={(e) => update((b) => { b.arc[i].title = e.target.value; })} />

                  {/* The date is not a field of its own — it lives inside the slot label,
                      which is what the calendar parses. So this edits that string
                      surgically and shows what the calendar will read back, because
                      "did this land on the 11th?" was previously unanswerable in the app. */}
                  <Field label={cur.kind === "channel" ? "Which day this slot runs" : "When it lands"}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <input type="date" className="ed mono" style={{ fontSize: 12.5, width: 155 }}
                        aria-label={`Date for ${d.slot || `drop ${i + 1}`}`}
                        value={parseSlotDate(d.slot ?? "", new Date().getUTCFullYear()) ?? ""}
                        onChange={(e) => update((b) => { b.arc[i].slot = withSlotDate(b.arc[i].slot ?? "", e.target.value); })} />
                      <span className="mono" style={{ fontSize: 11, color: "var(--ink-faint)" }}>
                        {parseSlotDate(d.slot ?? "", new Date().getUTCFullYear())
                          ? `on the calendar as ${parseSlotDate(d.slot ?? "", new Date().getUTCFullYear())}`
                          : "no date — this one is listed as unplaced, not shown on the calendar"}
                      </span>
                    </div>
                    <input className="ed mono" style={{ fontSize: 12, marginTop: 4 }} value={d.slot}
                      aria-label="Slot label"
                      placeholder={`${K.arcNoun} ${i + 1}`}
                      onChange={(e) => update((b) => { b.arc[i].slot = e.target.value; })} />
                  </Field>

                  {(["story", "track", "songs", "promo", "note"] as const).map((f) => (
                    <Field key={f} label={K.fields[f]}>
                      <textarea className="ed" rows={f === "story" ? 2 : 1}
                        style={f === "track" || f === "songs" ? { fontFamily: "var(--mono)", fontSize: 12 } : { fontSize: 13 }}
                        value={d[f]}
                        onChange={(e) => update((b) => { b.arc[i][f] = e.target.value; })} />
                    </Field>
                  ))}
                  <div style={{ display: "flex", gap: 14, marginTop: 10 }}>
                    <button type="button" style={S.link} disabled={i === 0}
                      onClick={() => update((b) => { [b.arc[i - 1], b.arc[i]] = [b.arc[i], b.arc[i - 1]]; })}>Move earlier</button>
                    <button type="button" style={S.link} disabled={i === cur.arc.length - 1}
                      onClick={() => update((b) => { [b.arc[i + 1], b.arc[i]] = [b.arc[i], b.arc[i + 1]]; })}>Move later</button>
                    <button type="button" style={S.link}
                      onClick={() => update((b) => { b.arc.splice(i, 1); })}>Remove</button>
                  </div>
                </div>
              </div>
            ))}

            <button type="button" style={S.btnGhost} onClick={() => update((b) => {
              b.arc.push({ slot: `${K.arcNoun} ${b.arc.length + 1}`, ref: "", title: "Untitled",
                story: "", track: "", songs: "", promo: "", note: "" });
            })}>Add a {K.arcNoun}</button>
          </section>
        )}

        {tab === "gate" && (
          <section>
            <p className="eyebrow">Commit gate</p>
            <h1 className="display" style={S.h1}>What must be true before this leaves the workshop</h1>
            <p style={S.p}>
              Every unticked blocking line is a way this goes out wrong. Items marked optional are
              Katrina&apos;s — welcome, but they never hold you up.
            </p>
            <div style={{ marginTop: 16 }}>
              {cur.gate.map((g, i) => (
                <div key={i} style={S.gateRow}>
                  <input type="checkbox" checked={g.d} aria-label="Cleared"
                    onChange={(e) => update((b) => { b.gate[i].d = e.target.checked; })}
                    style={{ width: 15, height: 15, marginTop: 4, accentColor: "var(--teal)" }} />
                  <div>
                    <textarea className="ed" rows={1} value={g.t}
                      style={g.d ? { textDecoration: "line-through", color: "var(--ink-faint)" } : undefined}
                      onChange={(e) => update((b) => { b.gate[i].t = e.target.value; })} />
                    {!blocks(g) && <span style={S.optional}>optional</span>}
                    <textarea className="ed" rows={1} value={g.n} placeholder="note"
                      style={{ fontSize: 13, color: "var(--ink-faint)" }}
                      onChange={(e) => update((b) => { b.gate[i].n = e.target.value; })} />
                  </div>
                  <div className="eyebrow" style={{ textAlign: "right", paddingTop: 4 }}>
                    {g.o === "both" ? "both" : WHO[g.o]}
                  </div>
                </div>
              ))}
            </div>
            <button type="button" style={S.btnGhost} onClick={() => update((b) => {
              b.gate.push({ t: "New gate item", o: "both", d: false, blocking: true, n: "" });
            })}>Add a gate item</button>
          </section>
        )}

        {tab === "handoff" && (
          <section>
            <p className="eyebrow">Handoff</p>
            <h1 className="display" style={S.h1}>Out of the workshop</h1>
            <p style={S.p}>
              {vault.enabled
                ? "Save writes board.json back into the Marketing department, where the content automations read it."
                : "The vault is off, so saving to disk is unavailable. Download the files and file them by hand."}
            </p>

            {conflict && (
              <div style={S.conflict} role="alert">
                <b style={{ color: "var(--ink)" }}>Not saved — {conflict}.</b>
                <span>
                  Something else wrote this board since you opened it: a Claude session through
                  the MCP server, another tab, or an edit made by hand. Nothing has been
                  overwritten. Re-read the vault to pick up their version and lose your unsaved
                  edits, or overwrite theirs with what is on screen.
                </span>
                <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginTop: 4 }}>
                  <button type="button" style={S.btn} onClick={reloadFromVault}>Re-read the vault</button>
                  <button type="button" style={S.btnGhostFlat} onClick={() => saveToVault(true)}>
                    Overwrite what is on disk
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 9, flexWrap: "wrap", margin: "16px 0" }}>
              {vault.enabled && vault.writable && (
                <button type="button" style={S.btn} onClick={() => saveToVault()}>Save to the vault</button>
              )}
              <button type="button" style={S.btnGhost}
                onClick={() => download(`${slug(cur.name) || "board"}-${today}.md`, toMarkdown(cur, today))}>
                Plan (.md)
              </button>
              <button type="button" style={S.btnGhost}
                onClick={() => download(`board-${slug(cur.name) || "x"}-${today}.json`,
                  JSON.stringify({ version: 3, identity: me, activeId: cur.id, campaigns: [cur] }, null, 2))}>
                This board (.json)
              </button>
              <button type="button" style={S.btnGhost}
                onClick={() => download(`workshop-backup-${today}.json`, JSON.stringify(ws, null, 2))}>
                Everything (.json)
              </button>
              <button type="button" style={S.btnGhost} onClick={() => update((b) => {
                const open = openBlockers(b);
                if (open && !window.confirm(`${open} blocking gate item${open === 1 ? " is" : "s are"} still unticked. Archive anyway?`)) return;
                b.stage = "archived";
              })}>Commit and archive</button>
            </div>
            <p className="mono" style={{ fontSize: 12.5, color: msg.startsWith("Not saved") ? "var(--cut)" : "var(--teal)", minHeight: "1.4em" }}>{msg}</p>

            <h2 className="display" style={S.h2}>Preview</h2>
            {(() => {
              const w = voiceWarning(toMarkdown(cur, today));
              if (!w) return null;
              return (
                <div style={{ ...S.nudge, borderLeftColor: "var(--cut)", flexDirection: "column", gap: 4 }} role="alert">
                  <pre style={{ margin: 0, font: "inherit", whiteSpace: "pre-wrap" }}>{w}</pre>
                </div>
              );
            })()}
            <pre style={S.pre}>{toMarkdown(cur, today)}</pre>

            <h2 className="display" style={S.h2}>Bring a board in</h2>
            <p style={S.p}>
              Paste an export — including one from the browser artifact, which uses the same schema.
              Your own verdicts are never overwritten.
            </p>
            <ImportBox onImport={(text, takeText) => {
              try {
                const inc = JSON.parse(text) as { campaigns?: unknown[] };
                const list = Array.isArray(inc.campaigns) ? inc.campaigns : [inc];
                let changed = 0, added = 0;
                const next: Workspace = { ...ws, campaigns: [...ws.campaigns] };
                list.forEach((raw) => {
                  const b = normalise(raw as Partial<Board>);
                  const mine = next.campaigns.find((x) => x.id === b.id);
                  if (!mine) { next.campaigns.push(b); added += 1; }
                  else changed += mergeBoard(mine, b, me, takeText);
                });
                persist(next);
                setMsg(`Brought in ${list.length} board(s) — ${changed} change(s)${added ? `, ${added} new` : ""}.`);
              } catch {
                setMsg("Not imported — that isn't valid JSON.");
              }
            }} />
          </section>
        )}

        {tab === "calendar" && <CalendarPanel boards={ws.campaigns} initialMonth={thisMonth} />}

        {tab === "readme" && <ReadmePanel kind={cur.kind} />}
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ bits */

/**
 * Ernest's placement rule, run live on the board rather than as a report afterwards.
 * It never fixes anything — it names what is unplaced and leaves the judgment where it
 * belongs. Auto-creating would quietly decide.
 */
function PlacementNudge({ board }: { board: Board }) {
  const unplaced = placementNudge(board);
  const hidden = noteBlockerNudge(board);
  if (!unplaced && !hidden) return null;
  return (
    <div style={{ ...styles.nudge, borderLeftColor: unplaced ? "var(--cut)" : "var(--amber-bright)", flexDirection: "column", gap: 5 }}>
      {unplaced && <span><b style={{ color: "var(--ink)" }}>{unplaced}</b></span>}
      {hidden && <span>{hidden}</span>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 8 }}>
      <span className="eyebrow" style={{ display: "block", marginBottom: 2 }}>{label}</span>
      {children}
    </div>
  );
}

function ImportBox({ onImport }: { onImport: (text: string, takeText: boolean) => void }) {
  const [text, setText] = useState("");
  const [takeText, setTakeText] = useState(false);
  return (
    <>
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste the JSON you were sent"
        style={{ width: "100%", minHeight: 120, fontFamily: "var(--mono)", fontSize: 11.5, padding: 11,
          background: "var(--paper-raised)", color: "var(--ink)", border: "1px solid var(--rule)", borderRadius: 4 }} />
      <label style={{ display: "flex", gap: 7, alignItems: "center", fontSize: 13, color: "var(--ink-soft)", margin: "10px 0" }}>
        <input type="checkbox" checked={takeText} onChange={(e) => setTakeText(e.target.checked)} />
        Take their text edits too, not just verdicts
      </label>
      <button type="button" style={styles.btn} onClick={() => onImport(text, takeText)}>Bring it in</button>
    </>
  );
}

const vOn = (v: string): React.CSSProperties => ({
  background: `var(--${v}-wash)`, borderColor: `var(--${v})`, color: `var(--${v})`, fontWeight: 700,
});

const styles: Record<string, React.CSSProperties> = {
  shell: { display: "flex", alignItems: "flex-start", minHeight: "100dvh" },
  rail: { width: 236, flex: "0 0 236px", position: "sticky", top: 0, maxHeight: "100dvh", overflowY: "auto",
    padding: "22px 18px 28px", borderRight: "1px solid var(--rule)", background: "var(--paper-sunk)",
    display: "flex", flexDirection: "column", gap: 20 },
  block: { display: "flex", flexDirection: "column", gap: 7 },
  select: { width: "100%", font: "inherit", fontSize: 13, padding: "7px 8px", background: "var(--paper-raised)",
    color: "var(--ink)", border: "1px solid var(--rule)", borderRadius: 3 },
  miniRow: { display: "flex", gap: 5 },
  mini: { flex: 1, font: "inherit", fontSize: 11.5, padding: "5px 7px", background: "transparent",
    color: "var(--ink-soft)", border: "1px solid var(--rule)", borderRadius: 3, cursor: "pointer" },
  miniOn: { background: "var(--amber)", borderColor: "var(--amber)", color: "#FFF9F0", fontWeight: 600 },
  tab: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, textAlign: "left",
    font: "inherit", padding: "8px 10px", background: "transparent", border: 0,
    borderLeft: "2px solid transparent", color: "var(--ink-soft)", cursor: "pointer" },
  tabOn: { borderLeftColor: "var(--amber-bright)", background: "var(--paper-raised)", color: "var(--ink)", fontWeight: 600 },
  storage: { fontSize: 11.5, lineHeight: 1.5, color: "var(--ink-faint)", borderTop: "1px solid var(--rule)", paddingTop: 12 },
  main: { flex: "1 1 auto", minWidth: 0, padding: "30px 34px 90px", maxWidth: 1120 },
  h1: { fontSize: 34, margin: "0 0 6px" },
  h2: { fontSize: 21, margin: "34px 0 12px" },
  p: { fontSize: 15, color: "var(--ink-soft)", maxWidth: "66ch", margin: 0 },
  nudge: { display: "flex", gap: 10, alignItems: "baseline", border: "1px solid var(--rule)",
    borderLeft: "3px solid var(--teal)", background: "var(--paper-raised)", padding: "11px 15px",
    margin: "18px 0 6px", fontSize: 13.5, color: "var(--ink-soft)", maxWidth: "78ch" },
  seam: { border: "1px solid var(--rule)", borderLeft: "3px solid var(--amber-bright)",
    background: "var(--paper-raised)", padding: "13px 16px", marginBottom: 10 },
  seamH: { margin: "0 0 5px", fontSize: 14.5, fontWeight: 600, display: "flex", gap: 9, alignItems: "baseline", flexWrap: "wrap" },
  seamTag: { fontFamily: "var(--mono)", fontSize: 9.5, letterSpacing: ".12em", textTransform: "uppercase",
    padding: "2px 6px", background: "var(--amber)", color: "#FFF9F0" },
  cue: { border: "1px solid var(--rule)", borderLeft: "3px solid var(--rule)", background: "var(--paper-raised)",
    padding: "14px 16px", marginBottom: 9, display: "grid", gridTemplateColumns: "1fr 190px", gap: "4px 22px" },
  tagChip: { fontFamily: "var(--mono)", fontSize: 9.5, letterSpacing: ".1em", textTransform: "uppercase",
    padding: "2px 6px", border: "1px solid var(--teal)", color: "var(--teal)" },
  vbtn: { flex: 1, font: "inherit", fontSize: 11.5, padding: "5px 2px", background: "transparent",
    color: "var(--ink-faint)", border: "1px solid var(--rule)", borderRadius: 3, cursor: "pointer" },
  chip: { font: "inherit", fontSize: 12, padding: "5px 11px", background: "transparent",
    border: "1px solid var(--rule)", borderRadius: 999, color: "var(--ink-soft)", cursor: "pointer" },
  chipOn: { background: "var(--teal)", borderColor: "var(--teal)", color: "var(--paper)", fontWeight: 600 },
  filterOn: { background: "var(--ink)", borderColor: "var(--ink)", color: "var(--paper)" },
  drop: { display: "grid", gridTemplateColumns: "62px 1fr", gap: "0 20px",
    borderTop: "1px solid var(--rule)", padding: "18px 0" },
  gateRow: { display: "grid", gridTemplateColumns: "24px 1fr 118px", gap: 12, alignItems: "start",
    borderBottom: "1px solid var(--rule-soft)", padding: "11px 0" },
  optional: { fontFamily: "var(--mono)", fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase",
    color: "var(--ink-faint)", border: "1px solid var(--rule)", padding: "1px 5px", marginLeft: 6 },
  empty: { border: "1px dashed var(--rule)", borderRadius: 4, padding: 22, color: "var(--ink-faint)",
    fontSize: 13.5, maxWidth: "70ch" },
  btn: { font: "inherit", fontSize: 13, padding: "8px 15px", background: "var(--amber)", color: "#FFF9F0",
    border: "1px solid var(--amber)", borderRadius: 3, cursor: "pointer" },
  btnGhost: { font: "inherit", fontSize: 13, padding: "8px 15px", background: "transparent",
    color: "var(--ink-soft)", border: "1px solid var(--rule)", borderRadius: 3, cursor: "pointer", marginTop: 14 },
  btnGhostFlat: { font: "inherit", fontSize: 13, padding: "8px 15px", background: "transparent",
    color: "var(--ink-soft)", border: "1px solid var(--rule)", borderRadius: 3, cursor: "pointer" },
  conflict: { display: "flex", flexDirection: "column", gap: 7, border: "1px solid var(--cut)",
    borderLeft: "3px solid var(--cut)", background: "var(--paper-raised)", padding: "13px 16px",
    margin: "16px 0", fontSize: 13.5, color: "var(--ink-soft)", maxWidth: "78ch" },
  link: { font: "inherit", fontSize: 12, background: "none", border: 0, padding: 0, color: "var(--ink-faint)",
    cursor: "pointer", textDecoration: "underline", marginTop: 10 },
  pre: { fontFamily: "var(--mono)", fontSize: 11.5, lineHeight: 1.6, background: "var(--paper-sunk)",
    border: "1px solid var(--rule)", borderRadius: 4, padding: 16, overflowX: "auto", maxHeight: 460,
    overflowY: "auto", whiteSpace: "pre" },
  stagePick: { font: "inherit", fontFamily: "var(--mono)", fontSize: 10, letterSpacing: ".12em",
    textTransform: "uppercase", padding: "3px 7px", border: "1px solid var(--rule)",
    background: "var(--paper-raised)", color: "var(--ink-soft)", cursor: "pointer" },
};
