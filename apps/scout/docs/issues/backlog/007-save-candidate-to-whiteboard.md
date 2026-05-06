# Issue: Save Candidate To Whiteboard

Status: ready
Owner: unassigned
Suggested agent: Jules
GitHub issue: https://github.com/ErnestOfGaia/Mechanical-Cupcakes-OS-Shell/issues/6

## Goal

Let the user save an agent candidate from query results to the Whiteboard in local simulated state.

## Context

Read these first:

- `docs/product/PRD-garage-v0.1.md`
- `docs/product/user-journeys.md`
- `docs/specs/garage-v0.1-local-prototype.md`

## Why This Matters

Saving a candidate completes the v0.1 discovery loop. It turns returned results into something the user keeps and can inspect.

## Baby Steps

1. Add a save action to each candidate result.
2. Store saved candidates in local React state.
3. Render saved candidates in the Whiteboard area.
4. Prevent duplicate saved candidates.
5. Add a `whiteboard.agent.saved` Network Activity event.

## Acceptance Criteria

- [ ] User can save a candidate.
- [ ] Saved candidate appears on the Whiteboard.
- [ ] Duplicate saves are handled gracefully.
- [ ] Network Activity records the save.
- [ ] State can reset on page refresh for v0.1.

## Out Of Scope

- Persistent storage.
- Public storefront publishing.
- Editing saved agents.
- Pricing changes.

## Learning Note

This teaches local state shared across UI sections and shows how a product loop reaches a satisfying endpoint.

## Verification

Manual test in browser: send a query, save one candidate, confirm it appears on the Whiteboard and creates an activity event.
