import type { Pool } from 'pg'

// ─── Observations: the tenant-shaped ingest contract ──────────────────────────
// One weekly row of gatekeeper readings. This module is the shape that
// app/api/observations accepts and that lib/currentConditions reads back. It is
// deliberately generic: a column list, enum lists, a Monday rule, an upsert and a
// latest-row read. OCMS (tenant #2) and the future Oregon Data API copy this file
// and change the column list — nothing here knows about Pacific City.
//
// Rules that live here, in English, so the endpoint can say them before the
// database does:
//   · week_start_date is the MONDAY of the week (ISO week). The DB enforces it
//     with CHECK (EXTRACT(ISODOW ...) = 1); the endpoint answers 400 first.
//   · Enums are closed lists; anything else is 422.
//   · A POST MERGES into the stored row: a field that is absent or null keeps
//     whatever the row already holds. The Thursday routine writes this week's
//     predictors on one call and last week's observed_volume on another, and
//     the second call must not blank the first.
//   · hwy6_status is required by the DB for a NEW row (NOT NULL); a merge into an
//     existing row may omit it.

export const OBSERVATIONS_TABLE = 'gatekeeper_observations'

export const HWY6_STATUSES = ['OPEN', 'ADVISORY', 'RESTRICTED'] as const
export const LODGING_SOURCES = ['tlt', 'client'] as const
export const OBSERVED_VOLUMES = ['HIGH', 'MODERATE', 'LOW'] as const

export type Hwy6StatusValue = (typeof HWY6_STATUSES)[number]
export type LodgingSourceValue = (typeof LODGING_SOURCES)[number]
export type ObservedVolumeValue = (typeof OBSERVED_VOLUMES)[number]

// What a caller may POST. Every field except the key is optional (merge semantics).
export interface ObservationInput {
  week_start_date: string            // 'YYYY-MM-DD', a Monday
  hwy6_status?: Hwy6StatusValue | null
  gas_price_aaa?: number | null      // $/gal, AAA Oregon state average
  gas_price_eia?: number | null      // $/gal, EIA West Coast (PADD 5) weekly
  search_interest?: number | null    // Google Trends index 0–100
  lodging_value?: number | null
  lodging_source?: LodgingSourceValue | null
  observed_volume?: ObservedVolumeValue | null
  notes?: string | null
}

// What the table hands back. NUMERIC columns arrive from pg as strings; the read
// helpers below convert them so callers see numbers or null, never '4.30'.
export interface ObservationRow {
  week_start_date: string
  hwy6_status: Hwy6StatusValue
  gas_price_aaa: number | null
  gas_price_eia: number | null
  search_interest: number | null
  lodging_value: number | null
  lodging_source: LodgingSourceValue
  observed_volume: ObservedVolumeValue | null
  notes: string | null
  updated_at: string                 // ISO 8601, from TIMESTAMPTZ
}

export type ValidationResult =
  | { ok: true; row: ObservationInput }
  | { ok: false; status: 400 | 422; error: string }

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

// Parses 'YYYY-MM-DD' as a UTC calendar date. Never `new Date(str)` alone: on a
// server west of UTC that lands the evening before and Monday becomes Sunday.
export function parseIsoDate(iso: string): Date | null {
  if (!ISO_DATE.test(iso)) return null
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  // Reject 2026-02-31 and friends: Date.UTC rolls them over silently.
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null
  return date
}

export function isMonday(iso: string): boolean {
  const d = parseIsoDate(iso)
  return d !== null && d.getUTCDay() === 1
}

// Storage is Monday-anchored; the dashboard faces the weekend. Saturday is
// Monday + 5, Sunday is Monday + 6. "Weekend of Sep 12–13"; across a month
// boundary, "Weekend of Oct 31 – Nov 1".
export function weekendLabel(weekStartIso: string): string {
  const monday = parseIsoDate(weekStartIso)
  if (!monday) return 'Weekend of —'
  const sat = new Date(monday.getTime() + 5 * 86400000)
  const sun = new Date(monday.getTime() + 6 * 86400000)
  const month = (d: Date) => d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })
  if (sat.getUTCMonth() === sun.getUTCMonth()) {
    return `Weekend of ${month(sat)} ${sat.getUTCDate()}–${sun.getUTCDate()}`
  }
  return `Weekend of ${month(sat)} ${sat.getUTCDate()} – ${month(sun)} ${sun.getUTCDate()}`
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function optionalNumber(
  body: Record<string, unknown>, key: string, range?: [number, number],
): { ok: true; value: number | null } | { ok: false; error: string } {
  const v = body[key]
  if (v === undefined || v === null) return { ok: true, value: null }
  if (typeof v !== 'number' || !Number.isFinite(v)) return { ok: false, error: `${key} must be a number` }
  if (range && (v < range[0] || v > range[1])) return { ok: false, error: `${key} must be between ${range[0]} and ${range[1]}` }
  return { ok: true, value: v }
}

function optionalEnum<T extends readonly string[]>(
  body: Record<string, unknown>, key: string, allowed: T,
): { ok: true; value: T[number] | null } | { ok: false; error: string } {
  const v = body[key]
  if (v === undefined || v === null) return { ok: true, value: null }
  if (typeof v !== 'string' || !allowed.includes(v)) {
    return { ok: false, error: `${key} must be one of ${allowed.join(', ')}` }
  }
  return { ok: true, value: v }
}

// 400 = the request is malformed (not an object, no/invalid date, not a Monday).
// 422 = well-formed but a value is outside its closed list or range.
export function validateObservation(body: unknown): ValidationResult {
  if (!isRecord(body)) return { ok: false, status: 400, error: 'body must be a JSON object' }

  const wsd = body.week_start_date
  if (typeof wsd !== 'string' || !parseIsoDate(wsd)) {
    return { ok: false, status: 400, error: 'week_start_date must be a calendar date, YYYY-MM-DD' }
  }
  if (!isMonday(wsd)) {
    return {
      ok: false, status: 400,
      error: `week_start_date must be a Monday (the ISO week start); ${wsd} is not. If you have a week-ENDING date, subtract 6 days.`,
    }
  }

  const hwy6 = optionalEnum(body, 'hwy6_status', HWY6_STATUSES)
  if (!hwy6.ok) return { ok: false, status: 422, error: hwy6.error }
  const aaa = optionalNumber(body, 'gas_price_aaa', [0, 20])
  if (!aaa.ok) return { ok: false, status: 422, error: aaa.error }
  const eia = optionalNumber(body, 'gas_price_eia', [0, 20])
  if (!eia.ok) return { ok: false, status: 422, error: eia.error }
  const search = optionalNumber(body, 'search_interest', [0, 100])
  if (!search.ok) return { ok: false, status: 422, error: search.error }
  if (search.value !== null && !Number.isInteger(search.value)) {
    return { ok: false, status: 422, error: 'search_interest must be an integer' }
  }
  const lodging = optionalNumber(body, 'lodging_value', [0, Number.MAX_SAFE_INTEGER])
  if (!lodging.ok) return { ok: false, status: 422, error: lodging.error }
  const source = optionalEnum(body, 'lodging_source', LODGING_SOURCES)
  if (!source.ok) return { ok: false, status: 422, error: source.error }
  const volume = optionalEnum(body, 'observed_volume', OBSERVED_VOLUMES)
  if (!volume.ok) return { ok: false, status: 422, error: volume.error }
  const notes = body.notes
  if (notes !== undefined && notes !== null && typeof notes !== 'string') {
    return { ok: false, status: 422, error: 'notes must be a string' }
  }

  return {
    ok: true,
    row: {
      week_start_date: wsd,
      hwy6_status: hwy6.value,
      gas_price_aaa: aaa.value,
      gas_price_eia: eia.value,
      search_interest: search.value,
      lodging_value: lodging.value,
      lodging_source: source.value,
      observed_volume: volume.value,
      notes: typeof notes === 'string' ? notes : null,
    },
  }
}

const NUMERIC_COLUMNS = ['gas_price_aaa', 'gas_price_eia', 'lodging_value'] as const

function toRow(raw: Record<string, unknown>): ObservationRow {
  const row = { ...raw } as Record<string, unknown>
  for (const c of NUMERIC_COLUMNS) {
    const v = row[c]
    row[c] = v === null || v === undefined ? null : Number(v)
  }
  const ts = row.updated_at
  row.updated_at = ts instanceof Date ? ts.toISOString() : String(ts)
  return row as unknown as ObservationRow
}

// Merge-upsert. COALESCE(EXCLUDED.x, t.x): a null in the POST keeps the stored
// value. updated_at is stamped on every write — that is the "as of" the dashboard
// shows, so it must move whenever the row does.
export async function upsertObservation(pool: Pool, row: ObservationInput): Promise<ObservationRow> {
  const sql = `
    INSERT INTO ${OBSERVATIONS_TABLE} AS t
      (week_start_date, hwy6_status, gas_price_aaa, gas_price_eia, search_interest,
       lodging_value, lodging_source, observed_volume, notes, updated_at)
    VALUES ($1,
            -- NOT NULL is checked on the proposed row BEFORE ON CONFLICT runs, so a
            -- merge that omits hwy6_status must borrow the stored value here; a NEW
            -- week with no hwy6_status still fails NOT NULL, which is the point.
            COALESCE($2, (SELECT hwy6_status FROM ${OBSERVATIONS_TABLE} WHERE week_start_date = $1)),
            $3, $4, $5, $6, COALESCE($7, 'tlt'), $8, $9, now())
    ON CONFLICT (week_start_date) DO UPDATE SET
      hwy6_status     = COALESCE(EXCLUDED.hwy6_status,     t.hwy6_status),
      gas_price_aaa   = COALESCE(EXCLUDED.gas_price_aaa,   t.gas_price_aaa),
      gas_price_eia   = COALESCE(EXCLUDED.gas_price_eia,   t.gas_price_eia),
      search_interest = COALESCE(EXCLUDED.search_interest, t.search_interest),
      lodging_value   = COALESCE(EXCLUDED.lodging_value,   t.lodging_value),
      lodging_source  = COALESCE($7,                       t.lodging_source),
      observed_volume = COALESCE(EXCLUDED.observed_volume, t.observed_volume),
      notes           = COALESCE(EXCLUDED.notes,           t.notes),
      updated_at      = now()
    RETURNING *`
  const res = await pool.query(sql, [
    row.week_start_date,
    row.hwy6_status ?? null,
    row.gas_price_aaa ?? null,
    row.gas_price_eia ?? null,
    row.search_interest ?? null,
    row.lodging_value ?? null,
    row.lodging_source ?? null,
    row.observed_volume ?? null,
    row.notes ?? null,
  ])
  return toRow(res.rows[0])
}

// The dashboard's read: the most recent week on record, plus the historical
// lodging max the formula normalises against (MAX over every row, this one
// included — so the first week ever recorded normalises to 1.0 by definition).
export async function readLatestObservation(
  pool: Pool,
): Promise<{ row: ObservationRow; lodgingMax: number | null } | null> {
  const res = await pool.query(
    `SELECT t.*, (SELECT MAX(lodging_value) FROM ${OBSERVATIONS_TABLE}) AS lodging_max
       FROM ${OBSERVATIONS_TABLE} t
      ORDER BY week_start_date DESC
      LIMIT 1`,
  )
  if (res.rowCount === 0) return null
  const { lodging_max, ...rest } = res.rows[0] as Record<string, unknown>
  return {
    row: toRow(rest),
    lodgingMax: lodging_max === null || lodging_max === undefined ? null : Number(lodging_max),
  }
}

// Postgres error codes the endpoint translates into English.
export const PG_NOT_NULL_VIOLATION = '23502'
export const PG_CHECK_VIOLATION = '23514'
