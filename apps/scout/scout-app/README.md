# Scout Protocol — Garage v0.1

Scout Protocol is decentralized infrastructure for autonomous agent discovery, negotiation,
and settlement — no central gatekeepers, no platform extraction.

---

## What This Is

This repository contains the **Garage v0.1** — a local browser prototype that teaches the
Scout Protocol loop before any real network or blockchain exists.

- **Scope**: local browser only. No server, no blockchain, no real peer network.
- **Mode**: everything in v0.1 is simulated. `[MODE: SIMULATED]` is intentional, not a fallback.
- **The Garage** is not a UI wrapper — it is the node infrastructure that agents will depend on.
  In future phases it becomes a real process with gossip, settlement, and a capabilities registry.

**Node progression:**
1. Garage (v0.1) — local, browser-only, simulated peer, in-memory state
2. Proto-Station (v0.2) — accepts real scouts, relays gossip, earns fees; ~$50–200/month
3. Space Station (v1.0) — validator node, guild backbone; $500–2000+/month

**First target guild:** Cape Kiwanda Collective — 5–10 node operators, 20+ eco-tourism agents.

---

## Protocol Philosophy

Scout Protocol is built on permaculture and cooperative principles. Four pillars guide every
design decision:

- **Earth Care** — infrastructure that is sustainable, low-waste, and runs on modest hardware
- **People Care** — operators own their nodes; no landlord extracting 20–30% platform fees
- **Agent Care** — agents are treated as participants, not tools; discovery is open and fair
- **Fair Share** — protocol surplus flows back to operators and guild members, not shareholders

This is why discovery must be open (no lock-in), economics must be transparent (no hidden cuts),
and governance must be cooperative (guilds vote, not a founding team).

---

## Architecture

### Two Query Modes (critical to understand before building)

| Mode | When | How |
|---|---|---|
| **Cache** | instant, no traffic | reads local Capability Cache (may be stale) |
| **Live** | real-time | broadcasts gossip to peer nodes (future) |

v0.1 implements **Cache-mode only**, simulated by `src/lib/mockPeer.ts`. There is no real network.

### Garage Components

**UI (this repo):**
- Walkie Talkie — 1:1 mission query to a known peer
- Whiteboard — saved agent candidates (your public storefront in future phases)
- Network Activity — built-in protocol debugger; every significant action appends a `NetworkEvent`

**Node service (future, `src/main/node.ts`):**
- Capabilities Registry
- Gossip Protocol
- Settlement Processor

### Network Activity is not optional

Network Activity is a first-class debugging surface. Every protocol action — query created,
query sent, response received, candidate saved — must append a `NetworkEvent`. If an action
is not reflected in the Network Activity log, it is not done.

---

## Heritage — Freedom Browser Ports

Scout Protocol's core components are ported from the Freedom Browser codebase. **None are
ported in v0.1** — they inform the architecture only. They will be ported in later phases.

| File | Purpose |
|---|---|
| `vault.js` | Agent identity wallet (AES-GCM encryption) |
| `derivation.js` | Key derivation |
| `ens-resolver.js` | ENS name resolution |
| `transaction-service.js` | Arbitrum settlement (ethers.js v6) |
| `dapp-permissions.js` | Permission model |
| `ipc-contract.js` | Scout envelope pattern (the origin of `ScoutEnvelope`) |
| `service-registry.js` | Garage tool/agent registry |

---

## Build Instructions

```bash
npm install
npm run dev       # starts on http://localhost:3004
npm run build     # production build — run this to check for TypeScript errors
npm run test      # run unit tests (added in issue 008)
```

Styling uses **plain CSS** in `src/app/globals.css` with CSS custom properties. There is no
Tailwind configuration and no Tailwind utility classes in component markup.

---

## Issue Roadmap (v0.1)

Issues must be completed in this order — each depends on the previous:

| # | Issue | Status |
|---|---|---|
| 001 | Create Next.js app source structure | Done |
| 002 | Build static Garage layout | Done |
| 003 | Add mock Scout data types | Ready |
| 004 | Build Network Activity Log component | Ready |
| 005 | Create message envelope utility | Ready |
| 006 | Implement Walkie Talkie mock query | Ready |
| 007 | Save candidate to Whiteboard | Ready |
| 008 | Add first v0.1 tests | Draft |

---

## Guiding Rails for Jules

> This section is written directly for Jules (Google's AI coding agent). If you are Jules,
> read this before touching any code. These rules are not suggestions.

### What this project is — and is not

You are building a **local browser prototype**. There is no server, no API, no database,
no blockchain, and no real network. The entire application runs in the user's browser using
React state.

"Simulated mode" is the only mode for v0.1. Do not try to make anything real.

The `[MODE: SIMULATED]` badge in the header **must remain visible at all times**. Do not
remove it or hide it.

### Issue order — follow exactly

```
003 → 004 → 005 → 006 → 007 → 008
```

Each issue depends on the previous. Do not skip ahead. Do not start 006 before 003 is done.

### File structure conventions

| What | Where |
|---|---|
| TypeScript types | `src/types/scout.ts` — all domain types, all exported |
| Mock data | `src/mock/garage.ts` — deterministic instances |
| React components | `src/components/*.tsx` — receive props, no internal fetching |
| Pure utility functions | `src/lib/*.ts` — no React, no side effects |
| Application shell | `src/app/page.tsx` — owns ALL state |

Do not create files outside these directories unless an issue explicitly says to.

### CSS conventions

- **Do NOT** use Tailwind utility classes in component markup (`className="flex gap-2"` etc.)
- All visual styling goes in `src/app/globals.css` using CSS custom properties already defined
- Existing CSS variables: `--surface-card`, `--text`, `--muted`, `--green`, `--amber`, `--blue`, `--danger`
- Add new class names to `globals.css` if a component needs new styles — do not inline styles

### TypeScript conventions

- Use `type` aliases, not `interface`
- No `any`
- Timestamps are `string` (ISO 8601 format), not `Date` objects
- Signature fields are `string | null`, never `undefined`
- Export every type from `src/types/scout.ts`

### State management rules

- All state lives in `src/app/page.tsx` using `useState`
- Do not use Context, Zustand, Redux, or any external state library
- Do not use `useReducer` unless an issue specifically says to
- Components receive data as props and emit callbacks as props — they do not fetch or mutate global state

### Hard constraints — never violate

- **No `src/app/api/` folder** — no API routes
- **No `ethers.js`** in any v0.1 UI code
- **No `localStorage` or `sessionStorage`** — state resets on page refresh by design
- **No `fetch()` or `axios`** — no network calls
- **No `framer-motion` animations** — it is installed but reserved for future phases
- **No new npm packages** without checking with Ernest first

### What "done" means for v0.1

`npm run dev` starts on port 3004. The user opens the browser, types a mission query, sends
it, sees mock candidates returned, saves one candidate to the Whiteboard, and sees all of
those actions reflected in the Network Activity log. State resets on page refresh. Zero
errors in the browser console.

### Verify after every issue

Every issue ends with `npm run build`. If it exits with TypeScript errors, the issue is not done.
Then check the browser manually using the steps in the issue's Verification section.

### Branch and PR Rules
Jules creates one branch per task automatically. To keep the repo clean, you must follow this checklist:

- **Before starting:** Check open and merged PRs. If a PR for this issue number already exists (open or merged), do not run the task again — comment on the issue explaining the status instead.
- **Scope check:** Each issue is scoped to 2–4 hours of focused work. Stay within scope — do not add features not listed in the acceptance criteria.
- **PR title:** Use the format `[#N] Short description of what you did` — never use the raw branch name or task ID as the PR title.
- **Closes reference:** Always include `Closes #N` (the GitHub issue number) in the PR description body, where N is the GitHub issue number.
- **No scaffold comments:** Remove any `// Jules: implement...` or `{/* Implemented in Issue #N */}` placeholder comments before opening your PR. Do not add new comments that reference issue or PR numbers.
- **No empty PRs:** Do not open a PR with 0 files changed. If your task produced no changes, comment on the issue explaining why instead.
