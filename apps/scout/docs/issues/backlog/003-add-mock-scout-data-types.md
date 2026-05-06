# Issue: Add Mock Scout Data Types

Status: ready
Owner: unassigned
Suggested agent: Jules
GitHub issue: https://github.com/ErnestOfGaia/Mechanical-Cupcakes-OS-Shell/issues/2

---

## Goal

Add TypeScript type definitions and deterministic mock data for Garage identity, peer node,
agent candidates, scout queries, and network events.

This is the foundation. Every other issue (004–008) imports from the files you create here.
Get this right first.

---

## Context

Scout Protocol v0.1 is a local browser prototype. Nothing is real — no network, no blockchain,
no real peers. All data is deterministic and in-memory.

The app currently renders hardcoded strings like "Ernest-Local" and "Cape Kiwanda Mock Node"
directly in `page.tsx`. This issue replaces those with typed imports from a mock data file.

The existing `src/types/`, `src/mock/` directories have `.gitkeep` placeholder files.
You are creating the first real files in those directories.

---

## Files

```
Create:
  scout-app/src/types/scout.ts     — all TypeScript type aliases, all exported
  scout-app/src/mock/garage.ts     — all mock data instances, all exported

Modify:
  scout-app/src/app/page.tsx       — replace hardcoded identity strings with imports
```

---

## Types to Implement

Copy these **exactly** into `src/types/scout.ts`. Use `type` aliases, not `interface`.

```typescript
// src/types/scout.ts

export type GarageIdentity = {
  id: string;
  name: string;
  address: string;
  mode: "simulated" | "local" | "networked";
};

export type PeerNode = {
  id: string;
  name: string;
  address: string;
  status: "online" | "offline" | "unknown";
};

export type ScoutQuery = {
  id: string;
  capability: string;
  mission: string;
  maxBudgetGaia?: number;
  maxLatencyMs?: number;
  createdAt: string; // ISO 8601
};

export type AgentCandidate = {
  id: string;
  name: string;
  nodeId: string;
  capabilities: string[];
  reputation: number;       // 0.0 to 1.0
  priceGaiaPerCall: number;
  averageLatencyMs: number;
  summary: string;
};

export type NetworkEvent = {
  id: string;
  timestamp: string; // ISO 8601
  type: string;
  direction: "local" | "outbound" | "inbound";
  summary: string;
  payload?: unknown;
};
```

---

## Mock Data to Implement

Create `src/mock/garage.ts` with these exact values. Import the types from `../types/scout`.

```typescript
// src/mock/garage.ts
import type { GarageIdentity, PeerNode, AgentCandidate, NetworkEvent } from "../types/scout";

export const mockGarage: GarageIdentity = {
  id: "garage.local.ernest",
  name: "Ernest's Garage",
  address: "0x1111111111111111111111111111111111111111",
  mode: "simulated",
};

export const mockPeer: PeerNode = {
  id: "peer.cape-kiwanda.alpha",
  name: "Cape Kiwanda Mock Node",
  address: "0x2222222222222222222222222222222222222222",
  status: "online",
};

export const mockAgents: AgentCandidate[] = [
  {
    id: "agent-001",
    name: "CodeReview Agent Alpha",
    nodeId: "peer.cape-kiwanda.alpha",
    capabilities: ["code.review", "code.lint"],
    reputation: 0.94,
    priceGaiaPerCall: 0.5,
    averageLatencyMs: 420,
    summary: "Thorough code review with inline suggestions and lint analysis.",
  },
  {
    id: "agent-002",
    name: "DataValidator Beta",
    nodeId: "peer.cape-kiwanda.alpha",
    capabilities: ["data.validation", "data.schema"],
    reputation: 0.88,
    priceGaiaPerCall: 0.3,
    averageLatencyMs: 210,
    summary: "Validates JSON and CSV data against schemas. Returns structured error reports.",
  },
  {
    id: "agent-003",
    name: "EcoGuide Research",
    nodeId: "peer.cape-kiwanda.alpha",
    capabilities: ["research.web", "tourism.eco_guide"],
    reputation: 0.91,
    priceGaiaPerCall: 0.8,
    averageLatencyMs: 850,
    summary: "Web research specialist with eco-tourism domain knowledge.",
  },
];

export const initialNetworkEvents: NetworkEvent[] = [
  {
    id: "evt-001",
    timestamp: new Date(Date.now() - 4000).toISOString(),
    type: "garage.started",
    direction: "local",
    summary: "Garage node initialized in simulated mode.",
  },
  {
    id: "evt-002",
    timestamp: new Date(Date.now() - 3000).toISOString(),
    type: "peer.mock.ready",
    direction: "inbound",
    summary: "Mock peer Cape Kiwanda registered and available.",
  },
  {
    id: "evt-003",
    timestamp: new Date(Date.now() - 2000).toISOString(),
    type: "walkie.ready",
    direction: "local",
    summary: "Walkie Talkie tool ready. Simulated channel 01-Alpha open.",
  },
  {
    id: "evt-004",
    timestamp: new Date(Date.now() - 1000).toISOString(),
    type: "whiteboard.empty",
    direction: "local",
    summary: "Whiteboard initialized. No agents saved yet.",
  },
];
```

---

## Baby Steps

Follow these in order:

1. Delete the `.gitkeep` file in `src/types/` (if present).
2. Create `src/types/scout.ts`. Copy the five type definitions above exactly as shown.
3. Delete the `.gitkeep` file in `src/mock/` (if present).
4. Create `src/mock/garage.ts`. Copy the mock data above exactly as shown.
5. In `page.tsx`, add `import { mockGarage, mockPeer, initialNetworkEvents } from "../mock/garage"` near the top.
6. In `page.tsx`, find where `"Ernest-Local"` or the Garage name is hardcoded. Replace it with `{mockGarage.name}`.
7. In `page.tsx`, find where `"Cape Kiwanda Mock Node"` is hardcoded. Replace it with `{mockPeer.name}`.
8. In `page.tsx`, find the hardcoded `networkEvents` array. Remove it and replace the reference with `initialNetworkEvents`.
9. Run `npm run build`. Fix any TypeScript errors before proceeding.

---

## Acceptance Criteria

- [ ] `src/types/scout.ts` exists and exports `GarageIdentity`, `PeerNode`, `ScoutQuery`, `AgentCandidate`, and `NetworkEvent`
- [ ] `src/mock/garage.ts` exists and exports `mockGarage`, `mockPeer`, `mockAgents` (array of 3), and `initialNetworkEvents` (array of 4)
- [ ] `mockGarage.address` is exactly `"0x1111111111111111111111111111111111111111"`
- [ ] `mockPeer.name` is exactly `"Cape Kiwanda Mock Node"`
- [ ] `mockPeer.address` is exactly `"0x2222222222222222222222222222222222222222"`
- [ ] All three agent candidates have at least two capability strings each
- [ ] `page.tsx` renders `mockGarage.name` (not a hardcoded string) in the Local Identity panel
- [ ] `page.tsx` renders `mockPeer.name` (not a hardcoded string) in the Peer field
- [ ] `npm run build` exits with code 0 — no TypeScript errors

---

## Out Of Scope

- Fetching data from an API
- LocalStorage
- Real wallet generation
- Real Ethereum addresses (mock hex strings are fine)
- Real signatures

---

## Verification

```bash
npm run build
# Expected: exits 0 with no TypeScript errors

npm run dev
# Open: http://localhost:3004
# Confirm: "Ernest's Garage" appears in the Local Identity panel
# Confirm: "Cape Kiwanda Mock Node" appears in the Peer field
# Confirm: 4 network events are visible in the Network Activity panel
```
