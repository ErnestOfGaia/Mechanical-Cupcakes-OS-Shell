import { describe, it, expect } from 'vitest'
import { selectGas } from '../lib/currentConditions'

// The Gas Index is 20% of the Master Multiplier and it is a number strangers read
// off a public page, so "which source is this?" has to be a decision, not an
// accident of which field happened to be non-null.
//
// The failure this pins (found live on 2026-09-10): the rule was
// `gas_price_aaa ?? gas_price_eia`. The 2026-09-07 row was seeded with a
// hand-typed AAA price, then the routine fetched EIA every week — and the fetched
// number was stored and never shown. Worse, the following week's row would have
// carried EIA only, so the displayed Gas Index would have stepped ~4c because the
// SOURCE changed, not because fuel did. Ernest's ruling: EIA wins.
describe('selectGas', () => {
  it('prefers the fetched EIA price when a row carries both', () => {
    // Exactly the 2026-09-07 row: AAA from the seed, EIA from the routine.
    expect(selectGas({ gas_price_aaa: 5.0149, gas_price_eia: 4.975 }))
      .toEqual({ gasPrice: 4.975, gasSource: 'eia' })
  })

  it('falls back to AAA so a hand-typed-only week still shows a price', () => {
    expect(selectGas({ gas_price_aaa: 5.0149, gas_price_eia: null }))
      .toEqual({ gasPrice: 5.0149, gasSource: 'aaa' })
  })

  it('uses EIA when it is the only price, which is every row the routine writes', () => {
    expect(selectGas({ gas_price_aaa: null, gas_price_eia: 4.975 }))
      .toEqual({ gasPrice: 4.975, gasSource: 'eia' })
  })

  it('reports null so the caller marks gas missing rather than scoring without it', () => {
    expect(selectGas({ gas_price_aaa: null, gas_price_eia: null }))
      .toEqual({ gasPrice: null, gasSource: null })
  })

  it('does not treat a legitimate 0 as absent', () => {
    // Guards the ?? / falsy-check confusion that would silently drop a real reading.
    expect(selectGas({ gas_price_aaa: 3.5, gas_price_eia: 0 }))
      .toEqual({ gasPrice: 0, gasSource: 'eia' })
  })
})

// ── the label on the card ──────────────────────────────────────────────────────
// Showing a gas price without saying where it came from is the one thing this
// page is otherwise careful about (every other card names its source). Once the
// row decides between EIA and AAA, a static config label would lie the moment the
// fallback fired — so the label is derived from the row.
import { buildDashboardView } from '../lib/dashboardView'
import type { GatekeeperRead } from '../lib/currentConditions'
import type { WeatherReading } from '../lib/types'

const CLEAR: WeatherReading = { condition: 'clear', tempF: 68, summary: 'Sunny' }

function liveReadWithGas(gasSource: 'eia' | 'aaa', gasPrice: number): GatekeeperRead {
  return {
    state: 'live',
    observation: {
      weekStartDate: '2026-09-07',
      weekendLabel: 'Weekend of Sep 12–13',
      updatedAt: '2026-09-10T20:36:50.213Z',
      hwy6Status: 'OPEN',
      gasPrice,
      gasSource,
      searchInterest: 66,
      lodgingValue: 906208,
      lodgingMax: 1000000,
      lodgingSource: 'tlt',
      observedVolume: null,
      notes: null,
    },
    inputs: { hwy6Status: 'OPEN', gasPrice, searchInterest: 66, lodgingValue: 906208, lodgingMax: 1000000 },
    missing: [],
  }
}

const gasCard = (view: Awaited<ReturnType<typeof buildDashboardView>>) =>
  view.gatekeepers.find((g) => g.id === 'gas')

describe('the Gas Index names its source', () => {
  it('says EIA when the row was fetched by the routine', async () => {
    const card = gasCard(await buildDashboardView(undefined, liveReadWithGas('eia', 4.975), CLEAR))
    expect(card?.sourceLabel).toContain('EIA')
    // $4.97, not $4.98: toFixed(2) on 4.975 rounds DOWN, because 4.975 in binary
    // floating point is really 4.97499…. Half a cent, harmless, and pinned here so
    // nobody "fixes" a bug that is actually IEEE-754 behaving normally.
    expect(card?.value).toBe('$4.97')
  })

  it('says AAA when the row fell back to a hand-typed price', async () => {
    const card = gasCard(await buildDashboardView(undefined, liveReadWithGas('aaa', 5.0149), CLEAR))
    expect(card?.sourceLabel).toContain('AAA')
    // The label must track the ROW, not the tenant config — this is the assertion
    // that catches someone "simplifying" it back to a static string.
    expect(card?.sourceLabel).not.toContain('EIA')
  })

  it('still names a source when the read is unavailable', async () => {
    const card = gasCard(await buildDashboardView(undefined, { state: 'unavailable', reason: 'test outage' }, CLEAR))
    expect(card?.sourceLabel).toBeTruthy()
  })
})
