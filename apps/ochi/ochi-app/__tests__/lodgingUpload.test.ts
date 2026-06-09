import { describe, it, expect } from 'vitest'
import { parseLodgingCsv, computeTeaser, lockedTeasers } from '../lib/lodgingUpload'

const CSV =
  'week_ending,occupancy_pct,revenue\n' +
  '2025-06-07,40,14200\n' +
  '2025-06-14,80,16850\n' +
  '2025-06-21,60,19300\n'

describe('parseLodgingCsv', () => {
  it('parses a well-formed CSV', () => {
    const { weeks, warnings } = parseLodgingCsv(CSV)
    expect(weeks).toHaveLength(3)
    expect(weeks[0]).toEqual({ weekEnding: '2025-06-07', occupancyPct: 40, revenue: 14200 })
    expect(warnings).toHaveLength(0)
  })

  it('accepts header aliases and a stray % sign', () => {
    const { weeks } = parseLodgingCsv('date,occupancy\n2025-01-01,55%\n')
    expect(weeks[0]).toEqual({ weekEnding: '2025-01-01', occupancyPct: 55 })
  })

  it('clamps occupancy to 0–100 and skips unreadable rows', () => {
    const { weeks, warnings } = parseLodgingCsv('week_ending,occupancy_pct\n2025-01-01,140\n,\n2025-01-08,30\n')
    expect(weeks.map((w) => w.occupancyPct)).toEqual([100, 30])
    expect(warnings.some((w) => w.includes('Skipped'))).toBe(true)
  })

  it('warns when required columns are missing', () => {
    const { weeks, warnings } = parseLodgingCsv('foo,bar\n1,2\n')
    expect(weeks).toHaveLength(0)
    expect(warnings[0]).toMatch(/Missing required columns/)
  })

  it('warns on an empty file', () => {
    expect(parseLodgingCsv('').warnings[0]).toMatch(/empty/)
  })
})

describe('computeTeaser', () => {
  it('derives the real highlights from the data', () => {
    const t = computeTeaser(parseLodgingCsv(CSV))!
    expect(t.weeksCount).toBe(3)
    expect(t.avgOccupancy).toBe(60) // (40+80+60)/3
    expect(t.peak).toEqual({ weekEnding: '2025-06-14', occupancyPct: 80 })
    expect(t.trough).toEqual({ weekEnding: '2025-06-07', occupancyPct: 40 })
    expect(t.rangeStart).toBe('2025-06-07')
    expect(t.rangeEnd).toBe('2025-06-21')
  })

  it('counts swing weeks (mid-band 40–70%)', () => {
    const t = computeTeaser(parseLodgingCsv(CSV))! // 40 and 60 are mid-band; 80 is not
    expect(t.swingWeeks).toBe(2)
  })

  it('returns null for no weeks', () => {
    expect(computeTeaser({ weeks: [], warnings: [] })).toBeNull()
  })
})

describe('lockedTeasers', () => {
  it('teases the swing-week count without listing the weeks', () => {
    const t = computeTeaser(parseLodgingCsv(CSV))!
    const locked = lockedTeasers(t)
    expect(locked).toHaveLength(3)
    expect(locked[0]).toContain('2 shoulder-season weeks')
  })
})
