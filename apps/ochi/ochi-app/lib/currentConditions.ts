import type { RawGatekeeperInputs, WeatherReading, WeatherCondition } from './types'

// ─── The data seam ────────────────────────────────────────────────────────────
// This is the ONE place the dashboard learns "what are the conditions right now."
// Today it returns mock data. In Phase 2 the body of getCurrentInputs() becomes a
// read from Postgres (the latest row of `gatekeeper_observations` + the dataset's
// historical lodging max) — and nothing else in the app changes. Components depend
// on the *shape* (RawGatekeeperInputs), never on where the numbers come from.
//
// These mock values are tuned to reproduce the prototype's original 0.82 hero so
// the live dashboard reads identically — but now it is COMPUTED, not hardcoded:
//   hwy6 OPEN (1.0)*0.40 + gas $4.30 (0.6)*0.20 + search 80 (0.8)*0.30 + lodging 60/100 (0.6)*0.10
//   = 0.40 + 0.12 + 0.24 + 0.06 = 0.82

const MOCK_INPUTS: RawGatekeeperInputs = {
  hwy6Status: 'OPEN',
  gasPrice: 4.3,
  searchInterest: 80,
  lodgingValue: 60,
  lodgingMax: 100,
}

// Whether the gatekeeper readings above are demonstration values rather than
// observations. The dashboard is PUBLIC and carries a lead-capture funnel, so it
// must not describe constants as live signals — everything that renders a liveness
// claim reads this flag rather than guessing from refresh cadence.
//
// ⚠️ Flip this to false in the SAME commit that makes getCurrentInputs() read from
// Postgres — never before, never separately. `__tests__/demoDisclosure.test.ts`
// asserts the coupling, so a flag that disagrees with the function fails the build.
//
// Note: weather is NOT covered by this flag. getCurrentWeather() below is a real
// NWS call and stays live in both modes.
export const GATEKEEPERS_ARE_DEMO_DATA = true

export function getCurrentInputs(): RawGatekeeperInputs {
  return MOCK_INPUTS
}

// Exported for the coupling test only — lets it prove getCurrentInputs() is still
// handing back the constant, which is what makes the flag above true.
export const __MOCK_INPUTS_FOR_TESTS = MOCK_INPUTS

// ─── Live weather (NWS / weather.gov) ──────────────────────────────────────────
// The weather modulator runs on REAL conditions for Pacific City, OR. NWS is free
// and needs no API key, but requires a descriptive User-Agent. Responses are cached
// 30 min (Next data cache). On ANY failure we fall back to a clear day so the
// dashboard never breaks. (Coords are Pacific City; move to tenant.config when a
// second tenant needs its own location.)
const PACIFIC_CITY = { lat: 45.2021, lon: -123.9618 }
const NWS_UA = 'OCHI Dashboard (ochi.mechanicalcupcakes.fun, eog@ernestofgaia.xyz)'
const WEATHER_FALLBACK: WeatherReading = { condition: 'clear', tempF: 68, summary: 'Sunny' }

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
    const period = (await fRes.json())?.properties?.periods?.[0]
    if (!period) return WEATHER_FALLBACK

    const tempF = period.temperatureUnit === 'F'
      ? period.temperature
      : Math.round((period.temperature ?? 20) * 9 / 5 + 32)

    return {
      condition: mapNwsCondition(String(period.shortForecast ?? '')),
      tempF: typeof tempF === 'number' ? tempF : WEATHER_FALLBACK.tempF,
      summary: String(period.shortForecast ?? 'Current conditions'),
    }
  } catch {
    return WEATHER_FALLBACK
  }
}
