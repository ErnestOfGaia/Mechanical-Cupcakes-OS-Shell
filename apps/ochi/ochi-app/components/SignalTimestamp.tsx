import React from 'react'
import type { RefreshCadence } from '../lib/types'

interface SignalTimestampProps {
  lastUpdated: string
  cadence: RefreshCadence
  className?: string
}

const STALE_THRESHOLD_DAYS: Record<RefreshCadence, number> = {
  realtime: Infinity,
  daily: 2,
  weekly: 10,
  monthly: 45,
  quarterly: 90,
}

export function getRelativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 14) return `${diffDays}d ago`
  return `${diffWeeks}w ago`
}

export function checkIsStale(isoDate: string, cadence: RefreshCadence): boolean {
  const diffDays = (Date.now() - new Date(isoDate).getTime()) / 86400000
  return diffDays > STALE_THRESHOLD_DAYS[cadence]
}

export function SignalTimestamp({ lastUpdated, cadence, className }: SignalTimestampProps) {
  const stale = checkIsStale(lastUpdated, cadence)
  const relTime = getRelativeTime(lastUpdated)
  return (
    <span
      className={`text-[10px] font-medium ${stale ? 'text-amber-600' : 'text-gray-400'} ${className ?? ''}`}
      aria-label={`Last updated ${relTime}${stale ? ' — data may be stale' : ''}`}
    >
      {stale ? `⚠ Updated ${relTime}` : `Updated ${relTime}`}
    </span>
  )
}
