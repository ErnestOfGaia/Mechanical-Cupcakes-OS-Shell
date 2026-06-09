import type { MasterMultiplierData, RawGatekeeperInputs, WeatherReading, WeatherCondition } from './types'
import { getCurrentInputs, getCurrentWeather } from './currentConditions'
import {
  deriveMultiplierScore,
  buildMultiplierData,
  normalizeHwy6,
  normalizeGas,
  normalizeSearch,
  normalizeLodging,
  weatherDemandFactor,
} from './multiplier'
import { ACTIVE_TENANT } from './tenant.config'
import type { TenantConfig } from './tenant.config'

// ─── View model ───────────────────────────────────────────────────────────────
// Turns the real computed pipeline (getCurrentInputs → deriveMultiplierScore) into
// the shape the ported UI renders. Everything here is COMPUTED from live inputs or
// read from tenant.config — no canned narrative, no fabricated history.

export type StatusToken = 'good' | 'watch' | 'risk' | 'nodata'
export type BandTone = 'low' | 'mid' | 'high'

export type WeatherIcon = 'sun' | 'cloud' | 'rain' | 'storm'

export interface WeatherView {
  icon: WeatherIcon
  tempF: number
  summary: string        // "Sunny"
}

// Conversion hook (Lodging on its baseline TLT source): the public lodging tax
// lags ~90 days, so this is where a visitor is invited to connect their own
// *weekly* lodging data — swapping the indicator's source from public→client and
// the first step toward becoming a client. Ties into the BYO-sales-data funnel.
export interface LodgingUpgrade {
  pitch: string
  cta: string
  points: string[]
}

export interface GatekeeperView {
  id: string
  label: string
  value: string          // human-readable raw reading
  status: StatusToken
  statusLabel: string
  why: string            // tenant.config loudAiAnnotation (real authored content)
  cadence: string        // e.g. "daily" — from the gatekeeper's data source
  lagging: boolean
  sourceLabel?: string   // Lodging: which source feeds it, e.g. "Tillamook County TLT (public)"
  // Hwy 6 only: weather is shown alongside the road as the lead "conditions"
  // card, and a paired verdict reads the road+weather pair at a glance.
  weather?: WeatherView
  verdict?: string
  weatherNote?: string
  // Lodging on its lagging public source only: the source-upgrade conversion offer.
  upgrade?: LodgingUpgrade
}

export interface HeroView {
  score: number
  scoreText: string      // "0.82"
  band: MasterMultiplierData['label']
  bandTone: BandTone
  headline: string       // short, band-derived
}

export interface WeightBar {
  id: string
  label: string
  percent: number        // weight × 100, from tenant.config
  lagging: boolean
}

export interface DashboardView {
  hero: HeroView
  gatekeepers: GatekeeperView[]
  weights: WeightBar[]
  confidence: string
  summary: string
  action: string
}

const STATUS_LABEL: Record<StatusToken, string> = {
  good: 'Calm',
  watch: 'Watch',
  risk: 'Surge',
  nodata: 'No data',
}

// The Lodging card's conversion offer — reframes the public-source lag as the
// reason to bring your own weekly lodging numbers (and become a client). Copy
// lives here so it stays honest + in one place; the action wires to a lead path later.
const LODGING_UPGRADE: LodgingUpgrade = {
  pitch:
    'This is public county lodging tax — about 90 days behind. Connect your own ' +
    'weekly lodging numbers to turn it into a live occupancy read.',
  cta: 'Add your lodging data',
  points: [
    'Weekly occupancy instead of a 90-day-old county figure',
    'A Master Multiplier tuned to your actual business',
    'Your data stays yours — used for your dashboard, never shared',
  ],
}

// Higher normalized strength → busier inbound read → more surge-leaning chip.
function statusFromStrength(n: number): StatusToken {
  if (n >= 0.66) return 'risk'
  if (n >= 0.4) return 'watch'
  return 'good'
}

function bandToneOf(band: MasterMultiplierData['label']): BandTone {
  if (band === 'HIGH VOL') return 'high'
  if (band === 'LOW VOL') return 'low'
  return 'mid'
}

function headlineOf(band: MasterMultiplierData['label']): string {
  if (band === 'HIGH VOL') return 'Tracking a high-volume period.'
  if (band === 'LOW VOL') return 'A quiet period on the Cape.'
  return 'A moderate, mixed read.'
}

function actionOf(band: MasterMultiplierData['label']): string {
  if (band === 'HIGH VOL') return 'Staff a full floor — the live signals point to a high-volume period.'
  if (band === 'LOW VOL') return 'Staff lean — the live signals point to a quiet period.'
  return 'Staff a standard shift and keep a flex shift you can call in.'
}

function formatValue(id: string, inputs: RawGatekeeperInputs): string {
  switch (id) {
    case 'hwy6': return inputs.hwy6Status
    case 'gas': return `$${inputs.gasPrice.toFixed(2)}`
    case 'search': return String(inputs.searchInterest)
    case 'lodging': return 'Lagging'
    default: return '—'
  }
}

function strengthOf(id: string, inputs: RawGatekeeperInputs, weather?: WeatherReading): number {
  switch (id) {
    // Hwy 6 strength is the modulated read — open road × weather conversion.
    case 'hwy6': return normalizeHwy6(inputs.hwy6Status) * weatherDemandFactor(weather)
    case 'gas': return normalizeGas(inputs.gasPrice)
    case 'search': return normalizeSearch(inputs.searchInterest)
    case 'lodging': return normalizeLodging(inputs.lodgingValue, inputs.lodgingMax)
    default: return 0
  }
}

const WEATHER_ICON: Record<WeatherCondition, WeatherIcon> = {
  clear: 'sun',
  partly_cloudy: 'cloud',
  cloudy: 'cloud',
  rain: 'rain',
  storm: 'storm',
  snow: 'storm',
}

// The at-a-glance read of the road+weather PAIR — the whole point of the combined
// card. Computed from the road status and the weather conversion factor.
function conditionsVerdict(inputs: RawGatekeeperInputs, weather: WeatherReading): string {
  if (inputs.hwy6Status === 'RESTRICTED')
    return 'Highway restricted — volume is capped no matter the weather.'
  if (inputs.hwy6Status === 'ADVISORY')
    return 'Highway advisory — slower access into the Cape; expect arrivals to thin.'
  const f = weatherDemandFactor(weather)
  if (f >= 0.85) return 'Open road, clear skies — conditions favor a surge.'
  if (f >= 0.6) return 'Open road, mixed skies — steady, but not a surge.'
  return 'Open, but wet — access is fine, demand likely soft.'
}

function weatherNoteOf(weather: WeatherReading): string {
  const pct = Math.round(weatherDemandFactor(weather) * 100)
  return `Weather modulates the open-road read to ~${pct}% of its fair-weather pull. ` +
    `The road is the gate; weather decides how many actually make the drive.`
}

export function buildDashboardView(
  tenant: TenantConfig = ACTIVE_TENANT,
  inputs: RawGatekeeperInputs = getCurrentInputs(),
  weather: WeatherReading = getCurrentWeather(),
): DashboardView {
  const score = deriveMultiplierScore(inputs, tenant, weather)
  const data = buildMultiplierData(score, tenant.multiplierThresholds)
  const bandTone = bandToneOf(data.label)

  // Lodging on its public TLT source lags (~90 days behind) — render it as
  // "lagging" rather than scoring it as a live surge. A client-sourced lodging
  // feed is live, so the lag (and the upgrade offer) fall away. Lag is a property
  // of the SOURCE, not the indicator.
  const gatekeepers: GatekeeperView[] = tenant.gatekeepers.map((g) => {
    const lagging = g.source ? g.source === 'tlt' : g.dataSource.refreshCadence === 'quarterly'
    const status: StatusToken = lagging ? 'nodata' : statusFromStrength(strengthOf(g.id, inputs, weather))
    const isRoad = g.id === 'hwy6'
    const baselineLodging = g.id === 'lodging' && g.source === 'tlt'
    return {
      id: g.id,
      label: isRoad ? 'Highway & Weather' : g.label,
      value: formatValue(g.id, inputs),
      status,
      statusLabel: lagging ? 'Lagging' : STATUS_LABEL[status],
      why: g.loudAiAnnotation,
      cadence: g.dataSource.refreshCadence,
      lagging,
      ...(g.id === 'lodging' && { sourceLabel: g.dataSource.sourceLabel }),
      ...(isRoad && {
        weather: { icon: WEATHER_ICON[weather.condition], tempF: weather.tempF, summary: weather.summary },
        verdict: conditionsVerdict(inputs, weather),
        weatherNote: weatherNoteOf(weather),
      }),
      ...(baselineLodging && { upgrade: LODGING_UPGRADE }),
    }
  })

  const weights: WeightBar[] = tenant.gatekeepers.map((g) => ({
    id: g.id,
    label: g.label,
    percent: Math.round((tenant.multiplierWeights[g.id as keyof typeof tenant.multiplierWeights] ?? 0) * 100),
    lagging: g.source ? g.source === 'tlt' : g.dataSource.refreshCadence === 'quarterly',
  }))

  const liveCount = gatekeepers.filter((g) => !g.lagging).length
  const confidence = `${liveCount} of ${gatekeepers.length} signals live`

  const summary =
    `Today reads ${data.label === 'HIGH VOL' ? 'high' : data.label === 'LOW VOL' ? 'low' : 'moderate'}. ` +
    `The Master Multiplier sits at ${score.toFixed(2)} on a 0–1 scale — a weighted synthesis of the four gatekeepers below, ` +
    `with the lodging pulse downweighted while its public source lags.`

  return {
    hero: {
      score,
      scoreText: score.toFixed(2),
      band: data.label,
      bandTone,
      headline: headlineOf(data.label),
    },
    gatekeepers,
    weights,
    confidence,
    summary,
    action: actionOf(data.label),
  }
}
