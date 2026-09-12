import type { RefreshCadence } from './types'

// L6 (2026-09-12): the one half of the old, never-rendered SignalTimestamp
// component that earned its keep. The dashboard already shows WHEN a row was
// recorded (formatAsOf); this answers whether that is too long ago for the
// source's cadence. The stored row is written weekly by the Thursday routine,
// so a row older than the weekly threshold means the routine missed a week —
// and the page should say so rather than present a two-week-old read as current.
// The relative "3d ago" half was deleted: an absolute Pacific stamp already exists.
export const STALE_THRESHOLD_DAYS: Record<RefreshCadence, number> = {
  realtime: Infinity,
  daily: 2,
  weekly: 10,
  monthly: 45,
  quarterly: 90,
}

export function checkIsStale(isoDate: string, cadence: RefreshCadence, now: number = Date.now()): boolean {
  const t = Date.parse(isoDate)
  if (Number.isNaN(t)) return false // unknown time is "unknown", not "stale"
  return (now - t) / 86400000 > STALE_THRESHOLD_DAYS[cadence]
}
