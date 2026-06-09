import { describe, it, expect } from 'vitest'
import { parseLodgingCsv, computeTeaser, nextWithOchi } from '../lib/lodgingUpload'

const CSV =
  'week_ending,occupancy_pct,sales\n' +
  '2025-06-07,40,14200\n' +
  '2025-06-14,80,16850\n' +
  '2025-06-21,60,19300\n'

describe('parseLodgingCsv', () => {
  it('parses occupancy + sales', () => {
    const { weeks, warnings } = parseLodgingCsv(CSV)
    expect(weeks).toHaveLength(3)
    expect(weeks[0]).toEqual({ weekEnding: '2025-06-07', occupancyPct: 40, sales: 14200 })
    expect(warnings).toHaveLength(0)
  })

  it('accepts a sales-only file (restaurant) and strips $ / commas', () => {
    const { weeks, warnings } = parseLodgingCsv('week_ending,sales\n2025-01-01,"$12,400"\n2025-01-08,9800\n')
    expect(weeks).toEqual([
      { weekEnding: '2025-01-01', sales: 12400 },
      { weekEnding: '2025-01-08', sales: 9800 },
    ])
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

  it('warns when no occupancy/sales column is present', () => {
    const { weeks, warnings } = parseLodgingCsv('foo,bar\n1,2\n')
    expect(weeks).toHaveLength(0)
    expect(warnings[0]).toMatch(/Missing columns/)
  })

  it('warns on an empty file', () => {
    expect(parseLodgingCsv('').warnings[0]).toMatch(/empty/)
  })
})

describe('computeTeaser — occupancy metric', () => {
  it('derives the real highlights', () => {
    const t = computeTeaser(parseLodgingCsv(CSV))!
    expect(t.metric).toBe('occupancy')
    expect(t.metricNoun).toBe('occupancy')
    expect(t.weeksCount).toBe(3)
    expect(t.avgText).toBe('60%')   // (40+80+60)/3
    expect(t.avgIndex).toBe(60)
    expect(t.peak).toEqual({ weekEnding: '2025-06-14', text: '80%' })
    expect(t.trough).toEqual({ weekEnding: '2025-06-07', text: '40%' })
    expect(t.rangeStart).toBe('2025-06-07')
    expect(t.rangeEnd).toBe('2025-06-21')
  })

  it('counts swing / peak / soft stretches and builds the 0–100 series', () => {
    const t = computeTeaser(parseLodgingCsv(CSV))! // occ: 40, 80, 60
    expect(t.swingWeeks).toBe(2)   // 40 and 60 in [40,70]
    expect(t.peakStretch).toBe(1)  // 80 >= 80
    expect(t.softStretch).toBe(1)  // 40 <= 50
    expect(t.series).toEqual([
      { label: '2025-06-07', idx: 40 },
      { label: '2025-06-14', idx: 80 },
      { label: '2025-06-21', idx: 60 },
    ])
  })

  it('returns null for no weeks', () => {
    expect(computeTeaser({ weeks: [], warnings: [] })).toBeNull()
  })
})

describe('computeTeaser — sales metric (restaurant)', () => {
  // sales 5000, 10000, 7500 → indexed to peak 10000: 50, 100, 75
  const SALES = 'week_ending,sales\n2025-03-01,5000\n2025-03-08,10000\n2025-03-15,7500\n'
  it('reads sales, formats $, and indexes 0–100 against the peak', () => {
    const t = computeTeaser(parseLodgingCsv(SALES))!
    expect(t.metric).toBe('sales')
    expect(t.metricNoun).toBe('weekly sales')
    expect(t.avgText).toBe('$7,500')              // (5000+10000+7500)/3
    expect(t.peak).toEqual({ weekEnding: '2025-03-08', text: '$10,000' })
    expect(t.trough).toEqual({ weekEnding: '2025-03-01', text: '$5,000' })
    expect(t.series.map((p) => p.idx)).toEqual([50, 100, 75])
    expect(t.highlights[0].label).toBe('Average weekly sales')
  })
})

describe('nextWithOchi', () => {
  it('frames the forward value using the swing-week count + metric', () => {
    const t = computeTeaser(parseLodgingCsv(CSV))!
    const next = nextWithOchi(t)
    expect(next).toHaveLength(3)
    expect(next[0]).toContain('2 swing weeks')
    expect(next[1]).toContain('occupancy')
  })
})
