import { describe, it, expect } from 'vitest'
import {
  getMultiplierLabel,
  getMultiplierColor,
  getMultiplierBarWidth,
  buildMultiplierData,
  normalizeHwy6,
  normalizeGas,
  normalizeSearch,
  normalizeLodging,
  deriveMultiplierScore,
  weatherDemandFactor,
} from '../lib/multiplier'
import type { RawGatekeeperInputs, WeatherReading } from '../lib/types'

const T = { high: 0.70, low: 0.40 }

// Pacific City v1 config slice (weights + hard-cap) for derivation tests.
const CFG = {
  multiplierWeights: { hwy6: 0.40, gas: 0.20, search: 0.30, lodging: 0.10 },
  hardOverrides: [{ gatekeeperId: 'hwy6', condition: 'RESTRICTED', capScore: 0.40 }],
}

// A "perfect day": open road, cheap gas, peak search, peak lodging.
const PERFECT: RawGatekeeperInputs = {
  hwy6Status: 'OPEN', gasPrice: 3.5, searchInterest: 100, lodgingValue: 100, lodgingMax: 100,
}

describe('getMultiplierLabel', () => {
  it('HIGH VOL at and above 0.70', () => {
    expect(getMultiplierLabel(1.00, T)).toBe('HIGH VOL')
    expect(getMultiplierLabel(0.71, T)).toBe('HIGH VOL')
    expect(getMultiplierLabel(0.70, T)).toBe('HIGH VOL')
  })
  it('MODERATE between thresholds', () => {
    expect(getMultiplierLabel(0.69, T)).toBe('MODERATE')
    expect(getMultiplierLabel(0.55, T)).toBe('MODERATE')
    expect(getMultiplierLabel(0.40, T)).toBe('MODERATE')
  })
  it('LOW VOL below 0.40', () => {
    expect(getMultiplierLabel(0.39, T)).toBe('LOW VOL')
    expect(getMultiplierLabel(0.00, T)).toBe('LOW VOL')
  })
})

describe('getMultiplierColor', () => {
  it('green for high', () => expect(getMultiplierColor(0.82, T)).toBe('green'))
  it('amber for moderate', () => expect(getMultiplierColor(0.55, T)).toBe('amber'))
  it('red for low', () => expect(getMultiplierColor(0.20, T)).toBe('red'))
})

describe('getMultiplierBarWidth', () => {
  it('converts to integer percent', () => {
    expect(getMultiplierBarWidth(0.82)).toBe(82)
    expect(getMultiplierBarWidth(1.00)).toBe(100)
    expect(getMultiplierBarWidth(0.00)).toBe(0)
  })
  it('clamps out-of-range values', () => {
    expect(getMultiplierBarWidth(1.5)).toBe(100)
    expect(getMultiplierBarWidth(-0.1)).toBe(0)
  })
})

describe('buildMultiplierData', () => {
  it('returns complete object', () => {
    const r = buildMultiplierData(0.82, T)
    expect(r.score).toBe(0.82)
    expect(r.label).toBe('HIGH VOL')
    expect(r.color).toBe('green')
    expect(r.barWidthPercent).toBe(82)
  })
})

// ─── Layer 1: normalization ───────────────────────────────────────────────────

describe('normalizeHwy6', () => {
  it('maps the three statuses', () => {
    expect(normalizeHwy6('OPEN')).toBe(1.0)
    expect(normalizeHwy6('ADVISORY')).toBe(0.5)
    expect(normalizeHwy6('RESTRICTED')).toBe(0.0)
  })
})

describe('normalizeGas', () => {
  it('anchors the band: $3.50=1.0, $4.50=0.5, $5.50=0.0', () => {
    expect(normalizeGas(3.5)).toBeCloseTo(1.0)
    expect(normalizeGas(4.5)).toBeCloseTo(0.5)
    expect(normalizeGas(5.5)).toBeCloseTo(0.0)
  })
  it('clamps beyond the band', () => {
    expect(normalizeGas(2.0)).toBe(1.0)
    expect(normalizeGas(7.0)).toBe(0.0)
  })
})

describe('normalizeSearch', () => {
  it('scales 0–100 to 0–1', () => {
    expect(normalizeSearch(0)).toBe(0)
    expect(normalizeSearch(73)).toBeCloseTo(0.73)
    expect(normalizeSearch(100)).toBe(1)
  })
})

describe('normalizeLodging', () => {
  it('is relative to historical max', () => {
    expect(normalizeLodging(50, 100)).toBe(0.5)
    expect(normalizeLodging(100, 100)).toBe(1)
  })
  it('guards a zero/missing max', () => {
    expect(normalizeLodging(50, 0)).toBe(0)
  })
})

// ─── Layers 2 + 3: derivation ─────────────────────────────────────────────────

describe('deriveMultiplierScore', () => {
  it('a perfect day scores 1.0', () => {
    expect(deriveMultiplierScore(PERFECT, CFG)).toBeCloseTo(1.0)
  })

  it('weights combine correctly (open road, mid gas, mid search, half lodging)', () => {
    // hwy6=1.0*0.40 + gas(4.5→0.5)*0.20 + search(60→0.6)*0.30 + lodging(0.5)*0.10
    // = 0.40 + 0.10 + 0.18 + 0.05 = 0.73
    const score = deriveMultiplierScore(
      { hwy6Status: 'OPEN', gasPrice: 4.5, searchInterest: 60, lodgingValue: 50, lodgingMax: 100 },
      CFG,
    )
    expect(score).toBeCloseTo(0.73)
  })

  it('RESTRICTED hard-caps at 0.40 even when every other signal is perfect', () => {
    // Without the cap this would be 0.0*0.40 + everything-else-perfect = 0.60.
    const restricted: RawGatekeeperInputs = { ...PERFECT, hwy6Status: 'RESTRICTED' }
    expect(deriveMultiplierScore(restricted, CFG)).toBe(0.40)
  })

  it('the cap is a ceiling, not a floor — a weak RESTRICTED day stays low', () => {
    const score = deriveMultiplierScore(
      { hwy6Status: 'RESTRICTED', gasPrice: 5.5, searchInterest: 10, lodgingValue: 10, lodgingMax: 100 },
      CFG,
    )
    expect(score).toBeLessThan(0.40) // not lifted up to the cap
  })

  it('output is always within 0–1', () => {
    const score = deriveMultiplierScore(PERFECT, CFG)
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(1)
  })
})

// ─── Weather: the road modulator ──────────────────────────────────────────────

const SUNNY: WeatherReading = { condition: 'clear', tempF: 68, summary: 'Sunny' }
const COLD_RAIN: WeatherReading = { condition: 'rain', tempF: 46, summary: 'Cold rain' }

describe('weatherDemandFactor', () => {
  it('clear skies do not dampen the open road', () => {
    expect(weatherDemandFactor(SUNNY)).toBeCloseTo(1.0)
  })
  it('no reading → no modulation (back-compat)', () => {
    expect(weatherDemandFactor(undefined)).toBe(1.0)
  })
  it('rain sharply dampens, and a cold snap shaves more off', () => {
    expect(weatherDemandFactor({ condition: 'rain', tempF: 60, summary: 'Rain' })).toBeCloseTo(0.45)
    expect(weatherDemandFactor(COLD_RAIN)).toBeCloseTo(0.405) // 0.45 × 0.9 cold penalty
  })
  it('clouds sit between clear and rain', () => {
    expect(weatherDemandFactor({ condition: 'cloudy', tempF: 60, summary: 'Cloudy' })).toBeCloseTo(0.7)
  })
})

describe('deriveMultiplierScore — weather modulates the open road', () => {
  it('OPEN + sunny ≈ the unmodulated score (today stays 0.82)', () => {
    // hwy6 1.0×1.0×0.40 + gas($4.30→0.6)×0.20 + search(80→0.8)×0.30 + lodging(0.6)×0.10
    const inputs: RawGatekeeperInputs = { hwy6Status: 'OPEN', gasPrice: 4.3, searchInterest: 80, lodgingValue: 60, lodgingMax: 100 }
    expect(deriveMultiplierScore(inputs, CFG, SUNNY)).toBeCloseTo(0.82)
  })

  it('same day, cold rain → road read collapses, score drops out of HIGH', () => {
    const inputs: RawGatekeeperInputs = { hwy6Status: 'OPEN', gasPrice: 4.3, searchInterest: 80, lodgingValue: 60, lodgingMax: 100 }
    const sunny = deriveMultiplierScore(inputs, CFG, SUNNY)
    const wet = deriveMultiplierScore(inputs, CFG, COLD_RAIN)
    expect(wet).toBeLessThan(sunny)
    expect(wet).toBeLessThan(0.70) // no longer a HIGH-VOL surge
  })

  it('weather cannot rescue a RESTRICTED road — hard-cap still wins', () => {
    const restricted: RawGatekeeperInputs = { ...PERFECT, hwy6Status: 'RESTRICTED' }
    expect(deriveMultiplierScore(restricted, CFG, SUNNY)).toBe(0.40)
  })
})
