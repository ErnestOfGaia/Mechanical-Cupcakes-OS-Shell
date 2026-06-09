import type { MasterMultiplierData, RawGatekeeperInputs, Hwy6Status, WeatherReading } from './types'
import type { MultiplierThresholds, TenantConfig } from './tenant.config'

// ─── Layer 1: Normalization ──────────────────────────────────────────────────
// Each raw signal becomes a 0–1 score so unlike units (dollars, a 0–100 index,
// a tax figure) can be combined on one scale. v1 bands are Pacific City defaults
// (OCHI_GRILL_2026-06-08_DECISIONS.md G3); they move to tenant config when a
// second client needs different thresholds.

const clamp01 = (n: number): number => Math.min(1, Math.max(0, n))

// OPEN = wide open road, ADVISORY = caution, RESTRICTED = the corridor is choked.
export function normalizeHwy6(status: Hwy6Status): number {
  if (status === 'OPEN') return 1.0
  if (status === 'ADVISORY') return 0.5
  return 0.0 // RESTRICTED
}

// $3.50/gal or cheaper = full travel appetite (1.0); $5.50+ = appetite gone (0.0).
export function normalizeGas(pricePerGal: number): number {
  return clamp01((5.5 - pricePerGal) / 2.0)
}

// Google Trends already hands us 0–100; scale to 0–1.
export function normalizeSearch(trendsIndex: number): number {
  return clamp01(trendsIndex / 100)
}

// Relative strength: this period's lodging reading against the strongest on record.
// Source-agnostic — works for public TLT dollars or a client's weekly occupancy.
export function normalizeLodging(value: number, historicalMax: number): number {
  if (historicalMax <= 0) return 0
  return clamp01(value / historicalMax)
}

// ─── Weather: the road modulator ──────────────────────────────────────────────
// An open road is permission, not demand. Weather decides how much of that open
// gate converts to visitors. Returns a 0–1 factor that scales the Hwy 6 read.
// Coastal-Oregon defaults; can move to tenant config if a client's micro-climate
// behaves differently. A cold snap shaves a little more off an otherwise-clear day.
const WEATHER_CONDITION_FACTOR: Record<WeatherReading['condition'], number> = {
  clear: 1.0,
  partly_cloudy: 0.85,
  cloudy: 0.7,
  rain: 0.45,
  storm: 0.3,
  snow: 0.3,
}

export function weatherDemandFactor(weather?: WeatherReading): number {
  if (!weather) return 1.0 // no reading → no modulation (gate behaves as before)
  const base = WEATHER_CONDITION_FACTOR[weather.condition] ?? 1.0
  // mild cold penalty: below 50°F, dampen another 10% (beach trips lose appeal)
  const coldPenalty = weather.tempF < 50 ? 0.9 : 1.0
  return clamp01(base * coldPenalty)
}

// ─── Layer 2 + 3: Weighted combine, then critical hard-override ───────────────

// Derives the 0.00–1.00 Master Multiplier from four raw signals.
// Pure: same inputs + config always yield the same score. This is the function
// a future backtest(salesHistory) will replay against real revenue (G6).
export function deriveMultiplierScore(
  inputs: RawGatekeeperInputs,
  config: Pick<TenantConfig, 'multiplierWeights' | 'hardOverrides'>,
  weather?: WeatherReading,
): number {
  const w = config.multiplierWeights

  // The road is a gate; weather converts it. OPEN + sun → full road read,
  // OPEN + cold rain → "open, but nobody's driving out." RESTRICTED still 0
  // (and the hard-cap below applies regardless of weather).
  const hwy6 = normalizeHwy6(inputs.hwy6Status) * weatherDemandFactor(weather)
  const gas = normalizeGas(inputs.gasPrice)
  const search = normalizeSearch(inputs.searchInterest)
  const lodging = normalizeLodging(inputs.lodgingValue, inputs.lodgingMax)

  // Layer 2: weighted average.
  const weighted = hwy6 * w.hwy6 + gas * w.gas + search * w.search + lodging * w.lodging

  // Layer 3: apply any critical hard-caps. Currently only Hwy 6 is wired as a
  // capped signal; the loop reads the rule from config so new caps need no code.
  let score = weighted
  for (const o of config.hardOverrides) {
    if (o.gatekeeperId === 'hwy6' && inputs.hwy6Status === (o.condition as Hwy6Status)) {
      score = Math.min(score, o.capScore)
    }
  }

  return clamp01(score)
}

export function getMultiplierLabel(score: number, thresholds: MultiplierThresholds): MasterMultiplierData['label'] {
  if (score >= thresholds.high) return 'HIGH VOL'
  if (score < thresholds.low) return 'LOW VOL'
  return 'MODERATE'
}

export function getMultiplierColor(score: number, thresholds: MultiplierThresholds): MasterMultiplierData['color'] {
  if (score >= thresholds.high) return 'green'
  if (score < thresholds.low) return 'red'
  return 'amber'
}

export function getMultiplierBarWidth(score: number): number {
  return Math.round(Math.min(1, Math.max(0, score)) * 100)
}

export function buildMultiplierData(score: number, thresholds: MultiplierThresholds): MasterMultiplierData {
  return {
    score,
    label: getMultiplierLabel(score, thresholds),
    color: getMultiplierColor(score, thresholds),
    barWidthPercent: getMultiplierBarWidth(score),
  }
}
