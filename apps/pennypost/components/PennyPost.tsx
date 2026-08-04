"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Masthead } from "./Masthead";
import { LetterRack } from "./LetterRack";
import { PostcardFlip } from "./PostcardFlip";
import { Engraving, ENGRAVINGS, ENGRAVING_IDS } from "./Engravings";
import { Stamp } from "./Stamp";
import { SEED_CARDS } from "@/lib/seed";
import { loadCards, saveCards } from "@/lib/session";
import { exportCardPng } from "@/lib/png";
import { MESSAGE_LIMIT, TRANSIT_MS, isDelivered, type Card, type EngravingId } from "@/lib/types";

type View = "office" | "compose" | "inbox" | "gallery";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Deterministic and locale-independent, in period order: 1 August 2026. */
function formatDate(ms: number): string {
  const d = new Date(ms);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function newId(): string {
  return `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

/* ----------------------------------------------------------------- controls */

function Button({
  children,
  onClick,
  variant = "default",
  disabled,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "primary" | "quiet";
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 px-4 py-2 text-[0.9rem] transition-[background,color,border-color] duration-150 disabled:cursor-not-allowed disabled:opacity-45";
  const styles: Record<string, React.CSSProperties> = {
    default: { border: "1px solid var(--ink)", background: "transparent", color: "var(--ink)", fontFamily: "var(--display)" },
    primary: { border: "1px solid var(--ink)", background: "var(--ink)", color: "var(--paper)", fontFamily: "var(--display)" },
    quiet: { border: "1px solid transparent", background: "transparent", color: "var(--ink-soft)", fontFamily: "var(--body)" },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={base} style={styles[variant]}>
      {children}
    </button>
  );
}

function SectionRule({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 mt-2">
      <div className="rule-hair mb-2" />
      <h2 className="smallcaps text-center" style={{ fontFamily: "var(--display)", fontSize: "0.95rem", color: "var(--ink-soft)" }}>
        {children}
      </h2>
      <div className="rule-hair mt-2" />
    </div>
  );
}

/* -------------------------------------------------------------------- app */

export function PennyPost() {
  const [view, setView] = useState<View>("office");

  /* ── The hydration contract ────────────────────────────────────────────
     This app is a static export, so every page is prerendered in Node. The
     FIRST client render must be byte-identical to that prerender, which means:
       · state starts as SEED_CARDS only — never a sessionStorage read
       · `now` starts at 0, never Date.now()
     Session data and the clock arrive in an effect, after mount. Getting this
     wrong does not fail in `npm run dev` (dev does not prerender) — it fails at
     `npm run build`, or worse, hydrates wrong in production.
     Seed cards carry deliverAt: 0, so `0 <= 0` marks them delivered even at the
     initial now=0 and the first paint is stable.                            */
  const [cards, setCards] = useState<Card[]>(SEED_CARDS);
  const [now, setNow] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const [posting, setPosting] = useState<Card | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState<Card | null>(null);

  // Mount: adopt any session state and start the clock.
  //
  // eslint react-hooks/set-state-in-effect is disabled here deliberately, and it
  // is the one place in this app where that is correct. The rule's advice —
  // derive it during render instead — is exactly what must NOT happen: this is a
  // static export, every page is prerendered in Node, and touching
  // sessionStorage during render is a build-time ReferenceError. Reading after
  // mount and setting state is the required shape, and the single extra render
  // it costs is the price of a correct first paint.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const stored = loadCards();
    if (stored && stored.length) setCards(stored);
    setNow(Date.now());
    setLoaded(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Delivery is derived from a persisted timestamp on every tick — never a
  // setTimeout — so a refresh mid-flight still arrives on schedule.
  useEffect(() => {
    if (!loaded) return;
    const t = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(t);
  }, [loaded]);

  useEffect(() => {
    if (!loaded) return;
    saveCards(cards);
  }, [cards, loaded]);

  // Back button should leave a view rather than leave the site.
  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      const v = (e.state as { view?: View } | null)?.view;
      setView(v ?? "office");
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const go = useCallback((v: View) => {
    setView(v);
    try {
      window.history.pushState({ view: v }, "");
    } catch {
      /* history is unavailable in some embedded contexts; navigation still works */
    }
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(null), 4200);
    return () => window.clearTimeout(t);
  }, [notice]);

  const inTransit = useMemo(() => cards.filter((c) => !isDelivered(c, now)), [cards, now]);
  const delivered = useMemo(() => cards.filter((c) => isDelivered(c, now)), [cards, now]);
  const unread = useMemo(() => delivered.filter((c) => !c.read), [delivered]);

  const post = useCallback(
    (draft: { engraving: EngravingId; to: string; from: string; message: string }) => {
      const stamped = Date.now();
      const card: Card = {
        id: newId(),
        engraving: draft.engraving,
        to: draft.to.trim() || "A Friend",
        from: draft.from.trim() || "Anonymous",
        message: draft.message.trim(),
        postedAt: stamped,
        deliverAt: stamped + TRANSIT_MS,
        read: false,
        dateLabel: formatDate(stamped),
      };
      setPosting(card);
      setCards((prev) => [card, ...prev]);
      window.setTimeout(() => {
        setPosting(null);
        go("office");
      }, 1900);
    },
    [go],
  );

  const deliverNow = useCallback((id: string) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, deliverAt: Date.now() } : c)));
  }, []);

  const markRead = useCallback((id: string) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, read: true } : c)));
  }, []);

  const download = useCallback(async (card: Card) => {
    setExporting(card);
    try {
      // Wait for the hidden plate to mount before serialising it.
      //
      // rAF is the accurate signal — but it DOES NOT FIRE in a hidden or
      // background tab, and tabbing away while waiting for a download is
      // completely ordinary behaviour. On its own it leaves the button stuck on
      // "Preparing…" forever with no recovery but a reload. Race it against a
      // timer so the export always proceeds.
      await new Promise<void>((resolve) => {
        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          resolve();
        };
        requestAnimationFrame(() => requestAnimationFrame(finish));
        window.setTimeout(finish, 150);
      });

      const svg = exportRef.current?.querySelector("svg") ?? null;
      const result = await exportCardPng(svg as SVGSVGElement | null, card);
      setNotice(
        result.ok
          ? result.shared
            ? "Handed to your device to share."
            : "Saved to your downloads."
          : `Could not save the card — ${result.error}`,
      );
    } catch (err) {
      setNotice(`Could not save the card — ${(err as Error)?.message ?? "unknown error"}`);
    } finally {
      // Always clear, whatever happened, so the button can never wedge.
      setExporting(null);
    }
  }, []);

  return (
    <div className="min-h-screen pb-16">
      <Masthead showHonesty={view === "office"} />

      <nav className="mx-auto mt-4 flex max-w-5xl flex-wrap items-center justify-center gap-1 px-4">
        <Button variant={view === "office" ? "primary" : "quiet"} onClick={() => go("office")}>
          The Counter
        </Button>
        <Button variant={view === "compose" ? "primary" : "quiet"} onClick={() => go("compose")}>
          Write a Card
        </Button>
        <Button variant={view === "inbox" ? "primary" : "quiet"} onClick={() => go("inbox")}>
          Check the Rack{unread.length > 0 ? ` (${unread.length})` : ""}
        </Button>
        <Button variant={view === "gallery" ? "primary" : "quiet"} onClick={() => go("gallery")}>
          The Gallery
        </Button>
        <Link href="/about" className="inline-flex items-center px-4 py-2 text-[0.9rem] no-underline" style={{ color: "var(--ink-soft)", fontFamily: "var(--body)" }}>
          About
        </Link>
      </nav>

      <main className="mx-auto mt-6 max-w-5xl px-4">
        {view === "office" && (
          <Counter
            unread={unread.length}
            total={delivered.length}
            inTransit={inTransit}
            now={now}
            loaded={loaded}
            onDeliverNow={deliverNow}
            onGo={go}
          />
        )}
        {view === "compose" && <Compose onPost={post} />}
        {view === "inbox" && (
          <Rack cards={delivered} onRead={markRead} onDownload={download} exporting={exporting} />
        )}
        {view === "gallery" && <Gallery cards={cards} now={now} onDownload={download} exporting={exporting} />}
      </main>

      <Footer />

      {/* Posting choreography */}
      {posting && <PostingOverlay card={posting} />}

      {/* Notices */}
      {notice && (
        <div
          role="status"
          className="anim-rise fixed inset-x-0 bottom-4 z-50 mx-auto w-fit max-w-[92vw] px-4 py-2 text-center"
          style={{ background: "var(--ink)", color: "var(--paper)", fontFamily: "var(--body)", fontSize: "0.86rem" }}
        >
          {notice}
        </div>
      )}

      {/* Hidden plate, rendered only while exporting so the PNG has an SVG to
          rasterise from. Off-screen rather than display:none — a hidden element
          has no layout and serialises to an empty box. */}
      {exporting && (
        <div
          ref={exportRef}
          aria-hidden
          style={{ position: "absolute", left: -99999, top: 0, width: 600, height: 400, pointerEvents: "none" }}
        >
          <Engraving id={exporting.engraving} />
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- counter */

function Counter({
  unread,
  total,
  inTransit,
  now,
  loaded,
  onDeliverNow,
  onGo,
}: {
  unread: number;
  total: number;
  inTransit: Card[];
  now: number;
  loaded: boolean;
  onDeliverNow: (id: string) => void;
  onGo: (v: View) => void;
}) {
  const flight = inTransit[0];
  const secondsLeft = flight ? Math.max(0, Math.ceil((flight.deliverAt - now) / 1000)) : 0;

  return (
    <div className="grid gap-8 md:grid-cols-[1.1fr_1fr] md:items-center">
      <div>
        <h2 className="masthead" style={{ fontSize: "clamp(1.3rem, 3.4vw, 2rem)", lineHeight: 1.1 }}>
          Write a card.<br />Watch it arrive.
        </h2>
        <p className="mt-4" style={{ color: "var(--ink-soft)", lineHeight: 1.6 }}>
          Pick a plate, write your few lines, and post it. It will take a little while to get
          here — post normally does — and then it will be waiting in the rack.
        </p>
        <p className="mt-3" style={{ color: "var(--ink-faint)", fontSize: "0.9rem", lineHeight: 1.6 }}>
          I built the original of this for my partner and me. This is a version you can play with.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button variant="primary" onClick={() => onGo("compose")}>
            Write a Card
          </Button>
          {total > 0 && (
            <Button onClick={() => onGo("inbox")}>
              {unread > 0 ? `Read ${unread} waiting` : "Check the rack"}
            </Button>
          )}
        </div>

        {loaded && flight && (
          <div
            className="anim-rise mt-6 p-4"
            style={{ border: "1px solid var(--rule)", background: "var(--paper-raised)" }}
          >
            <p className="smallcaps" style={{ fontFamily: "var(--display)", color: "var(--cancel)", fontSize: "0.85rem" }}>
              in transit
            </p>
            <p className="mt-1" style={{ color: "var(--ink-soft)", fontSize: "0.92rem" }}>
              A card for <strong style={{ color: "var(--ink)" }}>{flight.to}</strong> is on the road
              — arriving in {secondsLeft}s.
            </p>
            <div className="mt-3">
              <Button variant="quiet" onClick={() => onDeliverNow(flight.id)}>
                Deliver it now →
              </Button>
            </div>
          </div>
        )}

        {loaded && !flight && unread > 0 && (
          <p className="anim-rise mt-6" style={{ color: "var(--cancel)", fontFamily: "var(--display)" }}>
            {unread === 1 ? "A letter is waiting for you." : `${unread} letters are waiting for you.`}
          </p>
        )}
      </div>

      <div className="mx-auto w-full max-w-sm">
        <LetterRack unread={unread} total={total} />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- compose */

function Compose({
  onPost,
}: {
  onPost: (d: { engraving: EngravingId; to: string; from: string; message: string }) => void;
}) {
  const [engraving, setEngraving] = useState<EngravingId>("writing-desk");
  const [to, setTo] = useState("");
  const [from, setFrom] = useState("");
  const [message, setMessage] = useState("");

  const remaining = MESSAGE_LIMIT - message.length;
  const canPost = message.trim().length > 0;

  const field: React.CSSProperties = {
    border: "1px solid var(--rule)",
    background: "var(--paper-raised)",
    color: "var(--ink)",
    fontFamily: "var(--body)",
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (canPost) onPost({ engraving, to, from, message });
      }}
    >
      <SectionRule>Choose a plate</SectionRule>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ENGRAVING_IDS.map((id) => {
          const selected = engraving === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setEngraving(id)}
              aria-pressed={selected}
              className="block text-left"
              style={{
                border: selected ? "2px solid var(--ink)" : "1px solid var(--rule)",
                padding: selected ? 3 : 4,
                background: "var(--paper-raised)",
              }}
            >
              <span className="block" style={{ aspectRatio: "3 / 2" }}>
                <Engraving id={id} />
              </span>
              <span
                className="smallcaps mt-1 block text-center"
                style={{ fontFamily: "var(--display)", fontSize: "0.68rem", color: selected ? "var(--ink)" : "var(--ink-faint)" }}
              >
                {ENGRAVINGS[id].label}
              </span>
            </button>
          );
        })}
      </div>

      <SectionRule>Write it</SectionRule>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="dateline block pb-1">To</span>
          <input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            maxLength={40}
            placeholder="a name"
            className="w-full px-3 py-2"
            style={field}
          />
        </label>
        <label className="block">
          <span className="dateline block pb-1">From</span>
          <input
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            maxLength={40}
            placeholder="your name"
            className="w-full px-3 py-2"
            style={field}
          />
        </label>
      </div>

      <label className="mt-4 block">
        <span className="dateline block pb-1">Your few lines</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, MESSAGE_LIMIT))}
          rows={5}
          placeholder="Wish you were here…"
          className="script w-full resize-none px-3 py-2"
          style={{ ...field, fontSize: "1.05rem", lineHeight: 1.6 }}
        />
      </label>
      <p className="mt-1 text-right" style={{ color: remaining < 40 ? "var(--cancel)" : "var(--ink-faint)", fontSize: "0.8rem" }}>
        {remaining} characters left
        {remaining === MESSAGE_LIMIT ? " — a postcard is meant to be short" : ""}
      </p>

      <div className="mt-5 flex items-center justify-center gap-3">
        <Button type="submit" variant="primary" disabled={!canPost}>
          Post it
        </Button>
      </div>
      <p className="mt-3 text-center" style={{ color: "var(--ink-faint)", fontSize: "0.82rem" }}>
        Posting is a simulation. Nothing is emailed and nothing is stored.
      </p>
    </form>
  );
}

/* ------------------------------------------------------------------- rack */

function Rack({
  cards,
  onRead,
  onDownload,
  exporting,
}: {
  cards: Card[];
  onRead: (id: string) => void;
  onDownload: (c: Card) => void;
  exporting: Card | null;
}) {
  const [open, setOpen] = useState<Card | null>(null);

  if (!cards.length) {
    return (
      <p className="py-16 text-center" style={{ color: "var(--ink-faint)", fontStyle: "italic" }}>
        The rack is empty. Write a card and it will find its way here.
      </p>
    );
  }

  return (
    <>
      <SectionRule>The rack</SectionRule>
      <ul className="space-y-px">
        {cards.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => {
                setOpen(c);
                if (!c.read) onRead(c.id);
              }}
              className="flex w-full items-baseline gap-3 px-3 py-3 text-left"
              style={{
                borderTop: "1px solid var(--rule-soft)",
                background: c.read ? "transparent" : "var(--paper-raised)",
              }}
            >
              <span
                aria-hidden
                style={{
                  color: c.read ? "var(--ink-faint)" : "var(--cancel)",
                  fontFamily: "var(--display)",
                  fontSize: "0.8rem",
                }}
              >
                {c.read ? "○" : "●"}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block" style={{ fontFamily: "var(--display)", color: "var(--ink)" }}>
                  From {c.from}
                  {!c.read && (
                    <span className="smallcaps ml-2" style={{ color: "var(--cancel)", fontSize: "0.72rem" }}>
                      unopened
                    </span>
                  )}
                </span>
                <span className="block truncate" style={{ color: "var(--ink-soft)", fontSize: "0.88rem" }}>
                  {c.message}
                </span>
              </span>
              <span className="dateline shrink-0">{c.dateLabel}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="rule-hair" />

      {open && (
        <CardModal card={open} onClose={() => setOpen(null)} onDownload={onDownload} exporting={exporting} />
      )}
    </>
  );
}

/* ---------------------------------------------------------------- gallery */

function Gallery({
  cards,
  now,
  onDownload,
  exporting,
}: {
  cards: Card[];
  now: number;
  onDownload: (c: Card) => void;
  exporting: Card | null;
}) {
  const [open, setOpen] = useState<Card | null>(null);

  return (
    <>
      <SectionRule>Every card in this tab</SectionRule>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => {
          const arrived = isDelivered(c, now);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => arrived && setOpen(c)}
              className="block text-left"
              style={{ opacity: arrived ? 1 : 0.5, cursor: arrived ? "pointer" : "default" }}
            >
              <span
                className="block"
                style={{ aspectRatio: "3 / 2", border: "1px solid var(--rule)", background: "var(--paper-raised)" }}
              >
                <Engraving id={c.engraving} />
              </span>
              <span className="mt-2 block" style={{ fontFamily: "var(--display)", color: "var(--ink)", fontSize: "0.92rem" }}>
                To {c.to}
              </span>
              <span className="dateline block">
                {arrived ? c.dateLabel : "in transit"}
              </span>
            </button>
          );
        })}
      </div>

      {open && (
        <CardModal card={open} onClose={() => setOpen(null)} onDownload={onDownload} exporting={exporting} />
      )}
    </>
  );
}

/* ----------------------------------------------------------------- modal */

function CardModal({
  card,
  onClose,
  onDownload,
  exporting,
}: {
  card: Card;
  onClose: () => void;
  onDownload: (c: Card) => void;
  exporting: Card | null;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const mailto = `mailto:?subject=${encodeURIComponent("A postcard")}&body=${encodeURIComponent(
    `${card.message}\n\n— ${card.from}\n\nMade at The Penny Post — https://pennypost.mechanicalcupcakes.fun`,
  )}`;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto p-4"
      style={{ background: "rgba(26,21,18,0.62)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Card to ${card.to}`}
    >
      <div className="anim-rise w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <PostcardFlip card={card} autoFocus />
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <Button variant="primary" onClick={() => onDownload(card)} disabled={!!exporting}>
            {exporting?.id === card.id ? "Preparing…" : "Keep a copy"}
          </Button>
          <a
            href={mailto}
            className="inline-flex items-center px-4 py-2 text-[0.9rem] no-underline"
            style={{ border: "1px solid var(--ink)", color: "var(--ink)", fontFamily: "var(--display)", background: "var(--paper)" }}
          >
            Email it yourself
          </a>
          <Button variant="quiet" onClick={onClose}>
            Close
          </Button>
        </div>
        <p className="mt-2 text-center" style={{ color: "var(--paper-sunk)", fontSize: "0.78rem" }}>
          &ldquo;Email it yourself&rdquo; opens your own mail app. This site never sends anything.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- posting fx */

function PostingOverlay({ card }: { card: Card }) {
  const [struck, setStruck] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setStruck(true), 620);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(242,235,219,0.94)" }}
      role="status"
      aria-live="polite"
    >
      <div className="w-full max-w-sm text-center">
        <div className={struck ? "anim-post" : ""}>
          <div className="relative" style={{ border: "1px solid var(--rule)", background: "var(--paper-raised)", aspectRatio: "3 / 2" }}>
            <Engraving id={card.engraving} />
            <div className="anim-stamp absolute right-3 top-3 w-[22%]">
              <Stamp cancelled={struck} className="h-auto w-full" />
            </div>
          </div>
        </div>
        <p className="mt-5" style={{ fontFamily: "var(--display)", color: "var(--ink)" }}>
          {struck ? "Into the bag." : "Stamped and cancelled."}
        </p>
        <p className="mt-1" style={{ color: "var(--ink-faint)", fontSize: "0.85rem" }}>
          To {card.to}
        </p>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- footer */

function Footer() {
  return (
    <footer className="mx-auto mt-16 max-w-5xl px-4">
      <div className="rule-double" />
      <div className="flex flex-col items-center gap-2 py-5 text-center">
        <p style={{ color: "var(--ink-soft)", fontSize: "0.9rem", lineHeight: 1.6 }}>
          Built in spare time around a full-time job.{" "}
          <Link href="/about" style={{ color: "var(--ink)" }}>
            Read why it is called The Penny Post →
          </Link>
        </p>
        <p style={{ color: "var(--ink-faint)", fontSize: "0.86rem" }}>
          I teach people to use AI tools without the hype —{" "}
          <a href="https://ernestofgaia.xyz" style={{ color: "var(--ink)" }}>
            ernestofgaia.xyz
          </a>{" "}
          · <a href="sms:503-664-0546" style={{ color: "var(--ink)" }}>503-664-0546</a>
        </p>
      </div>
    </footer>
  );
}
