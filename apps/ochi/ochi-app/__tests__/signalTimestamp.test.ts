import { describe, it, expect } from 'vitest'
import { checkIsStale } from '../components/SignalTimestamp'

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString()

describe('checkIsStale', () => {
  it('daily: fresh at 1 day', () => expect(checkIsStale(daysAgo(1), 'daily')).toBe(false))
  it('daily: stale at 3 days', () => expect(checkIsStale(daysAgo(3), 'daily')).toBe(true))
  it('quarterly: fresh at 89 days', () => expect(checkIsStale(daysAgo(89), 'quarterly')).toBe(false))
  it('quarterly: stale at 91 days', () => expect(checkIsStale(daysAgo(91), 'quarterly')).toBe(true))
  it('realtime: never stale', () => expect(checkIsStale(daysAgo(999), 'realtime')).toBe(false))
})
