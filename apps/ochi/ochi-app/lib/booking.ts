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

// Where the Secretary Agent accepts booking requests. Set via env when wired;
// until then the submit is stubbed (below) so the funnel is fully clickable.
const SECRETARY_BOOKING_URL = process.env.NEXT_PUBLIC_SECRETARY_BOOKING_URL

export function bookingRequestIsValid(r: Partial<BookingRequest>): boolean {
  return Boolean(
    r.name?.trim() &&
    r.email?.trim() && /.+@.+\..+/.test(r.email) &&
    (r.phone?.trim() || r.preferredTime?.trim()),
  )
}

// Submits the booking request. STUB until the Secretary Agent endpoint is wired:
// with no NEXT_PUBLIC_SECRETARY_BOOKING_URL set, it resolves success locally so
// the confirm → success flow works end to end without a backend.
export async function submitBookingRequest(req: BookingRequest): Promise<BookingResult> {
  if (!SECRETARY_BOOKING_URL) {
    // TODO(secretary-agent): POST `req` to the Mastra secretaryAgent booking tool
    // (Google Calendar) once that service is stable. See project memory:
    // project_ernestofgaia_google_workspace.
    return { ok: true, message: "Sent — Ernest's assistant will reach out to confirm your time." }
  }
  try {
    const res = await fetch(SECRETARY_BOOKING_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    })
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
