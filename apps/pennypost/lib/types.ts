export type EngravingId = "writing-desk" | "packet-ship" | "lighthouse" | "valley";

export type Card = {
  id: string;
  engraving: EngravingId;
  to: string;
  from: string;
  message: string;

  /** Epoch ms the card was posted. `0` for seed cards, which were never posted
   *  in this session. */
  postedAt: number;

  /** Epoch ms the card arrives. Delivery is DERIVED from this on every tick and
   *  is never driven by a `setTimeout` — so refreshing mid-flight still arrives
   *  on schedule instead of stranding the card forever. */
  deliverAt: number;

  read: boolean;

  /** Pre-formatted date string, never a live `toLocaleDateString()` call during
   *  render. Seed cards are rendered during the static prerender, where the build
   *  host's timezone differs from the visitor's — formatting at render time makes
   *  the server and client HTML disagree and blows up hydration. */
  dateLabel: string;
};

export const MESSAGE_LIMIT = 300;

/** How long a card spends in transit. Long enough to feel like a journey, short
 *  enough that nobody leaves before it lands. */
export const TRANSIT_MS = 12_000;

export function isDelivered(card: Card, now: number): boolean {
  return card.deliverAt <= now;
}
