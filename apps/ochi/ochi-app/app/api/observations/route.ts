// ─── POST /api/observations — the ONE write path into OCHI's data ─────────────
// Decision D4 (Ernest, 2026-09-07): writes go through the app, never to the
// database directly. Postgres publishes no host port. Anything that wants to
// record a week — the Thursday routine, Ernest at a terminal, a future OCMS
// twin — POSTs here with a shared secret.
//
// Contract (lib/observations.ts is the shape; this file is the door):
//   header  x-ingest-secret: <OCHI_INGEST_SECRET>
//   body    JSON, the gatekeeper_observations columns; week_start_date required
//   200     the stored row (after merge), as JSON
//   400     malformed: not JSON, not an object, no/invalid date, NOT A MONDAY
//   401     missing or wrong secret
//   422     a value outside its closed list or range; or a new week without hwy6_status
//   503     OCHI_INGEST_SECRET is not configured on the server — refuse honestly,
//           never fall open (the booking route's precedent)
//   502     the database refused or could not be reached
//
// Merge semantics: absent/null fields keep their stored value (see observations.ts).
//
// ⚠️ OCHI_INGEST_SECRET is a NEW env var. It must exist in the VPS root .env
// BEFORE the image that reads it deploys (repo AGENTS.md deploy caution).

import { createHash, timingSafeEqual } from 'node:crypto'
import { getPool } from '../../../lib/db'
import {
  validateObservation,
  upsertObservation,
  PG_NOT_NULL_VIOLATION,
  PG_CHECK_VIOLATION,
} from '../../../lib/observations'

// Every request must hit the live handler and read env at request time — a
// prerendered answer here would be a cached refusal (or worse, a cached success).
export const dynamic = 'force-dynamic'

const SECRET_HEADER = 'x-ingest-secret'

// Constant-time compare on fixed-length digests, so length and content leak nothing.
function secretMatches(presented: string | null, expected: string): boolean {
  if (!presented) return false
  const a = createHash('sha256').update(presented).digest()
  const b = createHash('sha256').update(expected).digest()
  return timingSafeEqual(a, b)
}

export async function POST(req: Request) {
  // Read at request time, not module load (trap T5: config changes under comments).
  const expected = process.env.OCHI_INGEST_SECRET
  if (!expected) {
    console.warn('[api/observations] OCHI_INGEST_SECRET unset — refusing')
    return Response.json(
      { ok: false, error: 'ingest is not configured on this server (OCHI_INGEST_SECRET unset)' },
      { status: 503 },
    )
  }

  if (!secretMatches(req.headers.get(SECRET_HEADER), expected)) {
    return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ ok: false, error: 'body must be JSON' }, { status: 400 })
  }

  const v = validateObservation(body)
  if (!v.ok) return Response.json({ ok: false, error: v.error }, { status: v.status })

  try {
    const row = await upsertObservation(getPool(), v.row)
    console.info(`[api/observations] upserted week ${row.week_start_date}`)
    return Response.json({ ok: true, row })
  } catch (err) {
    const code = (err as { code?: string })?.code
    const message = err instanceof Error ? err.message : String(err)
    if (code === PG_NOT_NULL_VIOLATION) {
      return Response.json(
        { ok: false, error: 'hwy6_status is required when recording a week for the first time' },
        { status: 422 },
      )
    }
    if (code === PG_CHECK_VIOLATION) {
      // The endpoint already said it in English; if the DB still refuses, say that too.
      return Response.json({ ok: false, error: `the database refused the row: ${message}` }, { status: 422 })
    }
    console.error('[api/observations] write failed:', message)
    return Response.json({ ok: false, error: 'the database could not be written' }, { status: 502 })
  }
}
