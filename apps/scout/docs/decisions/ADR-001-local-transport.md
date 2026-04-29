# ADR-001: Local Transport For Garage v0.1

Status: accepted for local prototype

## Context

Scout Protocol will eventually need real peer-to-peer or federated node communication. The notes discuss gossip, HTTP polling, libp2p, and other approaches. For the first local prototype, the goal is to test the product loop, not the network layer.

## Decision

Garage v0.1 will use an in-process simulated peer node and deterministic mock responses.

No real gossip, libp2p, WebSocket mesh, blockchain RPC, or remote node transport is required for v0.1.

## Consequences

- The prototype can be built and tested locally without network setup.
- The UI can prove the Walkie Talkie interaction before transport complexity is introduced.
- Network Activity will show simulated events, clearly labeled.
- A later ADR must choose real transport for multi-node testing.

## Alternatives Considered

- HTTP server for a mock node: useful soon, but not necessary for the first UI loop.
- WebSocket mock transport: closer to live updates, but adds premature complexity.
- libp2p/gossipsub: too heavy for v0.1.

