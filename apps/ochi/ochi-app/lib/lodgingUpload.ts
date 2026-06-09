// ─── Client-side history upload (occupancy OR sales) ───────────────────────────
// OCHI serves two kinds of business, each tracking a different signal:
//   • rental / lodging properties → OCCUPANCY RATE, by season
//   • restaurants                 → weekly SALES, year over year
// A lead's weekly history is parsed and analyzed ENTIRELY in the browser — never
// uploaded. These functions are pure (string in → data out) so they're testable
// and the privacy promise ("your data stays yours") is literal.

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

export interface WeekRow {
  weekEnding: string
  occupancyPct?: number  // 0–100 — rental/lodging properties track this by season
  sales?: number         // weekly sales $ — restaurants track this year over year
}

export interface ParsedLodging {
  weeks: WeekRow[]
  warnings: string[]
}

// The format we ask leads to provide. Give occupancy, sales, or both.
export const LODGING_TEMPLATE_CSV =
  'week_ending,occupancy_pct,sales\n' +
  '2025-06-07,68,14200\n' +
  '2025-06-14,74,16850\n' +
  '2025-06-21,81,19300\n'

const HEADER_ALIASES: Record<string, 'weekEnding' | 'occupancyPct' | 'sales'> = {
  week_ending: 'weekEnding', week: 'weekEnding', date: 'weekEnding', week_end: 'weekEnding',
  occupancy_pct: 'occupancyPct', occupancy: 'occupancyPct', occ: 'occupancyPct',
  occupancy_percent: 'occupancyPct', occupancy_rate: 'occupancyPct',
  sales: 'sales', revenue: 'sales', rev: 'sales', weekly_sales: 'sales',
}

// Quote-aware split so values like "$12,400" (a single quoted field with a comma)
// from real sales exports parse as one cell, not two.
function splitCsvLine(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i++ }  // escaped quote
      else inQuotes = !inQuotes
    } else if (c === ',' && !inQuotes) {
      out.push(cur.trim()); cur = ''
    } else {
      cur += c
    }
  }
  out.push(cur.trim())
  return out
}

const num = (raw: string | undefined): number =>
  Number(String(raw ?? '').replace(/[$,%\s]/g, ''))

// Parse a CSV into validated weekly rows. Needs week_ending + at least one of
// occupancy_pct / sales. Lenient about header naming; collects warnings.
export function parseLodgingCsv(text: string): ParsedLodging {
  const warnings: string[] = []
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  if (lines.length < 2) {
    return { weeks: [], warnings: ['The file looks empty — expected a header row plus at least one week.'] }
  }

  const header = splitCsvLine(lines[0]).map((h) => h.toLowerCase())
  const col: Partial<Record<'weekEnding' | 'occupancyPct' | 'sales', number>> = {}
  header.forEach((h, i) => {
    const key = HEADER_ALIASES[h]
    if (key && col[key] === undefined) col[key] = i
  })

  if (col.weekEnding === undefined || (col.occupancyPct === undefined && col.sales === undefined)) {
    return {
      weeks: [],
      warnings: ['Missing columns. Expected "week_ending" plus at least one of "occupancy_pct" or "sales".'],
    }
  }

  const weeks: WeekRow[] = []
  for (let r = 1; r < lines.length; r++) {
    const cells = splitCsvLine(lines[r])
    const weekEnding = col.weekEnding !== undefined ? cells[col.weekEnding] : ''
    if (!weekEnding) { warnings.push(`Skipped row ${r + 1}: no week date.`); continue }

    const row: WeekRow = { weekEnding }
    if (col.occupancyPct !== undefined && cells[col.occupancyPct]) {
      const o = num(cells[col.occupancyPct])
      if (!Number.isNaN(o)) row.occupancyPct = clamp(o, 0, 100)
    }
    if (col.sales !== undefined && cells[col.sales]) {
      const s = num(cells[col.sales])
      if (!Number.isNaN(s)) row.sales = s
    }
    if (row.occupancyPct === undefined && row.sales === undefined) {
      warnings.push(`Skipped row ${r + 1}: no occupancy or sales value.`)
      continue
    }
    weeks.push(row)
  }

  if (weeks.length === 0) warnings.push('No readable weekly rows were found.')
  return { weeks, warnings }
}

// ─── Teaser ───────────────────────────────────────────────────────────────────
// A FEW honest, computed-from-their-data highlights — enough to spark curiosity.
// Metric-aware: occupancy is read as a 0–100 rate; sales is indexed 0–100 against
// the business's own peak, so the same "demand shape" logic works for both.

export type Metric = 'occupancy' | 'sales'

export interface SeriesPoint {
  label: string   // weekEnding
  idx: number     // 0–100 demand index (occupancy as-is; sales vs the period peak)
}

export interface TeaserHighlight {
  label: string
  value: string
  sub: string
}

export interface Teaser {
  metric: Metric
  metricNoun: string      // "occupancy" | "weekly sales"
  weeksCount: number
  rangeStart: string
  rangeEnd: string
  avgText: string         // "73%" | "$18,400"
  avgIndex: number        // 0–100, for the scale + band
  peak: { weekEnding: string; text: string }
  trough: { weekEnding: string; text: string }
  swingWeeks: number      // mid-band (40–70 index) — ambiguous shoulder weeks
  peakStretch: number     // index ≥ 80 — busy season
  softStretch: number     // index ≤ 50 — quiet season
  series: SeriesPoint[]
  highlights: TeaserHighlight[]
}

function fmt(metric: Metric, v: number): string {
  return metric === 'occupancy'
    ? `${Math.round(v)}%`
    : `$${Math.round(v).toLocaleString('en-US')}`
}

export function computeTeaser(parsed: ParsedLodging): Teaser | null {
  const weeks = parsed.weeks
  if (weeks.length === 0) return null

  // Primary metric = whichever signal the business actually tracks (more rows).
  const occCount = weeks.filter((w) => w.occupancyPct !== undefined).length
  const salesCount = weeks.filter((w) => w.sales !== undefined).length
  const metric: Metric = occCount >= salesCount ? 'occupancy' : 'sales'
  const valOf = (w: WeekRow) => (metric === 'occupancy' ? w.occupancyPct ?? 0 : w.sales ?? 0)

  const vals = weeks.map(valOf)
  const max = Math.max(...vals, 1)
  const idxOf = (v: number) => Math.round(metric === 'occupancy' ? clamp(v, 0, 100) : clamp((v / max) * 100, 0, 100))
  const avg = vals.reduce((a, b) => a + b, 0) / weeks.length
  const avgIndex = idxOf(avg)

  let peakW = weeks[0]
  let troughW = weeks[0]
  for (const w of weeks) {
    if (valOf(w) > valOf(peakW)) peakW = w
    if (valOf(w) < valOf(troughW)) troughW = w
  }

  const series: SeriesPoint[] = weeks.map((w) => ({ label: w.weekEnding, idx: idxOf(valOf(w)) }))
  const swingWeeks = series.filter((p) => p.idx >= 40 && p.idx <= 70).length
  const peakStretch = series.filter((p) => p.idx >= 80).length
  const softStretch = series.filter((p) => p.idx <= 50).length

  const metricNoun = metric === 'occupancy' ? 'occupancy' : 'weekly sales'
  const avgLabel = metric === 'occupancy' ? 'Average occupancy' : 'Average weekly sales'

  const highlights: TeaserHighlight[] = [
    { label: avgLabel, value: fmt(metric, avg), sub: 'across the weeks you gave us' },
    { label: 'Swing weeks', value: String(swingWeeks), sub: "ambiguous shoulder weeks — where OCHI earns its keep" },
    { label: 'Busiest week', value: fmt(metric, valOf(peakW)), sub: peakW.weekEnding },
    { label: 'Quietest week', value: fmt(metric, valOf(troughW)), sub: troughW.weekEnding },
  ]

  return {
    metric,
    metricNoun,
    weeksCount: weeks.length,
    rangeStart: weeks[0].weekEnding,
    rangeEnd: weeks[weeks.length - 1].weekEnding,
    avgText: fmt(metric, avg),
    avgIndex,
    peak: { weekEnding: peakW.weekEnding, text: fmt(metric, valOf(peakW)) },
    trough: { weekEnding: troughW.weekEnding, text: fmt(metric, valOf(troughW)) },
    swingWeeks,
    peakStretch,
    softStretch,
    series,
    highlights,
  }
}

// What OCHI adds NEXT — framed as the forward value, not a paywall. We show the
// read openly above; this is the "and here's where it goes" that earns the call.
export function nextWithOchi(teaser: Teaser): string[] {
  return [
    `A live read on each of your ${teaser.swingWeeks} swing weeks — which way to lean, before the week starts`,
    `A Master Multiplier tuned to your actual ${teaser.metricNoun}, not the public baseline`,
    'A rolling 4-week staffing outlook from live highway, weather & search signals',
  ]
}

// sessionStorage key for handing the teaser from the upload page to the results
// page without putting any data in the URL.
export const TEASER_STORAGE_KEY = 'ochi.lead.teaser'
