# ADR-003: Message Envelope For Garage v0.1

Status: draft

## Context

The project notes repeatedly identify a protocol envelope as a core building block. The local prototype needs message events that can appear in Network Activity and later evolve into real signed protocol messages.

## Proposed Decision

Use the draft `ScoutEnvelope<TPayload>` shape documented in `docs/protocol/message-envelope.md`.

Required fields:

- `version`
- `id`
- `type`
- `sender`
- `recipient`
- `timestamp`
- `payload`
- `signature`

## Consequences

- Network Activity can show meaningful protocol events from day one.
- UI state and future backend code can share the same conceptual message shape.
- v0.1 can use `signature: null` while preserving the field.

## Open Questions

- What fields are included in the signed payload?
- Are message type names centrally registered?
- Do future protocol messages need JSON Schema validation?

