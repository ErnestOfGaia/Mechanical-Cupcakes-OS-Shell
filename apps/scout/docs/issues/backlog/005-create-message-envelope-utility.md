# Issue: Create Message Envelope Utility

Status: ready
Owner: unassigned
Suggested agent: Jules
GitHub issue: https://github.com/ErnestOfGaia/Mechanical-Cupcakes-OS-Shell/issues/4

## Goal

Create a small utility that wraps a payload in the draft Scout message envelope shape.

## Context

Read these first:

- `docs/protocol/message-envelope.md`
- `docs/decisions/ADR-003-message-envelope.md`
- `docs/specs/garage-v0.1-local-prototype.md`

## Why This Matters

The envelope is the beginning of the protocol. Even in simulated mode, using a consistent envelope makes the Network Activity log and future backend work easier to understand.

## Baby Steps

1. Add a `ScoutEnvelope` type if it does not already exist.
2. Create a helper function like `createEnvelope`.
3. Require message type, sender, recipient, and payload.
4. Generate a message ID and timestamp.
5. Use `version: "scout-protocol/0.1"`.
6. Use `signature: null` for v0.1.

## Acceptance Criteria

- [ ] Utility creates a valid envelope object.
- [ ] Envelope includes version, id, type, sender, recipient, timestamp, payload, and signature.
- [ ] Signature is `null` in simulated mode.
- [ ] No cryptographic signing is added.

## Out Of Scope

- Real signatures.
- Wallet integration.
- Network transport.
- JSON Schema validation.

## Learning Note

This teaches how protocols often start: wrap plain data in metadata so messages can be routed, inspected, versioned, and eventually signed.

## Verification

Call the utility with a mock discovery payload and display or log the resulting envelope in a local test or temporary UI.
