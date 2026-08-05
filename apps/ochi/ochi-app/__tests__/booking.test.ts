import { describe, it, expect, vi, afterEach } from 'vitest'
import { bookingRequestIsValid, submitBookingRequest, CONTACT, type BookingRequest } from '../lib/booking'

const REQ: BookingRequest = {
  name: 'Pat', business: 'Sandy Cove', email: 'p@x.com', phone: '5035551212', preferredTime: 'mornings',
  context: { weeksCount: 18, avgOccupancy: 62, swingWeeks: 9 },
}

describe('bookingRequestIsValid', () => {
  it('requires name, a valid email, and a phone OR a preferred time', () => {
    expect(bookingRequestIsValid({ name: 'Pat', email: 'p@x.com', phone: '5035551212' })).toBe(true)
    expect(bookingRequestIsValid({ name: 'Pat', email: 'p@x.com', preferredTime: 'mornings' })).toBe(true)
  })
  it('rejects when name or email is missing or malformed', () => {
    expect(bookingRequestIsValid({ email: 'p@x.com', phone: '1' })).toBe(false)
    expect(bookingRequestIsValid({ name: 'Pat', email: 'not-an-email', phone: '1' })).toBe(false)
  })
  it('rejects name + email alone — needs a way/time to reach them', () => {
    expect(bookingRequestIsValid({ name: 'Pat', email: 'p@x.com' })).toBe(false)
  })
})

// The 2026-08-04 audit found the old contract fabricated success: the client
// stub fired whenever a BUILD-time env var was unset — which it always was in
// the published image — so production told strangers "Sent" and dropped the
// lead without a network call. The contract under test now: the client always
// POSTs same-origin /api/book and reports what the proxy says, honestly.
describe('submitBookingRequest (honest proxy path)', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('POSTs to same-origin /api/book — no build-time env in the loop', async () => {
    const fetchSpy = vi.fn(async () => new Response(JSON.stringify(
      { ok: true, message: "Sent — Ernest's assistant will reach out to confirm your time." },
    )))
    vi.stubGlobal('fetch', fetchSpy)

    const res = await submitBookingRequest(REQ)
    expect(fetchSpy).toHaveBeenCalledWith('/api/book', expect.objectContaining({ method: 'POST' }))
    expect(res.ok).toBe(true)
    expect(res.message).toMatch(/confirm/i)
  })

  it("relays the proxy's honest refusal instead of inventing a success", async () => {
    // What /api/book actually returns while the Secretary Agent is unwired.
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(
      { ok: false, message: "Booking isn't wired up yet — please text or email Ernest instead." },
    ), { status: 503 })))

    const res = await submitBookingRequest(REQ)
    expect(res.ok).toBe(false)
    expect(res.message).toMatch(/text or email/i)
  })

  it('reports failure when the network itself fails — never a fabricated success', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('network down') }))

    const res = await submitBookingRequest(REQ)
    expect(res.ok).toBe(false)
    expect(res.message).toMatch(/text or email/i)
  })
})

describe('CONTACT fallbacks', () => {
  it('exposes Ernest’s text + email links', () => {
    expect(CONTACT.phone).toBe('503-664-0546')
    expect(CONTACT.phoneHref).toBe('sms:+15036640546')
    expect(CONTACT.emailHref).toMatch(/^mailto:eog@ernestofgaia\.xyz/)
  })
})
