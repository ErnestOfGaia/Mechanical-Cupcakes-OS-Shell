# OCHI Dashboard

Oregon Coastal Hospitality Intelligence. A public check-in on the conditions that decide how busy
a Pacific City weekend will be: Highway 6, gas, search interest, lodging tax, live weather, and one
synthesised number. Live at [ochi.mechanicalcupcakes.fun](https://ochi.mechanicalcupcakes.fun).

**Why it is built the way it is: [WRITEUP.md](./WRITEUP.md)**, also rendered at `/under-the-hood`.
This README tells you what to type. The writeup explains the decisions. They don't overlap.

## Run it locally

```bash
npm install --workspaces=false
docker compose -f docker-compose.local.yml up -d ochi-postgres-local
cp .env.local.example .env.local   # or write the four lines below yourself
npm run dev                         # http://localhost:3003
```

`.env.local` for the local stack (gitignored and dockerignored):

```
OCHI_PG_HOST=127.0.0.1
OCHI_PG_PORT=5433
OCHI_PG_PASSWORD=localdev
OCHI_INGEST_SECRET=any-string-for-local
```

With no database reachable the dashboard renders the **unavailable** state, on purpose. It never
falls back to sample values. To see the demo state, set `GATEKEEPERS_ARE_DEMO_DATA` to `true` in
`lib/currentConditions.ts`; the coupling test will tell you if the flag and the read disagree.

## Test

```bash
npm test                              # unit tests, no database needed
OCHI_PG_INTEGRATION=1 npm test        # adds the endpoint + read tests against the local Postgres
```

Every check is fail-capable. The demo-disclosure test is the gate on the demo flag; the integration
file is the handoff's V2 and V3.

## Environment (production, from the VPS root `.env`)

| Variable | Read by | Purpose |
|---|---|---|
| `OCHI_PG_PASSWORD` | `lib/db.ts` | Postgres password. Host defaults to `ochi-postgres`, db/user `ochi`. |
| `OCHI_PG_HOST`, `OCHI_PG_PORT` | `lib/db.ts` | Override for local runs only. |
| `OCHI_INGEST_SECRET` | `app/api/observations/route.ts` | Shared secret for the write endpoint. Unset → 503, never falls open. |
| `EIA_API_KEY` | `scripts/fetch-gas-eia.mjs` | Free key from eia.gov/opendata. |
| `TRIPCHECK_API_KEY` | `scripts/fetch-hwy6-tripcheck.mjs` | Subscription key from apiportal.odot.state.or.us. |
| `SECRETARY_BOOKING_URL`, `OCHI_BOOKING_SECRET` | `app/api/book/route.ts` | Booking proxy upstream. Unset → 503 with the text/email fallback. |

A new variable must exist in the VPS `.env` **before** the image that reads it deploys.

## Data

- **Schema:** `db/init/01_schema.sql` then `02_updated_at.sql`, run once by Postgres on a fresh
  volume. Schema changes are new numbered files plus a hand-applied migration on the live volume
  (`psql -f /docker-entrypoint-initdb.d/<file>` inside the container). Never edit a file that has run.
- **Week key:** `week_start_date` is the Monday of the ISO week. The database refuses anything else.
  The dashboard labels rows by the weekend they describe.
- **Write path:** `POST /api/observations`, header `x-ingest-secret`, JSON body of column names.
  Merge semantics: omitted fields keep their stored value. Responses: 200 row · 400 not a Monday ·
  401 wrong secret · 422 bad enum or range · 503 secret not configured.
- **Send a row:** `OCHI_INGEST_SECRET=… node scripts/post-observation.mjs row.json` or the `--week`
  flags. See the script header.
- **Fetch helpers:** `scripts/fetch-gas-eia.mjs` (EIA weekly regular, West Coast except CA) and
  `scripts/fetch-hwy6-tripcheck.mjs` (proposes OPEN / ADVISORY / RESTRICTED from active OR-6
  incidents, with the evidence). Both print what they got and exit non-zero when they got nothing.
- **Calibration:** Metabase, gated behind the reverse proxy's access list. The `normalized` view
  carries the formula variants beside `observed_volume`.

## Layout

| Path | What |
|---|---|
| `lib/currentConditions.ts` | The data seam: `getCurrentInputs()` → `live \| demo \| unavailable`; live NWS weather |
| `lib/observations.ts` | The tenant-shaped ingest contract: columns, enums, Monday rule, upsert, latest read |
| `lib/multiplier.ts` | The locked v1 formula, pure |
| `lib/dashboardView.ts` | View model for the three states |
| `lib/tenant.config.ts` | Pacific City's gatekeepers, weights, annotations |
| `app/api/observations/route.ts` | The one write path |
| `app/under-the-hood/page.tsx` | Renders `WRITEUP.md` at build time |
| `components/` | Dashboard UI, brand per `OCHI_BRAND_FIT_BRIEF` (navy, driftwood, one terracotta) |

## Deploy

Push to `main` builds `ghcr.io/ernestofgaia/mcos-ochi:latest`. On the VPS, in
`/root/Mechanical-Cupcakes-OS-Shell`: `git pull` (the schema directory is a bind mount), then
`docker compose -f docker-compose.prod.yml pull mcos-ochi` and `up -d mcos-ochi`. Named services
only. Compare `docker inspect mcos-ochi --format '{{.Image}}'` before and after.
