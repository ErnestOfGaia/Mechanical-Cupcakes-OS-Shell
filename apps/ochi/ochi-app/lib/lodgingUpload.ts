// ─── Client-side lodging upload ───────────────────────────────────────────────
// A lead's weekly lodging CSV is parsed and analyzed ENTIRELY in the browser — it
// is never uploaded anywhere. These functions are pure (string in → data out) so
// they're testable and so the privacy promise ("your data stays yours") is literal.

export interface WeekRow {
  weekEnding: string   // ISO-ish date string as provided
  occupancyPct: number // 0–100
  revenue?: number     // optional, $ for the week
}

export interface ParsedLodging {
  weeks: WeekRow[]
  warnings: string[]
}

// The format we ask leads to provide. Kept deliberately small.
export const LODGING_TEMPLATE_HEADERS = ['week_ending', 'occupancy_pct', 'revenue'] as const

export const LODGING_TEMPLATE_CSV =
  'week_ending,occupancy_pct,revenue\n' +
  '2025-06-07,68,14200\n' +
  '2025-06-14,74,16850\n' +
  '2025-06-21,81,19300\n'

const HEADER_ALIASES: Record<string, 'weekEnding' | 'occupancyPct' | 'revenue'> = {
  week_ending: 'weekEnding', week: 'weekEnding', date: 'weekEnding', week_end: 'weekEnding',
  occupancy_pct: 'occupancyPct', occupancy: 'occupancyPct', occ: 'occupancyPct', occupancy_percent: 'occupancyPct',
  revenue: 'revenue', rev: 'revenue', sales: 'revenue',
}

function splitCsvLine(line: string): string[] {
  return line.split(',').map((c) => c.trim())
}

// Parse a CSV string into validated weekly rows. Lenient about header naming and
// blank lines; collects human-readable warnings instead of throwing.
export function parseLodgingCsv(text: string): ParsedLodging {
  const warnings: string[] = []
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  if (lines.length < 2) {
    return { weeks: [], warnings: ['The file looks empty — expected a header row plus at least one week.'] }
  }

  const header = splitCsvLine(lines[0]).map((h) => h.toLowerCase())
  const col: Partial<Record<'weekEnding' | 'occupancyPct' | 'revenue', number>> = {}
  header.forEach((h, i) => {
    const key = HEADER_ALIASES[h]
    if (key && col[key] === undefined) col[key] = i
  })

  if (col.weekEnding === undefined || col.occupancyPct === undefined) {
    return {
      weeks: [],
      warnings: ['Missing required columns. Expected at least "week_ending" and "occupancy_pct".'],
    }
  }

  const weeks: WeekRow[] = []
  for (let r = 1; r < lines.length; r++) {
    const cells = splitCsvLine(lines[r])
    const weekEnding = cells[col.weekEnding]
    const occRaw = cells[col.occupancyPct]
    const occ = Number(String(occRaw).replace('%', ''))
    if (!weekEnding || Number.isNaN(occ)) {
      warnings.push(`Skipped row ${r + 1}: couldn't read a week date + occupancy.`)
      continue
    }
    const row: WeekRow = { weekEnding, occupancyPct: Math.max(0, Math.min(100, occ)) }
    if (col.revenue !== undefined) {
      const rev = Number(String(cells[col.revenue] ?? '').replace(/[$,]/g, ''))
      if (!Number.isNaN(rev) && cells[col.revenue]) row.revenue = rev
    }
    weeks.push(row)
  }

  if (weeks.length === 0) warnings.push('No readable weekly rows were found.')
  return { weeks, warnings }
}

// ─── Teaser ───────────────────────────────────────────────────────────────────
// A FEW honest, computed-from-their-data highlights — enough to spark curiosity,
// not the full analysis. The deeper insights are intentionally withheld (locked)
// to drive the booking.

export interface TeaserHighlight {
  label: string
  value: string
  sub: string
}

export interface Teaser {
  weeksCount: number
  rangeStart: string
  rangeEnd: string
  avgOccupancy: number
  peak: { weekEnding: string; occupancyPct: number }
  trough: { weekEnding: string; occupancyPct: number }
  swingWeeks: number   // shoulder-season weeks that look like staffing mismatches
  highlights: TeaserHighlight[]
}

const round = (n: number) => Math.round(n)

export function computeTeaser(parsed: ParsedLodging): Teaser | null {
  const weeks = parsed.weeks
  if (weeks.length === 0) return null

  const occs = weeks.map((w) => w.occupancyPct)
  const avg = occs.reduce((a, b) => a + b, 0) / weeks.length
  let peak = weeks[0]
  let trough = weeks[0]
  for (const w of weeks) {
    if (w.occupancyPct > peak.occupancyPct) peak = w
    if (w.occupancyPct < trough.occupancyPct) trough = w
  }

  // "Swing weeks": mid-band occupancy (40–70%) — the ambiguous shoulder weeks where
  // the staffing call is genuinely hard and OCHI earns its keep. Counted, not listed.
  const swingWeeks = weeks.filter((w) => w.occupancyPct >= 40 && w.occupancyPct <= 70).length

  const highlights: TeaserHighlight[] = [
    { label: 'Weeks analyzed', value: String(weeks.length), sub: `${weeks[0].weekEnding} → ${weeks[weeks.length - 1].weekEnding}` },
    { label: 'Average occupancy', value: `${round(avg)}%`, sub: 'across the period you provided' },
    { label: 'Your busiest week', value: `${round(peak.occupancyPct)}%`, sub: peak.weekEnding },
    { label: 'Your quietest week', value: `${round(trough.occupancyPct)}%`, sub: trough.weekEnding },
  ]

  return {
    weeksCount: weeks.length,
    rangeStart: weeks[0].weekEnding,
    rangeEnd: weeks[weeks.length - 1].weekEnding,
    avgOccupancy: round(avg),
    peak: { weekEnding: peak.weekEnding, occupancyPct: round(peak.occupancyPct) },
    trough: { weekEnding: trough.weekEnding, occupancyPct: round(trough.occupancyPct) },
    swingWeeks,
    highlights,
  }
}

// The insights we intentionally WITHHOLD on the teaser — the curiosity hooks that
// a 20-minute review unlocks. Computed counts are teased; the specifics are not.
export function lockedTeasers(teaser: Teaser): string[] {
  return [
    `The ${teaser.swingWeeks} shoulder-season weeks where your staffing call was hardest — and which way OCHI would have leaned`,
    'Your OCHI-tuned Multiplier weights — calibrated to your actual numbers, not the public baseline',
    'A 4-week staffing outlook built from live highway, weather, and search signals',
  ]
}

// localStorage/sessionStorage key for handing the teaser from the upload page to
// the results page without putting any data in the URL.
export const TEASER_STORAGE_KEY = 'ochi.lead.teaser'
