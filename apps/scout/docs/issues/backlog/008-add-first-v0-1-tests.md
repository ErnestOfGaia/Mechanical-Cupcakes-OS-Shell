# Issue: Add First v0.1 Tests

Status: draft
Owner: unassigned
Suggested agent: Codex
GitHub issue: https://github.com/ErnestOfGaia/Mechanical-Cupcakes-OS-Shell/issues/7

## Goal

Add the first small automated tests for pure v0.1 logic, such as mock response generation and message envelope creation.

## Context

Read these first:

- `docs/specs/garage-v0.1-local-prototype.md`
- `docs/protocol/message-envelope.md`
- `docs/issues/backlog/005-create-message-envelope-utility.md`
- `docs/issues/backlog/006-implement-walkie-talkie-mock-query.md`

## Why This Matters

Tests help keep the prototype stable as Codex, Jules, and Ernest each make small changes over time.

## Baby Steps

1. Inspect the existing package setup.
2. Choose the smallest test runner that fits the project.
3. Add a test for envelope creation.
4. Add a test for deterministic mock candidate results.
5. Document the test command.

## Acceptance Criteria

- [ ] A test command exists.
- [ ] At least one envelope utility test exists.
- [ ] At least one mock response test exists.
- [ ] Tests run locally.

## Out Of Scope

- Full browser automation.
- Snapshot-heavy UI tests.
- End-to-end test suite.
- CI setup.

## Learning Note

This teaches why we test pure logic first: it is faster, clearer, and less fragile than starting with full UI automation.

## Verification

Run the documented test command and confirm tests pass.
