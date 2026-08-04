"use client";

import { useCallback, useMemo, useState } from "react";
import { KINDS, kindOf } from "@/lib/kinds";
import {
  blankBoard, blocks, decided, flagged, mergeBoard, normalise,
  nudge, openBlockers, settle, slug, toMarkdown,
} from "@/lib/board";
import type { Board, BoardKind, Person, Verdict, Workspace } from "@/lib/types";

const KEY = "mcos-workshop-v1";
const WHO: Record<Person, string> = { E: "Ernest", K: "Katrina" };
const STAGES: Record<string, string> = {
  spark: "Spark", shaping: "Shaping", ready: "Ready to commit", archived: "Archived",
};
const CHANNELS = ["Blog", "LinkedIn", "YouTube", "Medium", "X", "Facebook", "Google Business"];

type Tab = "pitch" | "bench" | "arc" | "gate" | "handoff";

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

  const visible = cur.ideas.filter((i) => {
    if (filter === "all") return true;
    if (filter === "undecided") return !decided(i);
    if (filter === "in") return decided(i) === "in";
    if (filter === "cut") return decided(i) === "cut";
    if (filter === "flagged") return flagged(i);
    return true;
  });

  async function saveToVault() {
    setMsg("Saving…");
    try {
      const res = await fetch("/api/boards", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ board: cur }),
      });
      const data = await res.json();
      // Check ok before trusting the body — a 409 still parses as JSON.
      setMsg(res.ok && data.ok ? `Saved to ${data.path}` : `Not saved — ${data.error ?? res.status}`);
    } catch (e) {
      setMsg(`Not saved — ${e instanceof Error ? e.message : "request failed"}`);
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
          {(["pitch", "bench", "arc", "gate", "handoff"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              aria-current={tab === t}
              onClick={() => setTab(t)}
              style={{ ...S.tab, ...(tab === t ? S.tabOn : {}) }}
            >
              {t === "arc" ? K.arcTitle.replace("The ", "") : t[0].toUpperCase() + t.slice(1)}
              <span className="mono" style={{ fontSize: 11, color: "var(--ink-faint)" }}>
                {t === "bench" ? cur.ideas.length : t === "arc" ? cur.arc.length
                  : t === "gate" ? `${cur.gate.filter((g) => g.d).length}/${cur.gate.length}` : ""}
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
                      {flagged(idea) && <span className="mono" style={{ fontSize: 10, color: "var(--amber)", textTransform: "uppercase" }}>Katrina differs — worth a read</span>}
                      {st === "input" && <span className="mono" style={{ fontSize: 10, color: "var(--teal)", textTransform: "uppercase" }}>her input, waiting on you</span>}
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
                                b.ideas[idx] = { ...b.ideas[idx], v: { ...b.ideas[idx].v, [p]: b.ideas[idx].v[p] === v ? null : v } };
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
                story: "", asset: "", proves: "", v: { E: null, K: null }, n: { E: "", K: "" } });
            })}>Add {cur.kind === "channel" ? "a format" : "an idea"}</button>
          </section>
        )}

        {tab === "arc" && (
          <section>
            <p className="eyebrow">{cur.kind === "channel" ? "Operating rhythm" : "Storyboard"}</p>
            <h1 className="display" style={S.h1}>{K.arcTitle}</h1>
            <p style={S.p}>{K.arcBlurb}</p>

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

            <div style={{ display: "flex", gap: 9, flexWrap: "wrap", margin: "16px 0" }}>
              {vault.enabled && vault.writable && (
                <button type="button" style={S.btn} onClick={saveToVault}>Save to the vault</button>
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
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ bits */

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
  link: { font: "inherit", fontSize: 12, background: "none", border: 0, padding: 0, color: "var(--ink-faint)",
    cursor: "pointer", textDecoration: "underline", marginTop: 10 },
  pre: { fontFamily: "var(--mono)", fontSize: 11.5, lineHeight: 1.6, background: "var(--paper-sunk)",
    border: "1px solid var(--rule)", borderRadius: 4, padding: 16, overflowX: "auto", maxHeight: 460,
    overflowY: "auto", whiteSpace: "pre" },
  stagePick: { font: "inherit", fontFamily: "var(--mono)", fontSize: 10, letterSpacing: ".12em",
    textTransform: "uppercase", padding: "3px 7px", border: "1px solid var(--rule)",
    background: "var(--paper-raised)", color: "var(--ink-soft)", cursor: "pointer" },
};
