#!/usr/bin/env node
// ─── fetch-hwy6-tripcheck.mjs — the routine's Hwy 6 fetch (D5: fetch, then ask) ─
// Reads ODOT's TripCheck Incidents feed, keeps the ACTIVE incidents on OR-6
// (the Wilson River Highway, route-id "OR6"), and PROPOSES a gatekeeper status
// with the evidence printed beside it. A human confirms before it is stored:
// the feed is an incident list, not a road-status field, so the mapping below
// is a rule of thumb measured on 2026-09-06, not ODOT's word.
//
// Rule (conservative on purpose — a wrong RESTRICTED costs a shift, a wrong
// OPEN costs a surprise; both are visible because the incidents print too):
//   RESTRICTED  any active OR6 incident whose text says the highway itself is
//               closed (road/highway closed, closed to all traffic, detour) or
//               whose impact mentions delays of an hour or more
//   ADVISORY    any active OR6 incident that is not routine roadwork with a
//               "minimal"/"under 20 minutes" impact — weather, crash, slide,
//               chains, or a stated delay of 20 minutes or more
//   OPEN        no active OR6 incidents, or only roadwork with minimal impact
//
// Usage:  TRIPCHECK_API_KEY=… node scripts/fetch-hwy6-tripcheck.mjs [--json]
// Exit:   0 printed a verdict · 3 no key / network / non-200 (nothing to send)
// Never prints the key. Never invents a status: if the feed cannot be read there
// is no verdict, and the routine asks Ernest instead.

// TRIPCHECK_FIXTURE=<file.json> reads a saved feed instead of the network — for
// the test that proves the rule, and for replaying a day Ernest wants to argue about.
const FIXTURE = process.env.TRIPCHECK_FIXTURE
const KEY = process.env.TRIPCHECK_API_KEY
if (!KEY && !FIXTURE) { console.error('error: TRIPCHECK_API_KEY is not set'); process.exit(3) }
const asJson = process.argv.includes('--json')

const URL = 'https://api.odot.state.or.us/tripcheck/Incidents'
const ROUTE = 'OR6'

const CLOSED = /\b(road|highway|or ?6|ore ?6) (is )?closed\b|closed to (all )?traffic|full closure|\bdetour(ed)?\b/i
const HOUR_PLUS = /\b(1|one|2|two|3|three)\+? ?hours?\b|over (an|1|one) hour|more than (an|1|one) hour/i
const MINIMAL = /minimal|under 20 minutes|less than 20|no delay/i
const ROADWORK_TYPES = new Set(['RW'])
const ADVISORY_WORDS = /\b(chain|snow|ice|icy|flood|slide|landslide|rockfall|crash|collision|debris|fire|smoke)\b/i

function text(i) {
  return [i.headline, i['impact-desc'], i.comments].filter(Boolean).join(' ')
}

let res
if (FIXTURE) {
  const { readFileSync } = await import('node:fs')
  res = { ok: true, json: async () => JSON.parse(readFileSync(FIXTURE, 'utf8')) }
} else {
  try {
    res = await fetch(URL, { headers: { 'Ocp-Apim-Subscription-Key': KEY } })
  } catch (e) {
    console.error(`error: network — ${e.message}`); process.exit(3)
  }
}
if (!res.ok) {
  console.error(`error: TripCheck answered ${res.status}`)
  process.exitCode = 3
} else {
  const body = await res.json().catch(() => null)
  const all = body?.incidents
  if (!Array.isArray(all)) {
    console.error('error: unexpected feed shape (no incidents array)')
    process.exitCode = 3
  } else {
    const onRoute = all.filter((i) => i?.location?.['route-id'] === ROUTE && String(i['is-active']) === 'true')

    let verdict = 'OPEN'
    const reasons = []
    for (const i of onRoute) {
      const t = text(i)
      const desc = i['location']?.['start-location']?.['location-desc'] ?? ''
      if (CLOSED.test(t) || HOUR_PLUS.test(t)) {
        verdict = 'RESTRICTED'
        reasons.push(`RESTRICTED: "${i.headline}" @ ${desc}`)
      } else if (!ROADWORK_TYPES.has(i['event-type-id']) || !MINIMAL.test(t) || ADVISORY_WORDS.test(t)) {
        if (verdict !== 'RESTRICTED') verdict = 'ADVISORY'
        reasons.push(`ADVISORY: "${i.headline}" @ ${desc}`)
      } else {
        reasons.push(`open-compatible roadwork: "${i.headline}" @ ${desc}`)
      }
    }

    const out = {
      source: 'ODOT TripCheck Incidents',
      route: ROUTE,
      feedUpdated: body?.['organization-information']?.['last-update-time'] ?? null,
      activeIncidents: onRoute.length,
      proposedStatus: verdict,
      reasons,
      incidents: onRoute.map((i) => ({
        id: i['incident-id'],
        type: i['event-type-id'],
        impact: i['impact-desc'],
        headline: i.headline,
        where: i['location']?.['start-location']?.['location-desc'] ?? null,
        updated: i['update-time'],
      })),
    }

    if (asJson) console.log(JSON.stringify(out))
    else {
      console.log(`Hwy 6 (OR6) — proposed ${verdict} — ${onRoute.length} active incident(s), feed updated ${out.feedUpdated}`)
      for (const r of reasons) console.log(`  · ${r}`)
      console.log('Confirm before storing: the rule is a heuristic, the incidents above are the evidence.')
    }
  }
}
