# OCHI Dashboard Guide

Rewritten 2026-09-12 (Last Mile L6, Ernest's ruling: the AGENTS doc's brand brief is canon). The
previous block described a monochrome white/Inter prototype that was never what shipped, and
GitHub #14 asked for a dark glassmorphic look that contradicts the brief; #14 is closed won't-fix.
Source of truth for the look: the vault's `OCHI_BRAND_FIT_BRIEF.md` (in the OCHI Dashboard folder)
and the tokens in `app/globals.css`. Where this file and the brief disagree, the brief wins.

## Commands
- `npm run build` — production build. `npm run lint` — ESLint. `npm test` — vitest (93 tests).
- `OCHI_PG_INTEGRATION=1 npx vitest run` — the ingest test against a local Docker Postgres.
- ⛔ **No `next dev` on Ernest's PC** — a dev server froze it (2026-09-06). Verify with tests,
  route-handler calls, and curl against production. Ask before any `docker build` here.

## Design — enterprise-hospitality-calm (from the brand brief)
- **Register:** calm, credible, enterprise ops-SaaS for a coastal-Oregon operator. Not flashy,
  not loud, not the shell's Midnight Workshop theme. Materials vocabulary: wood, stone, sand.
- **Palette (tokens in `globals.css`):** Pacific navy `--navy #1E3A5F` for headers, `--action
  #2C5282` for links/actions; driftwood neutrals — `--canvas #FAF8F5` warm off-white (never
  clinical white), `--card #EFEAE3` sand, `--taupe #6B6256` secondary text, `--ink #33312E`;
  `--terracotta #C2703D` is the reserved accent, ≤5% of the UI (hero number, the stale chip).
- **Status set is sacred and slightly muted:** good `#3E7C5A` · watch `#C99A3B` · risk `#B5483D`
  · no-data `#9A938A`. Color carries meaning, never decoration, and is always paired with a
  text label.
- **Typography:** one humanist sans everywhere — Source Sans 3 (loaded in `globals.css`). KPI
  tiles: large semibold number over a small taupe label. No novelty or "AI-startup" fonts.
- **Layout:** mobile-first, single scroll, comfortable density, soft 6–8px cards on a subtle
  shadow. Signals first; the Master Multiplier is the appendix (OCHI is a check-in, not a planner).
- **Every metric card carries its "why"** — the tenant's `loudAiAnnotation`, real authored copy.

## Constraints
- **NO OWLS:** no Hoot or owl branding inside the app canvas.
- **Utilitarian:** functional utility beats decorative features. No animations for their own sake.
- **Truth over polish:** three states (live / demo / unavailable), never a fallback to mock; a
  row older than 10 days shows the Stale chip (`lib/staleness.ts`). Nothing on the page may claim
  a number that did not come from a stored row or a live feed.
