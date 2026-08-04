import type { Card } from "./types";

/**
 * The entire persistence layer of The Penny Post.
 *
 * One `sessionStorage` key, this tab only. No server, no database, no cookie, no
 * `localStorage`. Closing the tab ends the visit.
 *
 * ⚠️ NOTHING HERE MAY BE CALLED AT MODULE SCOPE OR DURING RENDER. This app is a
 * static export, so every page is prerendered in Node where `sessionStorage`
 * does not exist — a read during render is a build-time `ReferenceError`, and
 * `npm run dev` will not catch it because dev mode does not prerender.
 * Call these from inside an effect, after mount, only.
 */

const KEY = "pennypost";
const VERSION = 1;

type Stored = {
  v: number;
  cards: Card[];
};

function available(): boolean {
  try {
    return typeof window !== "undefined" && !!window.sessionStorage;
  } catch {
    // Storage can throw outright when blocked by browser settings rather than
    // simply being absent. A visitor with storage disabled should still get a
    // working app that just forgets between navigations.
    return false;
  }
}

export function loadCards(): Card[] | null {
  if (!available()) return null;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Stored;
    // Version mismatch: discard rather than migrate. There is nothing here worth
    // preserving across a schema change — it is one browser tab of play.
    if (!parsed || parsed.v !== VERSION || !Array.isArray(parsed.cards)) {
      window.sessionStorage.removeItem(KEY);
      return null;
    }
    return parsed.cards;
  } catch {
    return null;
  }
}

export function saveCards(cards: Card[]): void {
  if (!available()) return;
  try {
    const payload: Stored = { v: VERSION, cards };
    window.sessionStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    // Quota or a private-mode restriction. The app keeps working from React
    // state; it just will not survive a reload. Failing silently is correct here
    // — there is nothing the visitor could do about it and nothing at stake.
  }
}

export function clearCards(): void {
  if (!available()) return;
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* nothing to do */
  }
}
