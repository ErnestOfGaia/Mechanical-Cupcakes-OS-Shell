import { describe, it, expect } from 'vitest'
import { execFileSync } from 'node:child_process'
import { writeFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// The Hwy 6 fetch proposes a status from TripCheck incidents. The rule is a
// heuristic, so it is pinned here on the field shape measured 2026-09-06
// (location.route-id "OR6", is-active "true", event-type-id "RW", impact-desc,
// headline, comments). If ODOT changes the shape, this breaks loudly.

const SCRIPT = join(__dirname, '..', 'scripts', 'fetch-hwy6-tripcheck.mjs')

function incident(over: Record<string, unknown>) {
  return {
    'incident-id': '1', 'event-type-id': 'RW', 'is-active': 'true',
    'impact-desc': 'Construction is occurring causing minimal delay to traffic. Use caution and watch for workers.',
    headline: 'Traffic Impacts: Lane closure on OR 6.', comments: 'Single lane closure 7am to 7pm.',
    'update-time': '2026-09-04T10:27:52-07:00',
    location: { 'location-name': 'WILSON RIVER', 'route-id': 'OR6', 'start-location': { 'location-desc': 'ORE6, 4 miles East of Tillamook' } },
    ...over,
  }
}

function run(incidents: unknown[]) {
  const dir = mkdtempSync(join(tmpdir(), 'tripcheck-'))
  const file = join(dir, 'feed.json')
  writeFileSync(file, JSON.stringify({ 'organization-information': { 'last-update-time': '2026-09-07T05:09:00Z' }, incidents }))
  const out = execFileSync(process.execPath, [SCRIPT, '--json'], { env: { ...process.env, TRIPCHECK_FIXTURE: file, TRIPCHECK_API_KEY: '' } })
  return JSON.parse(out.toString())
}

describe('fetch-hwy6-tripcheck rule', () => {
  it('no active OR6 incidents → OPEN', () => {
    const r = run([incident({ location: { 'route-id': 'I5', 'start-location': { 'location-desc': 'x' } } })])
    expect(r.proposedStatus).toBe('OPEN')
    expect(r.activeIncidents).toBe(0)
  })
  it('routine roadwork with minimal delay (today\'s real feed) → OPEN, with the evidence listed', () => {
    const r = run([incident({}), incident({ 'incident-id': '2' })])
    expect(r.proposedStatus).toBe('OPEN')
    expect(r.activeIncidents).toBe(2)
    expect(r.reasons[0]).toMatch(/open-compatible roadwork/)
  })
  it('inactive incidents are ignored', () => {
    const r = run([incident({ 'is-active': 'false', headline: 'OR 6 is closed' })])
    expect(r.proposedStatus).toBe('OPEN')
  })
  it('a crash / weather / slide on OR6 → ADVISORY', () => {
    expect(run([incident({ 'event-type-id': 'IN', 'impact-desc': 'Estimated delay under 20 minutes', headline: 'Crash on OR 6 near MP 20', comments: '' })]).proposedStatus).toBe('ADVISORY')
    expect(run([incident({ 'event-type-id': 'WX', headline: 'Chains required on OR 6', 'impact-desc': '', comments: 'Snow and ice.' })]).proposedStatus).toBe('ADVISORY')
  })
  it('roadwork with a stated 20+ minute delay → ADVISORY', () => {
    expect(run([incident({ 'impact-desc': 'Estimated delay 20 to 60 minutes' })]).proposedStatus).toBe('ADVISORY')
  })
  it('the highway itself closed, or hour-plus delays → RESTRICTED', () => {
    expect(run([incident({ 'event-type-id': 'IN', headline: 'OR 6 closed both directions due to landslide', comments: 'Road closed to all traffic. Use detour.' })]).proposedStatus).toBe('RESTRICTED')
    expect(run([incident({ 'impact-desc': 'Estimated delay over 1 hour' })]).proposedStatus).toBe('RESTRICTED')
  })
  it('a lane closure is NOT a highway closure', () => {
    expect(run([incident({ headline: 'Lane closures on OR 6', comments: 'Single lane closure, flaggers.' })]).proposedStatus).toBe('OPEN')
  })
})
