#!/usr/bin/env node
// ─── fetch-gas-eia.mjs — the routine's gas fetch (D5: fetch, then ask) ────────
// Reads the latest weekly retail regular-gasoline price from the EIA v2 API and
// prints it with its period and series so a human (or the routine's report) can
// see exactly what was fetched before it is sent to /api/observations.
//
// EIA publishes no Oregon-only weekly series. The two honest candidates:
//   R5XCA  West Coast except California  — closer to Oregon prices (default)
//   R50    West Coast (PADD 5), incl. CA — what 01_schema.sql's column comment names
// Pick with --area R50. Series id shape: EMM_EPMR_PTE_<area>_DPG (regular, all
// formulations, retail, $/gal).
//
// Usage:  EIA_API_KEY=… node scripts/fetch-gas-eia.mjs [--area R5XCA|R50] [--json]
// Exit:   0 printed a value · 2 the API answered but had no row · 3 bad invocation/network
//
// Never prints the key. Never invents a value: no row → exit 2, nothing to send.

const KEY = process.env.EIA_API_KEY
if (!KEY) { console.error('error: EIA_API_KEY is not set'); process.exit(3) }

const args = process.argv.slice(2)
const areaIdx = args.indexOf('--area')
const area = areaIdx >= 0 ? (args[areaIdx + 1] || '') : 'R5XCA'
const asJson = args.includes('--json')
if (!/^R5(0|XCA)$/.test(area)) { console.error('error: --area must be R5XCA or R50'); process.exit(3) }

const series = `EMM_EPMR_PTE_${area}_DPG`
const url = new URL('https://api.eia.gov/v2/petroleum/pri/gnd/data/')
url.searchParams.set('api_key', KEY)
url.searchParams.set('frequency', 'weekly')
url.searchParams.set('data[0]', 'value')
url.searchParams.set('facets[series][]', series)
url.searchParams.set('sort[0][column]', 'period')
url.searchParams.set('sort[0][direction]', 'desc')
url.searchParams.set('length', '1')

let res
try {
  res = await fetch(url)
} catch (e) {
  console.error(`error: network — ${e.message}`); process.exit(3)
}
const body = await res.json().catch(() => null)
// process.exitCode, not process.exit(): exiting while the fetch socket is still
// closing trips a libuv assertion on Windows. Let the loop drain, then exit.
if (!res.ok || !body) {
  console.error(`error: EIA answered ${res.status} — ${JSON.stringify(body?.error ?? body).slice(0, 300)}`)
  process.exitCode = 3
} else {
const row = body?.response?.data?.[0]
if (!row || row.value == null) {
  console.error(`no data: EIA returned no row for ${series}`)
  process.exitCode = 2
} else {
const out = {
  source: 'EIA',
  series,
  areaName: row['area-name'] ?? row.duoarea ?? area,
  product: row['product-name'] ?? 'regular',
  period: row.period,           // the Monday the reading is for
  value: Number(row.value),     // $/gal
  units: row.units ?? '$/GAL',
}
if (asJson) console.log(JSON.stringify(out))
else console.log(`EIA ${out.areaName} regular gasoline, week of ${out.period}: $${out.value.toFixed(3)}/gal  (${series})`)
}
}
