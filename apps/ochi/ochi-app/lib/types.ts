export type GatekeeperStatus = 'OPEN' | 'ADVISORY' | 'RESTRICTED' | 'HIGH' | 'MODERATE' | 'LOW'
export type RefreshCadence = 'realtime' | 'daily' | 'weekly' | 'monthly' | 'quarterly'

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
