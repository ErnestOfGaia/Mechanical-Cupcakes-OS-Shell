import { describe, it, expect } from 'vitest'
import { isMonday, parseIsoDate, validateObservation, weekendLabel } from '../lib/observations'

// The ingest contract, in English before the database says it in SQLSTATE.
// The Monday rule is the one that matters: a week-ENDING date (Sat/Sun) is the
// dialect the client CSV speaks, and it must be refused loudly, not stored six
// days off (see the comment block in db/init/01_schema.sql).

describe('parseIsoDate / isMonday', () => {
  it('parses a calendar date as UTC, so the weekday cannot drift by timezone', () => {
    expect(parseIsoDate('2026-09-07')?.toISOString()).toBe('2026-09-07T00:00:00.000Z')
  })
  it('rejects malformed and impossible dates', () => {
    expect(parseIsoDate('2026-9-7')).toBeNull()
    expect(parseIsoDate('2026-02-31')).toBeNull()
    expect(parseIsoDate('Monday')).toBeNull()
  })
  it('2026-09-07 is a Monday; 2026-09-06 (Sunday) and 2026-09-05 (Saturday) are not', () => {
    expect(isMonday('2026-09-07')).toBe(true)
    expect(isMonday('2026-09-06')).toBe(false)
    expect(isMonday('2026-09-05')).toBe(false)
  })
})

describe('weekendLabel faces the weekend', () => {
  it('Monday 2026-09-07 → Weekend of Sep 12–13', () => {
    expect(weekendLabel('2026-09-07')).toBe('Weekend of Sep 12–13')
  })
  it('crosses a month boundary: Monday 2026-10-26 → Weekend of Oct 31 – Nov 1', () => {
    expect(weekendLabel('2026-10-26')).toBe('Weekend of Oct 31 – Nov 1')
  })
})

describe('validateObservation', () => {
  const good = { week_start_date: '2026-09-07', hwy6_status: 'OPEN', gas_price_eia: 4.1, search_interest: 55 }

  it('accepts a Monday row and normalises absent fields to null', () => {
    const r = validateObservation(good)
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.row.week_start_date).toBe('2026-09-07')
      expect(r.row.gas_price_aaa).toBeNull()
      expect(r.row.observed_volume).toBeNull()
    }
  })

  it('400: not an object', () => {
    const r = validateObservation('nope')
    expect(r).toMatchObject({ ok: false, status: 400 })
  })

  it('400: missing or malformed week_start_date', () => {
    expect(validateObservation({ hwy6_status: 'OPEN' })).toMatchObject({ ok: false, status: 400 })
    expect(validateObservation({ week_start_date: '09/07/2026' })).toMatchObject({ ok: false, status: 400 })
  })

  it('400: a Sunday is refused, and the message says what to do', () => {
    const r = validateObservation({ ...good, week_start_date: '2026-09-06' })
    expect(r).toMatchObject({ ok: false, status: 400 })
    if (!r.ok) expect(r.error).toMatch(/Monday/)
  })

  it('422: enum outside its closed list', () => {
    expect(validateObservation({ ...good, hwy6_status: 'CLOSED' })).toMatchObject({ ok: false, status: 422 })
    expect(validateObservation({ ...good, lodging_source: 'guess' })).toMatchObject({ ok: false, status: 422 })
    expect(validateObservation({ ...good, observed_volume: 'BUSY' })).toMatchObject({ ok: false, status: 422 })
  })

  it('422: numbers out of range or not numbers', () => {
    expect(validateObservation({ ...good, search_interest: 101 })).toMatchObject({ ok: false, status: 422 })
    expect(validateObservation({ ...good, search_interest: 55.5 })).toMatchObject({ ok: false, status: 422 })
    expect(validateObservation({ ...good, gas_price_eia: '4.10' })).toMatchObject({ ok: false, status: 422 })
    expect(validateObservation({ ...good, gas_price_eia: -1 })).toMatchObject({ ok: false, status: 422 })
  })

  it('a merge call may omit hwy6_status (the DB requires it only for a new week)', () => {
    const r = validateObservation({ week_start_date: '2026-08-31', observed_volume: 'MODERATE' })
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.row.hwy6_status).toBeNull()
  })
})
