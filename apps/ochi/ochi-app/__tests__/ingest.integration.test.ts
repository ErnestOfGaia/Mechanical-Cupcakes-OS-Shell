import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { POST } from '../app/api/observations/route'
import { getCurrentInputs } from '../lib/currentConditions'
import { buildDashboardView } from '../lib/dashboardView'
import { getPool, resetPoolForTests } from '../lib/db'
import type { WeatherReading } from '../lib/types'

// ─── Integration: the endpoint and the read against a REAL Postgres ───────────
// Runs only when OCHI_PG_INTEGRATION=1 and the docker-compose.local.yml stack is
// up (127.0.0.1:5433, password localdev). Otherwise every test here is skipped —
// CI has no database and must not pretend to.
//
// This is handoff V2 + V3, executed without a dev server:
//   V3  wrong secret → 401 · Sunday → 400 · bad enum → 422 · Monday → 200,
//       and the read sees the row on the next call
//   V2  the database is unreachable → the read is UNAVAILABLE, never the mock;
//       reachable again → it recovers. (Simulated by pointing at a dead port,
//       not by stopping the container — the live-stack version is Ernest's V2.)

const RUN = process.env.OCHI_PG_INTEGRATION === '1'
const SECRET = 'integration-secret'
const CLEAR: WeatherReading = { condition: 'clear', tempF: 68, summary: 'Sunny' }

const env = (o: Record<string, string>) => { for (const [k, v] of Object.entries(o)) process.env[k] = v }

function post(body: unknown, secret: string | null = SECRET) {
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  if (secret !== null) headers['x-ingest-secret'] = secret
  return POST(new Request('http://ochi.test/api/observations', {
    method: 'POST', headers, body: typeof body === 'string' ? body : JSON.stringify(body),
  }))
}

describe.skipIf(!RUN)('ingest + read against local Postgres', () => {
  beforeAll(async () => {
    env({ OCHI_PG_HOST: '127.0.0.1', OCHI_PG_PORT: '5433', OCHI_PG_PASSWORD: 'localdev', OCHI_INGEST_SECRET: SECRET })
    await resetPoolForTests()
    await getPool().query('DELETE FROM gatekeeper_observations')
  })
  afterAll(async () => {
    env({ OCHI_PG_HOST: '127.0.0.1', OCHI_PG_PORT: '5433', OCHI_PG_PASSWORD: 'localdev' })
    await resetPoolForTests()
    await getPool().query('DELETE FROM gatekeeper_observations')
    await resetPoolForTests()
  })

  it('V3a: wrong secret → 401, missing secret → 401', async () => {
    expect((await post({ week_start_date: '2026-09-07', hwy6_status: 'OPEN' }, 'nope')).status).toBe(401)
    expect((await post({ week_start_date: '2026-09-07', hwy6_status: 'OPEN' }, null)).status).toBe(401)
  })

  it('V3b: a Sunday → 400 with the word Monday in the reason', async () => {
    const res = await post({ week_start_date: '2026-09-06', hwy6_status: 'OPEN' })
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/Monday/)
  })

  it('V3c: a bad enum → 422; a new week without hwy6_status → 422', async () => {
    expect((await post({ week_start_date: '2026-09-07', hwy6_status: 'CLOSED' })).status).toBe(422)
    const r = await post({ week_start_date: '2026-09-07', gas_price_eia: 4.1 })
    expect(r.status).toBe(422)
    expect((await r.json()).error).toMatch(/hwy6_status is required/)
  })

  it('V3d: a valid Monday → 200, and the dashboard reads it on the next request', async () => {
    const res = await post({
      week_start_date: '2026-09-07', hwy6_status: 'OPEN', gas_price_eia: 4.1,
      search_interest: 55, lodging_value: 80, notes: 'first real row',
    })
    expect(res.status).toBe(200)
    const { row } = await res.json()
    expect(row.week_start_date).toBe('2026-09-07')     // stayed a Monday through pg's DATE parser
    expect(row.gas_price_eia).toBe(4.1)                 // NUMERIC came back as a number
    expect(typeof row.updated_at).toBe('string')

    const read = await getCurrentInputs()
    expect(read.state).toBe('live')
    if (read.state !== 'live') return
    expect(read.observation.weekendLabel).toBe('Weekend of Sep 12–13')
    expect(read.missing).toEqual([])
    expect(read.inputs?.lodgingMax).toBe(80)             // first week normalises to itself

    const view = await buildDashboardView(undefined, read, CLEAR)
    expect(view.dataState).toBe('live')
    expect(view.hero?.score).toBeGreaterThan(0)
    expect(view.gatekeepers.find((g) => g.id === 'gas')?.value).toBe('$4.10')
  })

  it('merge: a second POST for the same week keeps fields it does not mention', async () => {
    const res = await post({ week_start_date: '2026-09-07', observed_volume: 'MODERATE' })
    expect(res.status).toBe(200)
    const { row } = await res.json()
    expect(row.observed_volume).toBe('MODERATE')
    expect(row.gas_price_eia).toBe(4.1)
    expect(row.search_interest).toBe(55)
  })

  it('V2: database unreachable → UNAVAILABLE (not the mock); reachable → recovers', async () => {
    env({ OCHI_PG_PORT: '1' })
    await resetPoolForTests()
    const down = await getCurrentInputs()
    expect(down.state).toBe('unavailable')
    const view = await buildDashboardView(undefined, down, CLEAR)
    expect(view.hero).toBeNull()
    for (const g of view.gatekeepers) expect(g.value).toBe('Unavailable')

    env({ OCHI_PG_PORT: '5433' })
    await resetPoolForTests()
    const up = await getCurrentInputs()
    expect(up.state).toBe('live')
  })

  it('503 when the server has no OCHI_INGEST_SECRET — refuses, never falls open', async () => {
    const saved = process.env.OCHI_INGEST_SECRET
    delete process.env.OCHI_INGEST_SECRET
    try {
      expect((await post({ week_start_date: '2026-09-07', hwy6_status: 'OPEN' }, '')).status).toBe(503)
    } finally {
      process.env.OCHI_INGEST_SECRET = saved
    }
  })
})
