export type GatekeeperStatus = 'OPEN' | 'ADVISORY' | 'RESTRICTED' | 'HIGH' | 'MODERATE' | 'LOW'
export type RefreshCadence = 'realtime' | 'daily' | 'weekly' | 'monthly' | 'quarterly'

export type Hwy6Status = 'OPEN' | 'ADVISORY' | 'RESTRICTED'

// The Lodging indicator's *source*. The indicator is always "lodging occupancy";
// the source is swappable. `tlt` = public Transient Lodging Tax (free, ~90-day
// lag, the baseline). `client` = the business's own weekly export (live, the
// paid-coaching upgrade). "Lagging" is a property of the SOURCE, not the indicator.
export type LodgingSource = 'tlt' | 'client'

// The four raw gatekeeper readings for a single point in time, before
// normalization. This is what the data pipeline (Postgres) will hand the
// formula. Each field maps to one row's worth of `gatekeeper_observations`.
export interface RawGatekeeperInputs {
  hwy6Status: Hwy6Status
  gasPrice: number       // regional average, $/gal
  searchInterest: number // Google Trends index, 0–100
  lodgingValue: number   // raw lodging reading for the period (TLT $ now; occupancy when client-sourced)
  lodgingMax: number     // historical max for normalization
}

export interface GatekeeperMetric {
  id: string
  label: string
  value: string
  status: GatekeeperStatus
  lastUpdated: string
}

export interface MasterMultiplierData {
  score: number
  label: 'HIGH VOL' | 'MODERATE' | 'LOW VOL'
  color: 'green' | 'amber' | 'red'
  barWidthPercent: number
}

export interface ForecastAnnotationData {
  paragraphs: string[]
  recommendation: string
}

export interface SignalFreshness {
  lastUpdated: string
  cadence: RefreshCadence
  isStale: boolean
}

// ─── Weather ──────────────────────────────────────────────────────────────────
// Weather is NOT a gatekeeper — it's a *modulator* of the Hwy 6 read. An open
// road is a gate (people CAN come); weather decides whether they DO. So weather
// scales the road's contribution: OPEN + sun → full, OPEN + cold rain → damped.
// Maps from NWS/weather.gov forecast icons when the live source is wired.
export type WeatherCondition = 'clear' | 'partly_cloudy' | 'cloudy' | 'rain' | 'storm' | 'snow'

export interface WeatherReading {
  condition: WeatherCondition
  tempF: number
  summary: string   // short human label, e.g. "Sunny", "Cold rain"
}
