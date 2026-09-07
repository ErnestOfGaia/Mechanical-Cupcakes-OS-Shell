import { Pool, types } from 'pg'

// ─── The one Postgres connection ──────────────────────────────────────────────
// Reads reach Postgres through here and nowhere else; WRITES reach it only via
// app/api/observations (decision D4, 2026-09-07 — the database publishes no host
// port and no other process talks to it directly).
//
// Host defaults to the production container name on the shared nginx-proxy
// network. A local run points elsewhere with OCHI_PG_HOST / OCHI_PG_PORT — e.g.
// the docker-compose.local.yml stack is 127.0.0.1:5433 with password `localdev`.
//
// Timeouts are short on purpose: the dashboard renders "unavailable" when the
// read fails, and a hung connection would turn that honest state into a hung page.

// DATE (oid 1082) arrives as the literal 'YYYY-MM-DD' rather than a JS Date in
// the server's local zone — a Monday must stay a Monday regardless of TZ.
types.setTypeParser(1082, (v: string) => v)

const globalForPool = globalThis as unknown as { __ochiPool?: Pool }

export function getPool(): Pool {
  if (!globalForPool.__ochiPool) {
    globalForPool.__ochiPool = new Pool({
      host: process.env.OCHI_PG_HOST || 'ochi-postgres',
      port: Number(process.env.OCHI_PG_PORT || 5432),
      database: process.env.OCHI_PG_DB || 'ochi',
      user: process.env.OCHI_PG_USER || 'ochi',
      password: process.env.OCHI_PG_PASSWORD,
      max: 3,
      connectionTimeoutMillis: 3000,
      idleTimeoutMillis: 30000,
      query_timeout: 5000,
    })
    // A lost idle client emits 'error' on the pool; unhandled, that crashes the
    // process. Log it and let the next query fail into the unavailable state.
    globalForPool.__ochiPool.on('error', (err) => {
      console.error('[ochi/db] idle client error:', err.message)
    })
  }
  return globalForPool.__ochiPool
}

// Test/dev helper: drop the cached pool so a changed OCHI_PG_* takes effect.
export async function resetPoolForTests(): Promise<void> {
  const p = globalForPool.__ochiPool
  globalForPool.__ochiPool = undefined
  if (p) await p.end().catch(() => undefined)
}
