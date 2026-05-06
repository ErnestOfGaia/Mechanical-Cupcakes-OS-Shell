# ADR-002: Local Identity Format For Garage v0.1

Status: accepted for local prototype

## Context

Scout Protocol needs durable identities for garages, scouts, agents, and peer nodes. Long-term options include Ethereum addresses, DIDs, or protocol-native public keys. The local prototype needs identifiers that look realistic without requiring wallet generation.

## Decision

Garage v0.1 will use deterministic mock Ethereum-style addresses and readable IDs.

Example:

```json
{
  "id": "garage.local.ernest",
  "name": "Ernest's Garage",
  "address": "0x1111111111111111111111111111111111111111"
}
```

Signatures may be `null` or set to a clearly fake value such as `mock-signature`.

## Consequences

- UI and message envelopes can be designed around identity fields now.
- No wallet, mnemonic, or key management is needed for v0.1.
- The app must label these identities as simulated.
- A future ADR must choose the real identity scheme before networked testing.

## Alternatives Considered

- Real Ethereum wallet generation: too much security surface for v0.1.
- DID strings: plausible long term, but less aligned with near-term Arbitrum settlement notes.
- UUID-only identities: simple, but does not exercise address-shaped UI and protocol fields.

