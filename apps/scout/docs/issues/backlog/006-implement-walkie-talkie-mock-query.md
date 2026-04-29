# Issue: Implement Walkie Talkie Mock Query

Status: ready
Owner: unassigned
Suggested agent: Codex
GitHub issue: https://github.com/ErnestOfGaia/Mechanical-Cupcakes-OS-Shell/issues/5

## Goal

Make the Walkie Talkie panel interactive in simulated mode: user enters a mission, sends it, receives deterministic mock agent candidates, and sees Network Activity update.

## Context

Read these first:

- `docs/product/PRD-garage-v0.1.md`
- `docs/specs/garage-v0.1-local-prototype.md`
- `docs/protocol/message-envelope.md`
- `docs/issues/backlog/003-add-mock-scout-data-types.md`
- `docs/issues/backlog/004-build-network-activity-log.md`

## Why This Matters

This is the first true product loop. It lets Ernest use the Garage rather than only look at it.

## Baby Steps

1. Add editable mission text.
2. Add a send button.
3. On send, create a mock `ScoutQuery`.
4. Add a query-created event.
5. Add a query-sent event.
6. Return deterministic candidates from the mock peer node.
7. Add a response-received event.
8. Render candidate results.

## Acceptance Criteria

- [ ] User can type a mission.
- [ ] User can send the mission.
- [ ] Candidate results appear after sending.
- [ ] Network Activity records the interaction.
- [ ] The UI remains clearly labeled as simulated mode.

## Out Of Scope

- Real API routes.
- Real peer node process.
- Real latency.
- Real agent execution.
- Persistence.

## Learning Note

This teaches React state and product flow: an input changes state, a user action produces data, and the interface updates in response.

## Verification

Manual test in browser: type `Find code review agents`, send, confirm candidates and events appear.
