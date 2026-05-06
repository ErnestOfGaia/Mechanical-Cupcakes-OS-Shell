# Scout Protocol — Garage v0.1

## Build & Run

- `npm run dev`: Start Garage UI at http://localhost:3004
- `npm run node:start`: Start local Garage Node service (future use)
- `npm run build`: Build production artifacts — run this to check TypeScript errors
- `npm run test`: Run unit tests (added in issue 008)

## Architecture Guidelines

- **Porting Logic**: Prioritize reusing logic from `identity/vault.js` and `wallet/transaction-service.js` in future phases. Do not port these in v0.1.
- **UI State**: All state lives in `src/app/page.tsx` using `useState`. No external state libraries.
- **Protocol**: All inter-node messages must follow the `ScoutEnvelope<TPayload>` shape from `src/lib/envelope.ts`.
- **Animations**: `framer-motion` is installed but **must NOT be used in v0.1**. Do not add animations.

## Design Identity

- **Visuals**: Mission Control / Garage vibe. Dark theme, monospace labels, status indicators.
- **CSS**: Plain CSS in `src/app/globals.css` using CSS custom properties. No Tailwind utility classes in component markup.
- **Constraints**: Maintain decentralized architecture — no hardcoded central discovery servers.

## v0.1 Hard Rules

- No API routes (`src/app/api/` must not be created)
- No `ethers.js` in UI code
- No `localStorage` or `sessionStorage`
- No `fetch()` or real network calls
- No new npm packages without checking with Ernest first
- The `[MODE: SIMULATED]` badge must always be visible
