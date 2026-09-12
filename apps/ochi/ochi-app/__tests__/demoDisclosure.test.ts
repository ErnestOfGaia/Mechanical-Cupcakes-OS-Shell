import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import {
  getCurrentInputs,
  GATEKEEPERS_ARE_DEMO_DATA,
  __MOCK_INPUTS_FOR_TESTS,
  type GatekeeperRead,
} from '../lib/currentConditions'
import { buildDashboardView } from '../lib/dashboardView'
import { resetPoolForTests } from '../lib/db'
import type { WeatherReading } from '../lib/types'

// This dashboard is public and carries a lead-capture funnel, so "is this number
// real?" is a claim we make to strangers. These tests exist to make the claim
// fail-capable: the disclosure cannot silently drift away from the data.
//
// The failures they prevent:
//   · someone flips the flag with the mock still in place (page claims live
//     signals it does not have — the original 2026-08-04 defect);
//   · someone wires a real read and forgets the flag (page apologises for data
//     that is now real);
//   · ⛔ someone writes `catch { return MOCK_INPUTS }` in the live read, so a
//     database outage silently shows sample numbers under a live label — the
//     2026-08-05 lie rebuilt. The "unavailable" tests below are the guard.

const CLEAR: WeatherReading = { condition: 'clear', tempF: 68, summary: 'Sunny' }

const DEMO_READ: GatekeeperRead = { state: 'demo', inputs: __MOCK_INPUTS_FOR_TESTS }
const UNAVAILABLE_READ: GatekeeperRead = { state: 'unavailable', reason: 'test outage' }
const LIVE_READ: GatekeeperRead = {
  state: 'live',
  observation: {
    weekStartDate: '2026-09-07',
    weekendLabel: 'Weekend of Sep 12–13',
    updatedAt: '2026-09-10T16:14:00.000Z',
    hwy6Status: 'OPEN',
    gasPrice: 4.1,
    gasSource: 'eia',
    searchInterest: 55,
    lodgingValue: 80,
    lodgingMax: 100,
    lodgingSource: 'tlt',
    observedVolume: null,
    notes: null,
  },
  inputs: { hwy6Status: 'OPEN', gasPrice: 4.1, searchInterest: 55, lodgingValue: 80, lodgingMax: 100 },
  missing: [],
}

// Point the read at a port nothing listens on, so a live-mode read fails fast
// and deterministically — no Postgres in the test environment, by design.
const savedEnv: Record<string, string | undefined> = {}
beforeAll(async () => {
  for (const k of ['OCHI_PG_HOST', 'OCHI_PG_PORT', 'OCHI_PG_PASSWORD']) savedEnv[k] = process.env[k]
  process.env.OCHI_PG_HOST = '127.0.0.1'
  process.env.OCHI_PG_PORT = '1'
  process.env.OCHI_PG_PASSWORD = 'not-a-real-password'
  await resetPoolForTests()
})
afterAll(async () => {
  await resetPoolForTests()
  for (const [k, v] of Object.entries(savedEnv)) {
    if (v === undefined) delete process.env[k]
    else process.env[k] = v
  }
})

describe('demo-data disclosure stays coupled to the data', () => {
  it('the flag agrees with what getCurrentInputs() actually hands back', async () => {
    const read = await getCurrentInputs()
    const returnsMock = read.state === 'demo' && read.inputs === __MOCK_INPUTS_FOR_TESTS

    // The whole point: these two must agree. Whichever side changes first, this fails.
    expect(GATEKEEPERS_ARE_DEMO_DATA).toBe(returnsMock)
  })

  it('with the flag false, a failed read is UNAVAILABLE — never the mock', async () => {
    if (GATEKEEPERS_ARE_DEMO_DATA) return // nothing to prove in demo mode

    const read = await getCurrentInputs()
    expect(read.state).toBe('unavailable')
    // Belt and braces: no shape of the result may carry the sample numbers.
    expect(JSON.stringify(read)).not.toContain(String(__MOCK_INPUTS_FOR_TESTS.searchInterest))
    expect('inputs' in read).toBe(false)
  })

  it('the view mirrors the read state and never says "demonstration" outside demo mode', async () => {
    const view = await buildDashboardView(undefined, undefined, CLEAR)
    expect(view.isDemoData).toBe(GATEKEEPERS_ARE_DEMO_DATA)
    expect(view.dataState === 'demo').toBe(GATEKEEPERS_ARE_DEMO_DATA)

    if (view.isDemoData) {
      // The exact defect found in the 2026-08-04 audit: "3 of 4 signals live"
      // rendered over four hardcoded constants.
      expect(view.confidence).not.toMatch(/signals live/i)
      expect(view.confidence).toMatch(/demonstration/i)
      expect(view.summary).toMatch(/demonstration/i)
    } else {
      expect(view.confidence).not.toMatch(/demonstration/i)
      expect(view.summary).not.toMatch(/demonstration/i)
    }
  })
})

describe('the three states render as themselves', () => {
  it('unavailable: every stored signal reads unavailable, there is no score, weather stays live', async () => {
    const view = await buildDashboardView(undefined, UNAVAILABLE_READ, CLEAR)

    expect(view.dataState).toBe('unavailable')
    expect(view.hero).toBeNull()
    expect(view.isDemoData).toBe(false)
    expect(view.unavailableReason).toBe('test outage')
    for (const g of view.gatekeepers) {
      expect(g.value).toBe('Unavailable')
      expect(g.status).toBe('nodata')
      expect(g.recorded).toBe(false)
      expect(g.freshness).toMatch(/unavailable/i)
    }
    // Weather is a real feed and is still shown, on the road card.
    expect(view.gatekeepers.find((g) => g.id === 'hwy6')?.weather?.summary).toBe('Sunny')
    expect(view.summary).toMatch(/unavailable|could not read/i)
    expect(view.summary).not.toMatch(/demonstration/i)
    // No number anywhere that could be mistaken for a reading.
    expect(JSON.stringify(view.gatekeepers)).not.toContain('$4.30')
  })

  it('live: the weekend label and the as-of timestamp ride through to the view', async () => {
    const view = await buildDashboardView(undefined, LIVE_READ, CLEAR)

    expect(view.dataState).toBe('live')
    expect(view.weekLabel).toBe('Weekend of Sep 12–13')
    expect(view.asOf).toMatch(/Sep 10/)          // 2026-09-10T16:14Z = 9:14 AM PT
    expect(view.asOf).toMatch(/PT$/)
    expect(view.hero?.score).toBeGreaterThan(0)
    expect(view.gatekeepers.find((g) => g.id === 'gas')?.value).toBe('$4.10')
    for (const g of view.gatekeepers) {
      expect(g.recorded).toBe(true)
      expect(g.freshness).toMatch(/recorded .*Sep 10/)
    }
    expect(view.summary).toMatch(/Weekend of Sep 12–13/)
    expect(view.summary).not.toMatch(/demonstration/i)
  })

  it('live but incomplete: recorded signals show, missing ones say so, and there is no score', async () => {
    const partial: GatekeeperRead = {
      ...LIVE_READ,
      observation: { ...LIVE_READ.observation, searchInterest: null },
      inputs: null,
      missing: ['search'],
    }
    const view = await buildDashboardView(undefined, partial, CLEAR)

    expect(view.hero).toBeNull()
    expect(view.heroNote).toMatch(/search interest/)
    expect(view.gatekeepers.find((g) => g.id === 'search')?.value).toBe('Not recorded')
    expect(view.gatekeepers.find((g) => g.id === 'gas')?.value).toBe('$4.10')
    expect(view.confidence).toMatch(/3 of 4 signals recorded/)
  })

  it('demo: still computes a real score from the real formula, and weather still moves it', async () => {
    // Disclosure is not an excuse to stop computing — the model must still run,
    // and weather must still move it, or the demo misrepresents the product.
    const view = await buildDashboardView(undefined, DEMO_READ, CLEAR)
    expect(view.dataState).toBe('demo')
    expect(view.hero?.score).toBeGreaterThan(0)
    expect(view.hero?.score).toBeLessThanOrEqual(1)
    expect(view.confidence).toMatch(/demonstration/i)

    const rain: WeatherReading = { condition: 'rain', tempF: 52, summary: 'Rain' }
    const wet = await buildDashboardView(undefined, DEMO_READ, rain)
    expect(wet.hero!.score).toBeLessThan(view.hero!.score)
  })
})

describe('stale badge (L6)', () => {
  it('a live row recorded within the weekly threshold is not stale', async () => {
    const fresh: GatekeeperRead = {
      ...LIVE_READ,
      observation: { ...LIVE_READ.observation, updatedAt: new Date(Date.now() - 3 * 86400000).toISOString() },
    }
    const view = await buildDashboardView(undefined, fresh, CLEAR)
    expect(view.stale).toBe(false)
    expect(view.staleNote).toBeNull()
  })

  it('a live row older than 10 days is flagged stale, with a note that says so', async () => {
    const old: GatekeeperRead = {
      ...LIVE_READ,
      observation: { ...LIVE_READ.observation, updatedAt: new Date(Date.now() - 12 * 86400000).toISOString() },
    }
    const view = await buildDashboardView(undefined, old, CLEAR)
    expect(view.stale).toBe(true)
    expect(view.staleNote).toMatch(/more than 10 days old/)
  })

  it('demo and unavailable reads are never stale — there is no row to be old', async () => {
    expect((await buildDashboardView(undefined, UNAVAILABLE_READ, CLEAR)).stale).toBe(false)
  })
})
