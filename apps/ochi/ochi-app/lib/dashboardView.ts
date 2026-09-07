import type { MasterMultiplierData, RawGatekeeperInputs, WeatherReading, WeatherCondition } from './types'
import { getCurrentInputs, getCurrentWeather, type GatekeeperRead, type SignalId } from './currentConditions'
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
// Turns the data seam (getCurrentInputs → deriveMultiplierScore) into the shape
// the UI renders. Everything here is COMPUTED from the read or taken from
// tenant.config — no canned narrative, no fabricated history, and no number
// that did not come from a stored row or a live feed.
//
// OCHI is a current-conditions CHECK-IN (Ernest, 2026-09-07): the user heard
// something about the weekend, made a plan, and wants to see conditions NOW,
// per signal, with a timestamp. Signals first; the Multiplier is the appendix.

export type StatusToken = 'good' | 'watch' | 'risk' | 'nodata'
export type BandTone = 'low' | 'mid' | 'high'
export type DataState = 'live' | 'demo' | 'unavailable'

export type WeatherIcon = 'sun' | 'cloud' | 'rain' | 'storm'

export interface WeatherView {
  icon: WeatherIcon
  tempF: number
  summary: string        // "Sunny"
  asOf: string | null    // "Sun, Sep 6, 4:12 PM PT" — NWS forecast time; null on the fallback
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
  value: string          // human-readable raw reading — or "Unavailable" / "Not recorded"
  status: StatusToken
  statusLabel: string
  why: string            // tenant.config loudAiAnnotation (real authored content)
  cadence: string        // e.g. "daily" — from the gatekeeper's data source
  lagging: boolean
  // Freshness, per signal, always. "recorded Thu, Sep 10, 9:14 AM PT" in live
  // mode; "sample value" in demo; "unavailable" when the read failed.
  freshness: string
  recorded: boolean      // false when there is no reading behind `value`
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
  dataState: DataState
  // null when there is nothing honest to score: the read failed, or the stored
  // week is missing a signal the formula needs. `heroNote` says which.
  hero: HeroView | null
  heroNote: string | null
  gatekeepers: GatekeeperView[]
  weights: WeightBar[]
  confidence: string
  summary: string
  action: string
  // True while the gatekeeper readings are sample values. Drives the visible
  // demo banner; mirrors GATEKEEPERS_ARE_DEMO_DATA so the UI never has to guess.
  isDemoData: boolean
  // Live mode only: which weekend the stored row describes and when it was written.
  weekLabel: string | null
  asOf: string | null
  // Unavailable mode only: the reason, in English, for the banner.
  unavailableReason: string | null
  // Live mode: signals the stored week does not carry.
  missing: SignalId[]
}

const STATUS_LABEL: Record<StatusToken, string> = {
  good: 'Calm',
  watch: 'Watch',
  risk: 'Surge',
  nodata: 'No data',
}

const SIGNAL_NAME: Record<SignalId, string> = {
  hwy6: 'Hwy 6',
  gas: 'gas price',
  search: 'search interest',
  lodging: 'lodging',
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

// Pacific time, day + clock, no seconds: "Thu, Sep 10, 9:14 AM PT". The user is
// checking in from the Oregon coast; the row was written in UTC.
export function formatAsOf(iso: string | null | undefined): string | null {
  if (!iso) return null
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return null
  const s = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  }).format(new Date(t))
  return `${s} PT`
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
  if (band === 'HIGH VOL') return 'Staff a full floor — the signals point to a high-volume period.'
  if (band === 'LOW VOL') return 'Staff lean — the signals point to a quiet period.'
  return 'Staff a standard shift and keep a flex shift you can call in.'
}

function formatValue(id: string, inputs: RawGatekeeperInputs): string {
  switch (id) {
    case 'hwy6': return inputs.hwy6Status
    case 'gas': return `$${inputs.gasPrice.toFixed(2)}`
    case 'search': return String(inputs.searchInterest)
    case 'lodging': return 'Actual Overnight Stays'
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
function conditionsVerdict(hwy6Status: RawGatekeeperInputs['hwy6Status'], weather: WeatherReading): string {
  if (hwy6Status === 'RESTRICTED')
    return 'Highway restricted — volume is capped no matter the weather.'
  if (hwy6Status === 'ADVISORY')
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

function weatherViewOf(weather: WeatherReading): WeatherView {
  return {
    icon: WEATHER_ICON[weather.condition],
    tempF: weather.tempF,
    summary: weather.summary,
    asOf: formatAsOf(weather.observedAt),
  }
}

function heroOf(score: number, thresholds: TenantConfig['multiplierThresholds']): HeroView {
  const data = buildMultiplierData(score, thresholds)
  return {
    score,
    scoreText: score.toFixed(2),
    band: data.label,
    bandTone: bandToneOf(data.label),
    headline: headlineOf(data.label),
  }
}

function bandWordOf(band: MasterMultiplierData['label']): string {
  return band === 'HIGH VOL' ? 'high' : band === 'LOW VOL' ? 'low' : 'moderate'
}

export async function buildDashboardView(
  tenant: TenantConfig = ACTIVE_TENANT,
  read?: GatekeeperRead,
  weatherOverride?: WeatherReading,
): Promise<DashboardView> {
  const r = read ?? await getCurrentInputs()
  const weather = weatherOverride ?? await getCurrentWeather()

  const weights: WeightBar[] = tenant.gatekeepers.map((g) => ({
    id: g.id,
    label: g.label,
    percent: Math.round((tenant.multiplierWeights[g.id as keyof typeof tenant.multiplierWeights] ?? 0) * 100),
    lagging: g.source ? g.source === 'tlt' : g.dataSource.refreshCadence === 'quarterly',
  }))

  // ── unavailable: the flag is off and the read failed. Show that, plainly. ──
  if (r.state === 'unavailable') {
    const gatekeepers: GatekeeperView[] = tenant.gatekeepers.map((g) => {
      const isRoad = g.id === 'hwy6'
      const lagging = g.source ? g.source === 'tlt' : g.dataSource.refreshCadence === 'quarterly'
      return {
        id: g.id,
        label: isRoad ? 'Highway & Weather' : g.label,
        value: 'Unavailable',
        status: 'nodata',
        statusLabel: 'Unavailable',
        why: g.loudAiAnnotation,
        cadence: g.dataSource.refreshCadence,
        lagging,
        freshness: 'unavailable — no stored reading could be shown',
        recorded: false,
        ...(g.id === 'lodging' && { sourceLabel: g.dataSource.sourceLabel }),
        ...(isRoad && {
          weather: weatherViewOf(weather),
          verdict: 'Road status unavailable — the weather is live, the road reading is not.',
          weatherNote: weatherNoteOf(weather),
        }),
      }
    })
    return {
      dataState: 'unavailable',
      hero: null,
      heroNote: 'No score — the stored signals are unavailable.',
      gatekeepers,
      weights,
      confidence: 'Stored signals unavailable — weather is the only live signal',
      summary:
        `OCHI could not read its stored gatekeeper signals: ${r.reason}. ` +
        `Nothing below is a reading, and there is no Master Multiplier. The weather is a live forecast.`,
      action: 'No recommendation — check back when the signals are available.',
      isDemoData: false,
      weekLabel: null,
      asOf: null,
      unavailableReason: r.reason,
      missing: [],
    }
  }

  // ── live or demo: build per-signal cards from what the read carries. ──
  const isDemo = r.state === 'demo'
  const live = r.state === 'live' ? r : null
  const asOf = live ? formatAsOf(live.observation.updatedAt) : null
  const missing = live ? live.missing : []
  const hwy6Status = r.state === 'live' ? r.observation.hwy6Status : r.inputs.hwy6Status

  // Per-signal value when the formula inputs are incomplete: read straight from
  // the observation so a week that has gas but no search still shows the gas.
  function liveValue(id: string): string | null {
    if (!live) return null
    const o = live.observation
    switch (id) {
      case 'hwy6': return o.hwy6Status
      case 'gas': return o.gasPrice === null ? null : `$${o.gasPrice.toFixed(2)}`
      case 'search': return o.searchInterest === null ? null : String(o.searchInterest)
      case 'lodging': return o.lodgingValue === null ? null : 'Actual Overnight Stays'
      default: return null
    }
  }

  const complete: RawGatekeeperInputs | null = isDemo ? r.inputs : live!.inputs

  const gatekeepers: GatekeeperView[] = tenant.gatekeepers.map((g) => {
    const lagging = g.source ? g.source === 'tlt' : g.dataSource.refreshCadence === 'quarterly'
    const isRoad = g.id === 'hwy6'
    const baselineLodging = g.id === 'lodging' && g.source === 'tlt'
    const notRecorded = live !== null && missing.includes(g.id as SignalId)

    let value: string
    let status: StatusToken
    let statusLabel: string
    if (notRecorded) {
      value = 'Not recorded'
      status = 'nodata'
      statusLabel = 'Not recorded'
    } else if (complete) {
      value = formatValue(g.id, complete)
      status = lagging ? 'nodata' : statusFromStrength(strengthOf(g.id, complete, weather))
      statusLabel = lagging ? 'Lagging' : STATUS_LABEL[status]
    } else {
      // Live week with SOME signals missing: show the ones we have, unscored —
      // the status chip needs the formula's normalisation, and half a formula is
      // not a read. The value itself is real.
      value = liveValue(g.id) ?? 'Not recorded'
      status = 'nodata'
      statusLabel = lagging ? 'Lagging' : 'Recorded'
    }

    const freshness = isDemo
      ? `sample value · updates ${g.dataSource.refreshCadence} once wired`
      : notRecorded
        ? `not recorded for this week${asOf ? ` · row as of ${asOf}` : ''}`
        : `recorded ${asOf ?? 'time unknown'}`

    return {
      id: g.id,
      label: isRoad ? 'Highway & Weather' : g.label,
      value,
      status,
      statusLabel,
      why: g.loudAiAnnotation,
      cadence: g.dataSource.refreshCadence,
      lagging,
      freshness,
      recorded: !notRecorded,
      ...(g.id === 'lodging' && { sourceLabel: g.dataSource.sourceLabel }),
      ...(isRoad && {
        weather: weatherViewOf(weather),
        verdict: conditionsVerdict(hwy6Status, weather),
        weatherNote: weatherNoteOf(weather),
      }),
      ...(baselineLodging && { upgrade: LODGING_UPGRADE }),
    }
  })

  // `lagging` is a property of a source's refresh CADENCE, not of whether the
  // number in front of you was observed. While the gatekeepers are demo values,
  // counting the non-lagging ones as "live" states something false on a public
  // page — so the demo flag wins, and only weather may be called live.
  const recordedCount = gatekeepers.filter((g) => g.recorded).length

  if (r.state === 'demo') {
    const score = deriveMultiplierScore(r.inputs, tenant, weather)
    const hero = heroOf(score, tenant.multiplierThresholds)
    return {
      dataState: 'demo',
      hero,
      heroNote: null,
      gatekeepers,
      weights,
      confidence: 'Demonstration data — weather is the only live signal',
      summary:
        `This is a demonstration read. The Master Multiplier sits at ${score.toFixed(2)} on a 0–1 scale — ` +
        `the real formula, run over sample gatekeeper values rather than observations. Live weather does move it. ` +
        `Add your own numbers below to see the model run on something real.`,
      action: actionOf(hero.band),
      isDemoData: true,
      weekLabel: null,
      asOf: null,
      unavailableReason: null,
      missing: [],
    }
  }

  // live
  const o = live!.observation
  const weekLabel = o.weekendLabel
  const asOfText = asOf ?? 'an unknown time'

  if (complete) {
    const score = deriveMultiplierScore(complete, tenant, weather)
    const hero = heroOf(score, tenant.multiplierThresholds)
    return {
      dataState: 'live',
      hero,
      heroNote: null,
      gatekeepers,
      weights,
      confidence: `${recordedCount} of ${gatekeepers.length} signals recorded · as of ${asOfText}`,
      summary:
        `${weekLabel} reads ${bandWordOf(hero.band)}. ` +
        `The Master Multiplier sits at ${score.toFixed(2)} on a 0–1 scale — a weighted synthesis of the four gatekeepers below, ` +
        `with the lodging pulse downweighted while its public source lags. Stored signals as of ${asOfText}; weather is live.`,
      action: actionOf(hero.band),
      isDemoData: false,
      weekLabel,
      asOf,
      unavailableReason: null,
      missing: [],
    }
  }

  const missingNames = missing.map((m) => SIGNAL_NAME[m]).join(', ')
  return {
    dataState: 'live',
    hero: null,
    heroNote: `No score — this week's row is missing ${missingNames}. The Multiplier needs all four.`,
    gatekeepers,
    weights,
    confidence: `${recordedCount} of ${gatekeepers.length} signals recorded · as of ${asOfText}`,
    summary:
      `${weekLabel}. ${recordedCount} of ${gatekeepers.length} gatekeeper signals are recorded (missing: ${missingNames}), ` +
      `so there is no Master Multiplier this week — the formula needs all four, and OCHI does not fill gaps. ` +
      `The signals that are recorded are shown as stored, as of ${asOfText}; weather is live.`,
    action: 'No recommendation until the week\'s signals are complete — read the recorded signals directly.',
    isDemoData: false,
    weekLabel,
    asOf,
    unavailableReason: null,
    missing,
  }
}
