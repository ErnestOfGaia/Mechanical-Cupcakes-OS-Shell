# Scout Protocol Guide

## Build & Run
- `npm run dev`: Start Garage UI (localhost:3000).
- `npm run node:start`: Start local Garage Node service.
- `npm run build`: Build production artifacts.

## Architecture Guidelines
- **Porting Logic**: Prioritize reusing logic from `identity/vault.js` and `wallet/transaction-service.js`.
- **UI State**: Use Framer Motion for the "Bus Stop" animations and state transitions.
- **Protocol**: All inter-node messages must follow the `ipc-contract.js` envelope pattern.

## Design Identity
- **Visuals**: Mission Control / Garage vibe.
- **Constraints**: Maintain decentralized architecture — no hardcoded central discovery servers.
