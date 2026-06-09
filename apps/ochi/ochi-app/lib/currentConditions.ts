import type { RawGatekeeperInputs, WeatherReading } from './types'

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

export function getCurrentInputs(): RawGatekeeperInputs {
  return MOCK_INPUTS
}

// Same seam, for weather. Today: a clear 68°F day, so the open road reads as a
// genuine surge. In Phase 2 this becomes a read from the NWS/weather.gov forecast
// API for Pacific City (no key required) — and nothing else in the app changes.
const MOCK_WEATHER: WeatherReading = {
  condition: 'clear',
  tempF: 68,
  summary: 'Sunny',
}

export function getCurrentWeather(): WeatherReading {
  return MOCK_WEATHER
}
