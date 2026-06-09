import type { RefreshCadence, LodgingSource } from './types'

export type DataSourceType = 'manual' | 'scraper' | 'api'

export interface GatekeeperDefinition {
  id: string
  label: string
  loudAiAnnotation: string
  icon: string
  unit?: string
  // Lodging only: which source currently feeds this indicator (tlt | client).
  // The baseline is `tlt` (public, lagging); a client upgrade swaps it to `client`.
  source?: LodgingSource
  dataSource: {
    type: DataSourceType
    refreshCadence: RefreshCadence
    sourceLabel: string
    endpoint?: string
  }
}

export interface MultiplierThresholds {
  high: number
  low: number
}

// How much each gatekeeper contributes to the weighted score. Must sum to 1.0.
// `lodging` is the Transient-Lodging indicator; its baseline source (public TLT)
// lags, so it sits at 0.10 here. A client-sourced tenant carries a *calibrated*
// lodging weight (tuned against their real sales via the G6 backtest), not 0.10.
export interface MultiplierWeights {
  hwy6: number
  gas: number
  search: number
  lodging: number
}

// A critical-signal rule: when a gatekeeper hits `condition`, the final score
// is capped at `capScore` regardless of how strong the other signals are.
export interface HardOverride {
  gatekeeperId: string
  condition: string
  capScore: number
}

export interface TenantConfig {
  id: string
  name: string
  region: string
  consumerProfile: string
  criticalGatekeeperId: string
  criticalGatekeeperImpact: string
  multiplierThresholds: MultiplierThresholds
  multiplierWeights: MultiplierWeights
  hardOverrides: HardOverride[]
  gatekeepers: GatekeeperDefinition[]
}

export const PACIFIC_CITY_CONFIG: TenantConfig = {
  id: 'pacific-city-pilot',
  name: 'Pacific City',
  region: 'Tillamook County, OR',
  consumerProfile: '70% Weekend Warriors — longer stays, larger groups',
  criticalGatekeeperId: 'hwy6',
  criticalGatekeeperImpact: 'Restricted status projects volume at 40% of normal, even on sunny weekends.',
  multiplierThresholds: { high: 0.70, low: 0.40 },
  // v1 weights — Hwy6-dominant prior (see OCHI_GRILL_2026-06-08_DECISIONS.md G3).
  multiplierWeights: { hwy6: 0.40, gas: 0.20, search: 0.30, lodging: 0.10 },
  // The highway is king: a RESTRICTED Wilson River corridor caps volume at 40%
  // of normal no matter how strong gas, search, and lodging look.
  hardOverrides: [{ gatekeeperId: 'hwy6', condition: 'RESTRICTED', capScore: 0.40 }],
  gatekeepers: [
    {
      id: 'hwy6',
      label: 'Hwy 6 Status',
      loudAiAnnotation: 'Wilson River corridor is the primary arterial to the coast. A Restricted status limits coastal day-trippers to 40% of normal volume regardless of weather or search intent. Lead time: ~90 minutes on regional arrival impact.',
      icon: 'Map',
      dataSource: { type: 'manual', refreshCadence: 'daily', sourceLabel: 'TripCheck.com (ODOT)' },
    },
    {
      id: 'gas',
      label: 'Gas Index',
      loudAiAnnotation: 'Regional fuel prices above $4.50/gal correlate with suppressed weekend travel. Travelers self-select shorter trips when fill-up cost for a round trip exceeds psychological thresholds.',
      icon: 'Fuel',
      unit: '$/gal',
      dataSource: { type: 'api', refreshCadence: 'daily', sourceLabel: 'AAA Oregon' },
    },
    {
      id: 'search',
      label: 'Search Intent',
      loudAiAnnotation: 'Google Trends for Cape Kiwanda and Pacific City measures forward-looking demand. High search interest this week typically translates to foot traffic in 3-7 days. It is a leading indicator.',
      icon: 'Search',
      dataSource: { type: 'api', refreshCadence: 'weekly', sourceLabel: 'Google Trends' },
    },
    {
      id: 'lodging',
      label: 'Lodging Pulse',
      // The indicator is lodging occupancy. Its baseline source is the public
      // Transient Lodging Tax, which lags ~90 days — hence the client-data upgrade.
      source: 'tlt',
      loudAiAnnotation: 'Tillamook County Transient Lodging Tax collections reflect actual overnight stays. IMPORTANT: on its public source this is a lagging indicator — data is approximately 90 days behind the current date. Use it as a seasonal baseline, not a real-time read (connecting a property’s own weekly lodging data makes it live).',
      icon: 'Activity',
      dataSource: { type: 'api', refreshCadence: 'quarterly', sourceLabel: 'Tillamook County TLT (public)' },
    },
  ],
}

export const ACTIVE_TENANT = PACIFIC_CITY_CONFIG
