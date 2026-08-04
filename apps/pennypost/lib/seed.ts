import type { Card } from "./types";

/**
 * The cards already in the mailbox when a visitor arrives.
 *
 * Two rules about this data:
 *
 * 1. `dateLabel` is a LITERAL STRING, never computed. These are the only cards
 *    that exist during the static prerender, so anything derived from the clock
 *    or the timezone here would make the prerendered HTML disagree with the
 *    first client render.
 *
 * 2. They are all `read: true` on purpose. The unread badge and the flag
 *    dropping should be earned by a card the visitor wrote themselves — that
 *    arrival is the whole point of the app, and spending it on seed data before
 *    they've done anything wastes it.
 */
export const SEED_CARDS: Card[] = [
  {
    id: "seed-uniform-penny",
    engraving: "writing-desk",
    to: "The Reader",
    from: "The Penny Post",
    message:
      "From today a letter travels anywhere in the kingdom for one penny, paid by the sender. No more refusing a letter at the door because you cannot afford to hear from your own family.",
    postedAt: 0,
    deliverAt: 0,
    read: true,
    dateLabel: "10 January 1840",
  },
  {
    id: "seed-penny-black",
    engraving: "packet-ship",
    to: "The Reader",
    from: "Somerset House",
    message:
      "A small black label, gummed on the back, bearing the Queen's head. Stick it to the letter and the postage is paid. We are told to cut them apart with scissors — the perforating machine has not been invented yet.",
    postedAt: 0,
    deliverAt: 0,
    read: true,
    dateLabel: "6 May 1840",
  },
  {
    id: "seed-crossed",
    engraving: "valley",
    to: "The Reader",
    from: "A Thrifty Correspondent",
    message:
      "Paper was charged by the sheet, so we learned to fill a page, turn it a quarter turn, and write straight across our own handwriting. A letter you had to tilt your head to read. Cheaper that way.",
    postedAt: 0,
    deliverAt: 0,
    read: true,
    dateLabel: "March 1839",
  },
];
