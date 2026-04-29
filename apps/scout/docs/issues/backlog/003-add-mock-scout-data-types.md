# Issue: Add Mock Scout Data Types

Status: ready
Owner: unassigned
Suggested agent: Jules
GitHub issue: https://github.com/ErnestOfGaia/Mechanical-Cupcakes-OS-Shell/issues/2

## Goal

Add TypeScript types and deterministic mock data for Garage identity, peer node, agent candidates, scout queries, and network events.

## Context

Read these first:

- `docs/specs/garage-v0.1-local-prototype.md`
- `docs/protocol/message-envelope.md`
- `docs/decisions/ADR-002-local-identity-format.md`
- `docs/decisions/ADR-004-capability-taxonomy.md`

## Why This Matters

Before behavior is added, the app needs stable data shapes. These types become the shared language between UI, mock responses, and future protocol code.

## Baby Steps

1. Create a `types` location in `scout-app/src`.
2. Add the v0.1 data types from the local prototype spec.
3. Create a `mock` location in `scout-app/src`.
4. Add one local Garage identity.
5. Add one peer node.
6. Add at least three agent candidates.
7. Add a few sample Network Activity events.

## Acceptance Criteria

- [ ] Types exist for `GarageIdentity`, `PeerNode`, `ScoutQuery`, `AgentCandidate`, and `NetworkEvent`.
- [ ] Mock data uses deterministic IDs and mock Ethereum-style addresses.
- [ ] Agent candidates use capability strings like `code.review`.
- [ ] Mock data is clearly simulated.

## Out Of Scope

- Fetching data from an API.
- Local storage.
- Real wallet generation.
- Real signatures.

## Learning Note

This teaches TypeScript modeling: defining the nouns of the product before writing behavior.

## Verification

Import the mock data into the static Garage page and render at least one value from each mock object.
