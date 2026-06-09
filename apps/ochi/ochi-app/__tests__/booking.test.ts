import { describe, it, expect } from 'vitest'
import { bookingRequestIsValid, submitBookingRequest, CONTACT, type BookingRequest } from '../lib/booking'

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

describe('submitBookingRequest (stub path)', () => {
  it('resolves ok locally when no Secretary Agent endpoint is configured', async () => {
    const req: BookingRequest = {
      name: 'Pat', business: 'Sandy Cove', email: 'p@x.com', phone: '5035551212', preferredTime: 'mornings',
      context: { weeksCount: 18, avgOccupancy: 62, swingWeeks: 9 },
    }
    const res = await submitBookingRequest(req)
    expect(res.ok).toBe(true)
    expect(res.message).toMatch(/confirm/i)
  })
})

describe('CONTACT fallbacks', () => {
  it('exposes Ernest’s text + email links', () => {
    expect(CONTACT.phone).toBe('503-664-0546')
    expect(CONTACT.phoneHref).toBe('sms:+15036640546')
    expect(CONTACT.emailHref).toMatch(/^mailto:eog@ernestofgaia\.xyz/)
  })
})
