import type { RefreshCadence } from './types'

export type DataSourceType = 'manual' | 'scraper' | 'api'

export interface GatekeeperDefinition {
  id: string
  label: string
  loudAiAnnotation: string
  icon: string
  unit?: string
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

export interface TenantConfig {
  id: string
  name: string
  region: string
  consumerProfile: string
  criticalGatekeeperId: string
  criticalGatekeeperImpact: string
  multiplierThresholds: MultiplierThresholds
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
      id: 'tlt',
      label: 'TLT Pulse',
      loudAiAnnotation: 'Tillamook County Transient Lodging Tax collections reflect actual overnight stays. IMPORTANT: This is a lagging indicator — data is approximately 90 days behind the current date. Use it as a seasonal baseline, not a real-time read.',
      icon: 'Activity',
      dataSource: { type: 'api', refreshCadence: 'quarterly', sourceLabel: 'Tillamook County TLT Reports' },
    },
  ],
}

export const ACTIVE_TENANT = PACIFIC_CITY_CONFIG
