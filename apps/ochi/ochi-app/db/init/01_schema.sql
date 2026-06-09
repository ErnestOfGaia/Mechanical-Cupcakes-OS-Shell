-- OCHI Dashboard — Postgres schema (runs once, on first DB init)
-- See: A Priori/Preflight Checklists/POSTGRES_METABASE_PREFLIGHT.md

-- Metabase needs its own database for settings (separate from our data).
CREATE DATABASE metabase;

-- ─── Raw data: one row per week ───────────────────────────────────────────────
CREATE TABLE gatekeeper_observations (
  week_start_date  DATE PRIMARY KEY,                              -- Monday of the week
  hwy6_status      TEXT NOT NULL CHECK (hwy6_status IN ('OPEN','ADVISORY','RESTRICTED')),
  gas_price_aaa    NUMERIC,        -- AAA Oregon state avg, $/gal (load both sources to compare)
  gas_price_eia    NUMERIC,        -- EIA West Coast PADD5 weekly avg, $/gal
  search_interest  INTEGER CHECK (search_interest BETWEEN 0 AND 100),  -- Google Trends index
  -- Lodging is an INDICATOR with a swappable SOURCE (see OCHI_GRILL §G3.2):
  --   lodging_source 'tlt'    = public Tillamook County lodging tax (quarterly; repeat across the quarter; lags ~90d)
  --   lodging_source 'client' = a property's own weekly occupancy (live; the paid upgrade)
  lodging_value    NUMERIC,        -- the lodging reading (TLT $ on the public baseline; occupancy % when client-sourced)
  lodging_source   TEXT NOT NULL DEFAULT 'tlt' CHECK (lodging_source IN ('tlt','client')),
  observed_volume  TEXT CHECK (observed_volume IN ('HIGH','MODERATE','LOW')),  -- your best read
  notes            TEXT
);

-- ─── Normalized view: mirrors lib/multiplier.ts, for calibration in Metabase ──
-- Each raw signal → a 0–1 score, plus the candidate formula variants so you can
-- chart them against observed_volume and see which fits.
CREATE VIEW normalized AS
WITH base AS (
  SELECT
    week_start_date,
    hwy6_status,
    observed_volume,
    CASE hwy6_status WHEN 'OPEN' THEN 1.0 WHEN 'ADVISORY' THEN 0.5 ELSE 0.0 END AS hwy6_score,
    -- prefer AAA Oregon when present, else EIA. (Note: GREATEST/LEAST swallow NULLs,
    -- so guard with COALESCE — otherwise a missing price silently scores 1.0.)
    GREATEST(0, LEAST(1, (5.50 - COALESCE(gas_price_aaa, gas_price_eia)) / 2.00)) AS gas_score,
    search_interest / 100.0                                       AS search_score,
    lodging_value / NULLIF(MAX(lodging_value) OVER (), 0)         AS lodging_score
  FROM gatekeeper_observations
)
SELECT
  *,
  -- Variant 1 — equal weights
  (hwy6_score + gas_score + search_score + lodging_score) / 4                     AS v1_equal,
  -- Variant 2 — Hwy6-dominant (our locked v1 prior, before the hard cap)
  (hwy6_score*0.40 + gas_score*0.20 + search_score*0.30 + lodging_score*0.10)     AS v2_hwy6_dominant,
  -- Variant 3 — search-led
  (hwy6_score*0.30 + gas_score*0.15 + search_score*0.40 + lodging_score*0.15)     AS v3_search_led,
  -- Variant 4 — v2 + Hwy6 RESTRICTED hard-cap at 0.40 (the LOCKED formula)
  CASE WHEN hwy6_status = 'RESTRICTED'
       THEN LEAST(0.40, hwy6_score*0.40 + gas_score*0.20 + search_score*0.30 + lodging_score*0.10)
       ELSE        hwy6_score*0.40 + gas_score*0.20 + search_score*0.30 + lodging_score*0.10
  END                                                                            AS v4_locked
FROM base;
