<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# MCOS Shell — Agent Guide & Backlog Workflow

This repo is the **Mechanical Cupcakes OS Shell** (`mechanicalcupcakes.fun`): a Next.js 16 meta-OS that wraps independent sub-apps (in `apps/`) under a shared top bar and the Hoot agent. Work is managed through a project backlog — this file tells you how to pick up, execute, and close out tasks.

## The backlog (source of truth for what to do)

- **Backlog:** `C:\Users\Owner\.claude\Ideas & Projects\Backlogs\Backlog - Mechanical Cupcakes OS.md`
- **Full context per task:** `C:\Users\Owner\.claude\Ideas & Projects\Projects Management\Product Projects\Mechanical Cupcakes OS\Code Review — MCOS Shell 2026-07-05.md` (findings + a session handoff section)
- **Task-specific specs** live in the project's `OS Notes\` folder (e.g. `HANDOFF — Pellito Hub card + in-shell integration.md`)

### Project notes map

Everything lives under the project root folder
`C:\Users\Owner\.claude\Ideas & Projects\Projects Management\Product Projects\Mechanical Cupcakes OS\`:

| Folder | Covers | Key files |
|---|---|---|
| `OS Notes\` | The shell itself | `PROJECT_BRIEF.md`, `HOOT_MUSEUM_GUIDE.md`, `HANDOFF — Pellito Hub card + in-shell integration.md` |
| `OCHI Dashboard\` | OCHI (`apps/ochi/`) | `00_INDEX.md`, `Project DNA Brief.md`, `HOOT_EXHIBIT_NOTES.md`, `UX\`, `research\` |
| `Pellito Hub\` | Pellito Hub (external app, iframed) | `PROJECT_BRIEF.md`, `ops\`, `releases\`, `pelican.mechanicalcupcakes.fun.md` |
| `Scout Protocol Prototype\` | Scout (`apps/scout/`) | `PROJECT_BRIEF.md`, `Scout Protocol Chain\` |
| `love.postcards\` | Postcards (`apps/postcards/`) | `PROJECT_BRIEF.md`, `love.mechanicalcupcakes.fun.md` |

Before touching a sub-app, read its `PROJECT_BRIEF.md` (OCHI: `Project DNA Brief.md`). Each app's `HOOT_EXHIBIT_NOTES.md` defines how Hoot presents it — keep Hoot copy consistent with those when editing `hootAgent.ts` or `appRegistry.ts`.

### Workflow

1. Open the backlog. Take the **topmost unchecked task in the lowest-numbered phase** (Phase 1 = blockers, user-visible breakage).
2. Read any linked handoff/spec note before touching code.
3. One task = one commit. Descriptive message referencing the task.
4. Verify (section below) **before** ticking the checkbox. Move done items to the backlog's **Completed** section with the date, and update `last_reviewed` in its frontmatter.
5. If a task is blocked, move it to **Blocked / Waiting** with the reason — don't silently skip it.
6. **Ask Ernest first:** deleting `apps/pelican*`, changing the Hoot model, pushing to `main` (it deploys — see below).

## Architecture invariants (do not break)

- **Shell owns the bar; apps own the canvas.** TopBar z-index 900, Hoot/Directory overlays 1000, scanlines 10000. No layout push into app content.
- **Sub-apps stay standalone.** Each app must keep working on its own subdomain with no hard dependency on shell JS/CSS. In-shell integration = iframe to the subdomain (`src/app/ochi/page.tsx` is the reference pattern).
- **Scout is intentionally disabled** (`[ MODE: SIMULATED ]`, v0.1 constraint, all controls `.disabled`, no storage). Don't enable interactions unless the task explicitly says so (Phase 4).
- **Hoot model is pinned** to `claude-3-5-haiku-latest` in `src/mastra/agents/hootAgent.ts` — never change without approval.
- **Hoot auto-open** uses `localStorage` keys `mcos_visited_<app>` — preserve when touching HootPanel/layout.
- See `ARCHITECTURE.md` for the full design contract; `CONTRIBUTING.md` for repo conventions.

## Running & verifying

```bash
npm install && npm run dev     # shell on :3000
npm run build                  # must pass (TS strict) before any commit
npx eslint .                   # must be clean
```

- Hoot needs `ANTHROPIC_API_KEY` in `.env` (gitignored) and `public/brain.json` (generated via `src/scripts/ingest-brain.ts` + `VOYAGE_API_KEY`). Shell runs without them; Hoot degrades.
- Sub-apps: own `package.json` under `apps/<name>/`; run/build separately if a task touches them.
- Browser-verify shell chrome after any UI change: bar fixed at 48px, Hoot panel opens/closes, Directory lists apps, `/ochi` iframe still renders.

## House standards (treat as requirements)

Ernest's preflight checklists at `C:\Users\Owner\.claude\Ideas & Projects\A Priori\Preflight Checklists\`:

- **DEPLOYMENT_STANDARDS & VPS Tips.md** — every app exposes `GET /health` → 200; no hardcoded secrets (env vars only); NPM (Nginx Proxy Manager) proxies by container hostname on the shared `nginx-proxy` Docker network; ports 80/443 are NPM-only, never mapped to app containers.
- **CHAT_FRONTEND_PREFLIGHT.md** — chat UIs: check `response.ok` before parsing, disable input/send while loading, `100dvh` not `100vh` for overlays, auto-scroll on new message and panel open, `aria-live` on the message log.

## Deploy cautions

- **Pushing to `main` publishes production images**: `.github/workflows/docker-publish.yml` builds `mcos-shell`, `mcos-postcards`, `mcos-ochi`, `mcos-pennypost` to GHCR; the VPS runs `docker-compose.prod.yml` pulling `:latest`. Don't push half-done work. (Scout is currently *missing* from this matrix — that's backlog task #2.)
- New env vars a change reads (`NEWSHUB_URL`, `PELICAN_URL`, …) must exist in the VPS `.env` **before** deploying the change.
- `apps/pelican/` + `apps/pelican-broken/` are stale (old Postgres app). The live Pellito Hub is a separate SQLite deploy at `pelican.mechanicalcupcakes.fun` — never build or wire the stale folders back in.

## Current backlog snapshot (2026-07-05 — the backlog file is authoritative)

**Phase 1 — Blockers:** Pellito Hub in-shell integration (3 edits, spec in OS Notes handoff) · add Scout to CI matrix · wire or remove News Hub URL.
**Phase 2 — Should-fix:** HootPanel `response.ok` check · HootPanel auto-scroll on open · audit/rotate API keys if ever public.
**Phase 3 — Nice-to-have:** `<EmbeddedApp>` iframe component · aria-label pass on shell chrome · retire `apps/pelican*` (confirm first) · `/health` endpoints + compose healthchecks · landing HUD hardcodes.
**Phase 4 — Roadmap:** Scout ADRs, protocol spec, tokenomics sim, Garage MVP interactions · RAG scaling check in `src/lib/brain.ts`.
