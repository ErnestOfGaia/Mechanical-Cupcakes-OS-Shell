# Issue: Build Network Activity Log

Status: ready
Owner: unassigned
Suggested agent: Jules
GitHub issue: https://github.com/ErnestOfGaia/Mechanical-Cupcakes-OS-Shell/issues/3

## Goal

Create a reusable Network Activity component that displays a list of `NetworkEvent` records.

## Context

Read these first:

- `docs/specs/garage-v0.1-local-prototype.md`
- `docs/protocol/message-envelope.md`
- `docs/design/interface-principles.md`

## Why This Matters

Network Activity is the debugging window into Scout. It helps Ernest understand what the app is doing and later helps diagnose real protocol behavior.

## Baby Steps

1. Create a Network Activity component.
2. Accept a list of `NetworkEvent` items as props.
3. Render timestamp, event type, direction, and summary.
4. Make outbound, inbound, and local events visually distinguishable.
5. Add an empty state for no events.

## Acceptance Criteria

- [ ] Component renders multiple mock events.
- [ ] Event direction is visible.
- [ ] Event type is visible.
- [ ] Empty state exists.
- [ ] Component does not own global app state.

## Out Of Scope

- Live streaming.
- WebSockets.
- Real network transport.
- Filtering/searching events.

## Learning Note

This teaches component props and why debugging surfaces are product features, not afterthoughts.

## Verification

Render the component on the Garage page with mock events and inspect it in the browser.
