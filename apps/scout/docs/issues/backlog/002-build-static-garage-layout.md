# Issue: Build Static Garage Layout

Status: ready
Owner: unassigned
Suggested agent: Jules
GitHub issue: https://github.com/ErnestOfGaia/Mechanical-Cupcakes-OS-Shell/issues/1

## Goal

Build a static Garage v0.1 screen using mock information. The screen should show local Garage status, the Walkie Talkie tool area, a Whiteboard area, and a Network Activity area.

## Context

Read these first:

- `docs/product/PRD-garage-v0.1.md`
- `docs/design/interface-principles.md`
- `docs/specs/garage-v0.1-local-prototype.md`

## Why This Matters

This turns the product idea into something visible without requiring interaction or backend logic. It is the first screen Ernest can react to and reshape.

## Baby Steps

1. Create a simple page layout for Garage v0.1.
2. Add a status section showing simulated local Garage identity.
3. Add a Walkie Talkie panel with a disabled or non-functional input area.
4. Add a Whiteboard panel with empty-state text.
5. Add a Network Activity panel with a few static mock events.

## Acceptance Criteria

- [ ] The page visually communicates "Garage v0.1".
- [ ] Simulated mode is visible.
- [ ] There is a clear Walkie Talkie area.
- [ ] There is a clear Whiteboard area.
- [ ] There is a clear Network Activity area.
- [ ] No interactive behavior is required.

## Out Of Scope

- Sending queries.
- Saving agents.
- Real message envelopes.
- API routes.
- Persistent state.

## Learning Note

This teaches how a product spec becomes a screen layout. It also teaches the value of making a fake-but-visible prototype before adding behavior.

## Verification

Run the app locally and visually inspect the page at `http://localhost:3004`.
