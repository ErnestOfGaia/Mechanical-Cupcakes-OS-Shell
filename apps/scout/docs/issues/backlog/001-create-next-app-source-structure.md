# Issue: Create Next App Source Structure

Status: done
Owner: Codex
Suggested agent: Codex

## Goal

Create the initial `scout-app/src` folder structure needed for the Garage v0.1 prototype without building any major UI yet.

## Context

Read these first:

- `docs/specs/garage-v0.1-local-prototype.md`
- `docs/design/interface-principles.md`
- `docs/process/PREFLIGHT_CHECKLIST.md`
- `scout-app/package.json`

## Why This Matters

The app currently has dependencies and package scripts, but no source files. This issue creates a clean place for future components, mock data, protocol helpers, and types.

## Baby Steps

1. Confirm the app uses Next `15.3.0` and React `19`.
2. Create minimal source folders under `scout-app/src`.
3. Add a minimal app entry route that can render a placeholder page.
4. Keep the page simple and clearly marked as Garage v0.1 simulated mode.

## Acceptance Criteria

- [x] `scout-app/src` exists.
- [x] A minimal Next app route exists.
- [x] The app can render a simple Garage placeholder.
- [x] No real protocol, blockchain, Mastra, or networking code is added.
- [x] Local dev can be attempted with `npm run dev`.

## Out Of Scope

- Full Garage UI.
- Walkie Talkie behavior.
- Candidate cards.
- Whiteboard persistence.
- Real network calls.

## Learning Note

This teaches the basic shape of a Next app: where pages/routes live, where components go, and how a local prototype starts from a tiny renderable page.

## Verification

Run `npm run dev` from `scout-app` and open `http://localhost:3004`.

Build verification completed with `npm.cmd run build`.
Local dev verification completed at `http://localhost:3004`.

Notes:

- PowerShell blocked `npm` through `npm.ps1`, so use `npm.cmd` on this Windows machine.
- The first build needed permission to spawn the Next compiler process.
- Next generated `tsconfig.json` automatically after TypeScript app files were added.
