# Spec: Garage v0.1 Local Prototype

Status: draft

## Scope

Garage v0.1 is a local browser prototype for the Walkie Talkie discovery loop.

The prototype uses deterministic mock data and local UI state. It does not require external APIs, blockchain RPC, Mastra, Docker, or a VPS.

## App Surface

- Garage Home
- Walkie Talkie
- Candidate Results
- Whiteboard
- Network Activity

## Data Types

### GarageIdentity

```ts
type GarageIdentity = {
  id: string;
  name: string;
  address: string;
  mode: "simulated" | "local" | "networked";
};
```

### PeerNode

```ts
type PeerNode = {
  id: string;
  name: string;
  address: string;
  status: "online" | "offline" | "unknown";
};
```

### ScoutQuery

```ts
type ScoutQuery = {
  id: string;
  capability: string;
  mission: string;
  maxBudgetGaia?: number;
  maxLatencyMs?: number;
  createdAt: string;
};
```

### AgentCandidate

```ts
type AgentCandidate = {
  id: string;
  name: string;
  nodeId: string;
  capabilities: string[];
  reputation: number;
  priceGaiaPerCall: number;
  averageLatencyMs: number;
  summary: string;
};
```

### NetworkEvent

```ts
type NetworkEvent = {
  id: string;
  timestamp: string;
  type: string;
  direction: "local" | "outbound" | "inbound";
  summary: string;
  payload: unknown;
};
```

## Required Behaviors

- The app initializes with one simulated local Garage identity.
- The app initializes with one simulated peer node.
- Sending a Walkie Talkie query creates a `ScoutQuery`.
- Sending a query appends Network Activity events.
- The mock peer returns deterministic `AgentCandidate` results.
- Results render as scannable candidate cards or rows.
- Saving a candidate adds it to the Whiteboard.
- Saving a candidate appends a Network Activity event.

## Suggested Event Types

- `garage.started`
- `walkie.query.created`
- `walkie.query.sent`
- `walkie.response.received`
- `whiteboard.agent.saved`
- `walkie.query.failed`

## Persistence

Use in-memory state for the first version. Local storage can be added later if the flow feels useful.

## Test Plan

- Unit test mock query response generation.
- Unit test message envelope creation when available.
- Manual UI test: send query, receive candidates, save one, inspect Network Activity.
- Manual refresh test: confirm state reset is acceptable for v0.1.

