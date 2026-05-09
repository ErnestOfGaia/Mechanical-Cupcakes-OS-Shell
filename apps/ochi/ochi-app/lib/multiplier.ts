import type { MasterMultiplierData } from './types'
import type { MultiplierThresholds } from './tenant.config'

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
