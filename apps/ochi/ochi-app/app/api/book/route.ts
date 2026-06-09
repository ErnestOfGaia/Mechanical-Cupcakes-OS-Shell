// ─── /api/book — server-side booking proxy ──────────────────────────────────
// The browser POSTs the BookingRequest here (same-origin, so no CORS) via
// submitBookingRequest() with NEXT_PUBLIC_SECRETARY_BOOKING_URL=/api/book.
//
// This route holds the shared secret server-side (never shipped to the client)
// and forwards to Ernest's deterministic lead-intake endpoint on the
// ErnestOfGaia system. That endpoint creates the Google Calendar marker +
// drafts a heads-up email to Ernest. See lib/booking.ts for the contract.
//
// Env (server-only, NOT NEXT_PUBLIC):
//   SECRETARY_BOOKING_URL   e.g. https://ernestofgaia.xyz/api/ochi-booking
//   OCHI_BOOKING_SECRET     shared secret, matches the ErnestOfGaia side
//
// If either is unset we degrade to a soft success so the funnel still works
// in local/preview without a backend — the page's text/email fallbacks remain
// the real path for the visitor.

import { bookingRequestIsValid, type BookingRequest } from "../../../lib/booking";

const UPSTREAM = process.env.SECRETARY_BOOKING_URL;
const SECRET = process.env.OCHI_BOOKING_SECRET;

export async function POST(req: Request) {
  let body: Partial<BookingRequest>;
  try {
    body = (await req.json()) as Partial<BookingRequest>;
  } catch {
    return Response.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  if (!bookingRequestIsValid(body)) {
    return Response.json({ ok: false, message: "Missing required details." }, { status: 400 });
  }

  // Not wired (local/preview): soft success, fallbacks still on the page.
  if (!UPSTREAM || !SECRET) {
    console.warn("[api/book] SECRETARY_BOOKING_URL / OCHI_BOOKING_SECRET unset — soft success");
    return Response.json({
      ok: true,
      message: "Sent — Ernest's assistant will reach out to confirm your time.",
    });
  }

  try {
    const res = await fetch(UPSTREAM, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-ochi-secret": SECRET },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "<no body>");
      console.error(`[api/book] upstream ${res.status}:`, detail.slice(0, 500));
      return Response.json(
        { ok: false, message: "Could not send right now — please text or email instead." },
        { status: 502 },
      );
    }

    return Response.json({
      ok: true,
      message: "Sent — Ernest's assistant will reach out to confirm your time.",
    });
  } catch (err) {
    console.error("[api/book] fetch failed:", err);
    return Response.json(
      { ok: false, message: "Could not send right now — please text or email instead." },
      { status: 502 },
    );
  }
}
