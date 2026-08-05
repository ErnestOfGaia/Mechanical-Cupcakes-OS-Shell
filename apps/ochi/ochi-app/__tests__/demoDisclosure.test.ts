import { describe, it, expect } from 'vitest'
import {
  getCurrentInputs,
  GATEKEEPERS_ARE_DEMO_DATA,
  __MOCK_INPUTS_FOR_TESTS,
} from '../lib/currentConditions'
import { buildDashboardView } from '../lib/dashboardView'
import type { WeatherReading } from '../lib/types'

// This dashboard is public and carries a lead-capture funnel, so "is this number
// real?" is a claim we make to strangers. These tests exist to make the claim
// fail-capable: the disclosure cannot silently drift away from the data.
//
// The failure they prevent: someone wires getCurrentInputs() to a real source and
// forgets to flip the flag (page keeps apologising for data that is now real), or
// flips the flag with the mock still in place (page claims live signals it does
// not have — the original defect this replaced).

const CLEAR: WeatherReading = { condition: 'clear', tempF: 68, summary: 'Sunny' }

describe('demo-data disclosure stays coupled to the data', () => {
  it('flags demo mode while getCurrentInputs() still returns the mock constant', () => {
    const returnsMock = getCurrentInputs() === __MOCK_INPUTS_FOR_TESTS

    // The whole point: these two must agree. Whichever side changes first, this fails.
    expect(GATEKEEPERS_ARE_DEMO_DATA).toBe(returnsMock)
  })

  it('never calls the gatekeepers live while they are demo values', async () => {
    const view = await buildDashboardView(undefined, undefined, CLEAR)

    expect(view.isDemoData).toBe(GATEKEEPERS_ARE_DEMO_DATA)

    if (view.isDemoData) {
      // The exact defect found in the 2026-08-04 audit: "3 of 4 signals live"
      // rendered over four hardcoded constants.
      expect(view.confidence).not.toMatch(/signals live/i)
      expect(view.confidence).toMatch(/demonstration/i)
      expect(view.summary).toMatch(/demonstration/i)
    }
  })

  it('still computes a real score from the real formula in demo mode', async () => {
    const view = await buildDashboardView(undefined, undefined, CLEAR)

    // Disclosure is not an excuse to stop computing — the model must still run,
    // and weather must still move it, or the demo misrepresents the product.
    expect(view.hero.score).toBeGreaterThan(0)
    expect(view.hero.score).toBeLessThanOrEqual(1)

    const rain: WeatherReading = { condition: 'rain', tempF: 52, summary: 'Rain' }
    const wet = await buildDashboardView(undefined, undefined, rain)
    expect(wet.hero.score).toBeLessThan(view.hero.score)
  })
})
