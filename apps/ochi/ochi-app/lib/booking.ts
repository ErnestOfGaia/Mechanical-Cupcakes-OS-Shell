// ─── Booking handoff ──────────────────────────────────────────────────────────
// The teaser page collects what's needed to book a call, shows a confirm step,
// then hands this payload to Ernest's Secretary Agent (Mastra + Google Workspace,
// in the ErnestOfGaia system). That agent is a SEPARATE service, so the actual
// network call is the one integration point to wire when it's stable.

export interface BookingRequest {
  name: string
  business: string
  email: string
  phone: string
  preferredTime: string   // free text, e.g. "weekday mornings"
  note?: string
  // light, non-PII context about the upload so the agent can personalize the call
  context?: { weeksCount: number; avgOccupancy: number; swingWeeks: number }
}

export interface BookingResult {
  ok: boolean
  message: string
}

// The browser always POSTs to the same-origin proxy — a constant, not an env
// read. The old NEXT_PUBLIC_SECRETARY_BOOKING_URL was inlined at BUILD time and
// was never set in any published image (no Dockerfile ARG, no CI build-arg), so
// production permanently took a stub branch that fabricated success without a
// network call and dropped the lead (audit [HIGH], 2026-08-04). A same-origin
// constant has no build-time coupling to go wrong; the real wiring decision
// (upstream URL + secret) lives server-side in app/api/book/route.ts.
const BOOKING_ENDPOINT = '/api/book'

// Explicit dev-only stub for exercising the confirm → success flow without a
// backend: NEXT_PUBLIC_BOOKING_STUB=1 in .env.local. Deliberately NOT set by the
// Dockerfile or CI — unset-in-prod now means "make the real call", the safe
// direction, where the old flag's unset-in-prod meant "fake it".
const STUB = process.env.NEXT_PUBLIC_BOOKING_STUB === '1'

export function bookingRequestIsValid(r: Partial<BookingRequest>): boolean {
  return Boolean(
    r.name?.trim() &&
    r.email?.trim() && /.+@.+\..+/.test(r.email) &&
    (r.phone?.trim() || r.preferredTime?.trim()),
  )
}

// Submits the booking request to the same-origin proxy. The proxy owns the
// truth about whether an upstream exists — this function just reports what the
// proxy says, honestly, and never invents a success.
export async function submitBookingRequest(req: BookingRequest): Promise<BookingResult> {
  if (STUB) {
    return { ok: true, message: "Sent — Ernest's assistant will reach out to confirm your time." }
  }
  try {
    const res = await fetch(BOOKING_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    })
    // The route answers {ok, message} on every path, including 400/502/503 —
    // prefer its message (it names the text/email fallback) over a generic one.
    const data = (await res.json().catch(() => null)) as BookingResult | null
    if (data && typeof data.ok === 'boolean' && typeof data.message === 'string') {
      return data
    }
    if (!res.ok) throw new Error(`status ${res.status}`)
    return { ok: true, message: "Sent — Ernest's assistant will reach out to confirm your time." }
  } catch {
    return { ok: false, message: 'Could not send right now — please text or email instead.' }
  }
}

// Direct-contact fallbacks (Ernest's ErnestOfGaia contact).
export const CONTACT = {
  phone: '503-664-0546',
  phoneHref: 'sms:+15036640546',
  email: 'eog@ernestofgaia.xyz',
  emailHref: 'mailto:eog@ernestofgaia.xyz?subject=OCHI%20lodging%20data%20review',
} as const
