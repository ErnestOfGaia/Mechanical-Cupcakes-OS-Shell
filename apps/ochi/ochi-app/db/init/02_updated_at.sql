-- OCHI Dashboard — schema step 2: row freshness (added 2026-09-07, S4)
--
-- WHY A SECOND FILE. 01_schema.sql runs ONCE, on first database init, and the
-- production volume was initialised from it (S1). Editing 01 after that changes
-- nothing on the box. So schema changes arrive as new numbered files: on a FRESH
-- volume the entrypoint runs 01 then 02 in order; on the EXISTING volume this file
-- is applied by hand, once, through the same bind mount:
--
--   docker compose -f docker-compose.prod.yml exec ochi-postgres psql -U ochi -d ochi -f /docker-entrypoint-initdb.d/02_updated_at.sql
--
-- It is idempotent (IF NOT EXISTS) so running it twice is harmless.
--
-- WHAT IT IS FOR. Freshness is the feature. The dashboard shows every stored
-- signal with the moment its row was last written, so a check-in against a stale
-- reading is visibly stale rather than silently confident. The ingest endpoint
-- (app/api/observations) sets this on every upsert; the DEFAULT covers rows
-- inserted any other way.
ALTER TABLE gatekeeper_observations
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
