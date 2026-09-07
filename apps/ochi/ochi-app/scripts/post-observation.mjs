#!/usr/bin/env node
// ─── post-observation.mjs — the routine's only way to write ───────────────────
// Sends one weekly row to POST /api/observations. This is the WHOLE write path
// for the Thursday routine (decision D4/D5, 2026-09-07): it never touches
// Postgres, and it never invents a value — every field it sends was either
// returned by an API or typed by Ernest. It refuses to send a row it did not
// get, and it prints exactly what the server said.
//
// Usage:
//   OCHI_INGEST_SECRET=… node scripts/post-observation.mjs row.json
//   OCHI_INGEST_SECRET=… node scripts/post-observation.mjs --week 2026-09-07 --hwy6 OPEN --gas-eia 4.10 --search 55
//
// Env:
//   OCHI_INGEST_SECRET   required — the shared secret, never printed
//   OCHI_INGEST_URL      default https://ochi.mechanicalcupcakes.fun/api/observations
//
// Exit codes: 0 on 2xx · 2 on a 4xx/5xx from the server · 3 on a bad invocation.

import { readFileSync } from 'node:fs'

const URL = process.env.OCHI_INGEST_URL || 'https://ochi.mechanicalcupcakes.fun/api/observations'
const SECRET = process.env.OCHI_INGEST_SECRET

const FLAGS = {
  '--week': ['week_start_date', String],
  '--hwy6': ['hwy6_status', String],
  '--gas-aaa': ['gas_price_aaa', Number],
  '--gas-eia': ['gas_price_eia', Number],
  '--search': ['search_interest', Number],
  '--lodging': ['lodging_value', Number],
  '--lodging-source': ['lodging_source', String],
  '--volume': ['observed_volume', String],
  '--notes': ['notes', String],
}

function usage(msg) {
  if (msg) console.error(`error: ${msg}\n`)
  console.error('usage: post-observation.mjs <row.json> | --week YYYY-MM-DD [--hwy6 OPEN|ADVISORY|RESTRICTED] [--gas-eia N] [--gas-aaa N] [--search 0-100] [--lodging N] [--lodging-source tlt|client] [--volume HIGH|MODERATE|LOW] [--notes "…"]')
  process.exit(3)
}

function parseArgs(argv) {
  if (argv.length === 0) usage('nothing to send')
  if (argv.length === 1 && !argv[0].startsWith('--')) {
    try { return JSON.parse(readFileSync(argv[0], 'utf8')) } catch (e) { usage(`could not read ${argv[0]}: ${e.message}`) }
  }
  const body = {}
  for (let i = 0; i < argv.length; i += 2) {
    const spec = FLAGS[argv[i]]
    if (!spec) usage(`unknown flag ${argv[i]}`)
    if (argv[i + 1] === undefined) usage(`${argv[i]} needs a value`)
    const [key, cast] = spec
    const v = cast(argv[i + 1])
    if (cast === Number && !Number.isFinite(v)) usage(`${argv[i]} must be a number`)
    body[key] = v
  }
  return body
}

async function main() {
  if (!SECRET) usage('OCHI_INGEST_SECRET is not set')
  const body = parseArgs(process.argv.slice(2))
  if (!body.week_start_date) usage('week_start_date is required')

  console.log(`POST ${URL}`)
  console.log(JSON.stringify(body, null, 2))

  const res = await fetch(URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-ingest-secret': SECRET },
    body: JSON.stringify(body),
  })
  const text = await res.text()
  console.log(`\n${res.status} ${res.statusText}`)
  console.log(text)
  process.exit(res.ok ? 0 : 2)
}

main().catch((e) => { console.error(`fetch failed: ${e.message}`); process.exit(2) })
