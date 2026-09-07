import type { RawGatekeeperInputs, WeatherReading, WeatherCondition } from './types'
import { getPool } from './db'
import { readLatestObservation, weekendLabel, type ObservationRow } from './observations'

// ─── The data seam ────────────────────────────────────────────────────────────
// This is the ONE place the dashboard learns "what are the conditions right now."
// Since S4 (2026-09-07) it reads the latest row of `gatekeeper_observations` from
// Postgres. Components depend on the *shape* (GatekeeperRead), never on where the
// numbers come from.
//
// THREE STATES, and only three:
//   live         a row was read — show it, with the row's own timestamps
//   demo         GATEKEEPERS_ARE_DEMO_DATA is true — show MOCK_INPUTS under the
//                "Demonstration data" disclosure (shipped 2026-08-05)
//   unavailable  the flag is false and the read FAILED (database down, empty
//                table, query error, no password) — show THAT. Every stored
//                signal reads "unavailable", not a number.
//
// ⛔ There is no fourth state. A failed read never falls back to MOCK_INPUTS
// while the flag says live. That is exactly the lie removed on 2026-08-05
// ("3 of 4 signals live" over constants), and a `catch { return MOCK_INPUTS }`
// is the most natural thing to type here. Don't. OCHI is a current-conditions
// check-in: a fabricated reading during a check-in is worse than no dashboard,
// because the user has now confirmed a plan against fiction.

const MOCK_INPUTS: RawGatekeeperInputs = {
  hwy6Status: 'OPEN',
  gasPrice: 4.3,
  searchInterest: 80,
  lodgingValue: 60,
  lodgingMax: 100,
}

// Whether the gatekeeper readings are demonstration values rather than
// observations. The dashboard is PUBLIC and carries a lead-capture funnel, so it
// must not describe constants as live signals — everything that renders a liveness
// claim reads this flag rather than guessing from refresh cadence.
//
// Flipped to false 2026-09-07 in the SAME commit that made getCurrentInputs() read
// from Postgres (S5). `__tests__/demoDisclosure.test.ts` asserts the coupling, so a
// flag that disagrees with the function fails the build. Set it back to true only
// with the read still in place; the test then expects the mock again.
//
// Note: weather is NOT covered by this flag. getCurrentWeather() below is a real
// NWS call and stays live in every mode.
export const GATEKEEPERS_ARE_DEMO_DATA = false

export type SignalId = 'hwy6' | 'gas' | 'search' | 'lodging'

// One stored week, as the view wants it: camelCase, numbers or null, plus the
// two timestamps freshness is built on — which week, and when the row was written.
export interface LiveObservation {
  weekStartDate: string       // 'YYYY-MM-DD', a Monday
  weekendLabel: string        // "Weekend of Sep 12–13" — the dashboard faces the weekend
  updatedAt: string           // ISO 8601 — the "as of" for every stored signal
  hwy6Status: RawGatekeeperInputs['hwy6Status']
  gasPrice: number | null
  gasSource: 'aaa' | 'eia' | null
  searchInterest: number | null
  lodgingValue: number | null
  lodgingMax: number | null
  lodgingSource: ObservationRow['lodging_source']
  observedVolume: ObservationRow['observed_volume']
  notes: string | null
}

export type GatekeeperRead =
  | { state: 'demo'; inputs: RawGatekeeperInputs }
  | {
      state: 'live'
      observation: LiveObservation
      // The formula needs all four. `inputs` is set only when the row carries all
      // four; otherwise `missing` names what was not recorded and there is no score.
      inputs: RawGatekeeperInputs | null
      missing: SignalId[]
    }
  | { state: 'unavailable'; reason: string }

function toLive(row: ObservationRow, lodgingMax: number | null): Extract<GatekeeperRead, { state: 'live' }> {
  const gasPrice = row.gas_price_aaa ?? row.gas_price_eia
  const gasSource = row.gas_price_aaa !== null ? 'aaa' : row.gas_price_eia !== null ? 'eia' : null
  const observation: LiveObservation = {
    weekStartDate: row.week_start_date,
    weekendLabel: weekendLabel(row.week_start_date),
    updatedAt: row.updated_at,
    hwy6Status: row.hwy6_status,
    gasPrice,
    gasSource,
    searchInterest: row.search_interest,
    lodgingValue: row.lodging_value,
    lodgingMax,
    lodgingSource: row.lodging_source,
    observedVolume: row.observed_volume,
    notes: row.notes,
  }
  const missing: SignalId[] = []
  if (gasPrice === null) missing.push('gas')
  if (row.search_interest === null) missing.push('search')
  if (row.lodging_value === null || lodgingMax === null) missing.push('lodging')

  const inputs: RawGatekeeperInputs | null = missing.length === 0
    ? {
        hwy6Status: row.hwy6_status,
        gasPrice: gasPrice as number,
        searchInterest: row.search_interest as number,
        lodgingValue: row.lodging_value as number,
        lodgingMax: lodgingMax as number,
      }
    : null

  return { state: 'live', observation, inputs, missing }
}

export async function getCurrentInputs(): Promise<GatekeeperRead> {
  if (GATEKEEPERS_ARE_DEMO_DATA) return { state: 'demo', inputs: MOCK_INPUTS }

  if (!process.env.OCHI_PG_PASSWORD) {
    // Say why, in the log and on the page. Not a fallback — an explanation.
    console.error('[ochi/read] OCHI_PG_PASSWORD is unset — stored signals unavailable')
    return { state: 'unavailable', reason: 'database credentials are not configured' }
  }

  try {
    const latest = await readLatestObservation(getPool())
    if (!latest) return { state: 'unavailable', reason: 'no observations have been recorded yet' }
    return toLive(latest.row, latest.lodgingMax)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[ochi/read] stored signals unavailable:', message)
    return { state: 'unavailable', reason: `the database could not be read (${message})` }
  }
}

// Exported for the coupling test only — lets it prove that demo mode hands back
// the constant and that no other state ever does.
export const __MOCK_INPUTS_FOR_TESTS = MOCK_INPUTS

// ─── Live weather (NWS / weather.gov) ──────────────────────────────────────────
// The weather modulator runs on REAL conditions for Pacific City, OR. NWS is free
// and needs no API key, but requires a descriptive User-Agent. Responses are cached
// 30 min (Next data cache). On ANY failure we fall back to a clear day so the
// dashboard never breaks — that fallback carries observedAt: null, so the page can
// say the forecast time is unknown rather than stamping a time on a default.
// (Coords are Pacific City; move to tenant.config when a second tenant needs its
// own location.)
const PACIFIC_CITY = { lat: 45.2021, lon: -123.9618 }
const NWS_UA = 'OCHI Dashboard (ochi.mechanicalcupcakes.fun, eog@ernestofgaia.xyz)'
const WEATHER_FALLBACK: WeatherReading = { condition: 'clear', tempF: 68, summary: 'Sunny', observedAt: null }

function mapNwsCondition(short: string): WeatherCondition {
  const s = short.toLowerCase()
  if (/(thunder|storm|tornado|hurricane)/.test(s)) return 'storm'
  if (/(snow|sleet|ice|blizzard|flurr)/.test(s)) return 'snow'
  if (/(rain|shower|drizzle)/.test(s)) return 'rain'
  if (/(partly|mostly sunny|partly sunny|few clouds)/.test(s)) return 'partly_cloudy'
  if (/(cloud|overcast|fog|haze)/.test(s)) return 'cloudy'
  if (/(clear|sunny|fair)/.test(s)) return 'clear'
  return 'partly_cloudy'
}

export async function getCurrentWeather(): Promise<WeatherReading> {
  const headers = { 'User-Agent': NWS_UA, Accept: 'application/geo+json' }
  try {
    // 1) resolve the gridpoint → forecast URL
    const ptRes = await fetch(
      `https://api.weather.gov/points/${PACIFIC_CITY.lat},${PACIFIC_CITY.lon}`,
      { headers, next: { revalidate: 1800 } },
    )
    if (!ptRes.ok) return WEATHER_FALLBACK
    const forecastUrl = (await ptRes.json())?.properties?.forecast
    if (!forecastUrl) return WEATHER_FALLBACK

    // 2) fetch the forecast, read the current/next period
    const fRes = await fetch(forecastUrl, { headers, next: { revalidate: 1800 } })
    if (!fRes.ok) return WEATHER_FALLBACK
    const forecast = await fRes.json()
    const period = forecast?.properties?.periods?.[0]
    if (!period) return WEATHER_FALLBACK

    const tempF = period.temperatureUnit === 'F'
      ? period.temperature
      : Math.round((period.temperature ?? 20) * 9 / 5 + 32)

    // NWS stamps when the forecast was generated; that is the reading's time.
    const generated = forecast?.properties?.generatedAt ?? forecast?.properties?.updateTime
    const observedAt = typeof generated === 'string' && !Number.isNaN(Date.parse(generated)) ? generated : null

    return {
      condition: mapNwsCondition(String(period.shortForecast ?? '')),
      tempF: typeof tempF === 'number' ? tempF : WEATHER_FALLBACK.tempF,
      summary: String(period.shortForecast ?? 'Current conditions'),
      observedAt,
    }
  } catch {
    return WEATHER_FALLBACK
  }
}
