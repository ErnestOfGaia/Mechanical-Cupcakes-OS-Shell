# Issue: Create Message Envelope Utility

Status: ready
Owner: unassigned
Suggested agent: Jules
GitHub issue: https://github.com/ErnestOfGaia/Mechanical-Cupcakes-OS-Shell/issues/4

**Depends on:** Issue 003 (you need the `GarageIdentity` / `PeerNode` shapes for context)

---

## Goal

Create a pure TypeScript utility that wraps any payload in the Scout Protocol envelope shape.
This is a pure function — no React, no UI, no side effects.

---

## Context

The Scout Protocol's message envelope is the foundational protocol primitive. Every message
between nodes — discovery queries, candidate responses, agreements — will eventually use this
shape. In v0.1 it is used by Issue 006 to log events with the correct structure.

The envelope comes from Freedom Browser's `ipc-contract.js` pattern. In v0.1 there is no
real signing — `signature` is always `null`.

---

## Files

```
Create:
  scout-app/src/lib/envelope.ts

No other files need to be modified.
```

---

## Types and Function to Implement

Copy this **exactly** into `src/lib/envelope.ts`:

```typescript
// src/lib/envelope.ts

export type ScoutEnvelope<TPayload> = {
  version: "scout-protocol/0.1";
  id: string;
  type: string;
  sender: {
    id: string;
    address: string;
  };
  recipient: {
    id: string;
    address: string;
  };
  timestamp: string; // ISO 8601
  payload: TPayload;
  signature: string | null;
};

export function createEnvelope<TPayload>(params: {
  type: string;
  sender: { id: string; address: string };
  recipient: { id: string; address: string };
  payload: TPayload;
}): ScoutEnvelope<TPayload> {
  return {
    version: "scout-protocol/0.1",
    id: crypto.randomUUID(),
    type: params.type,
    sender: params.sender,
    recipient: params.recipient,
    timestamp: new Date().toISOString(),
    payload: params.payload,
    signature: null,
  };
}
```

### Implementation rules

- `version`: must be the exact string literal `"scout-protocol/0.1"` — TypeScript enforces this via the type
- `id`: use `crypto.randomUUID()` — available in all modern browsers and Node 19+
- `timestamp`: `new Date().toISOString()` — produces a valid ISO 8601 string
- `signature`: always `null` for v0.1 — no exceptions
- Do not add any other logic — this function is intentionally minimal

---

## Baby Steps

1. Create `src/lib/envelope.ts`.
2. Copy the `ScoutEnvelope<TPayload>` type definition above into the file exactly as shown.
3. Copy the `createEnvelope` function above into the file exactly as shown.
4. Export both `ScoutEnvelope` and `createEnvelope`.
5. Run `npm run build` — confirm no TypeScript errors.
6. To manually verify: temporarily add the following to `page.tsx`, open the browser, and check the console:

```typescript
// Temporary — add near the top of page.tsx, remove after verifying
import { createEnvelope } from "../lib/envelope";
import { mockGarage, mockPeer } from "../mock/garage";

const testEnvelope = createEnvelope({
  type: "discovery.query",
  sender: { id: mockGarage.id, address: mockGarage.address },
  recipient: { id: mockPeer.id, address: mockPeer.address },
  payload: { mission: "test query" },
});
console.log("envelope:", testEnvelope);
```

7. Open http://localhost:3004, open browser DevTools → Console.
8. Confirm the logged envelope has all 8 fields and `signature` is `null`.
9. Remove the temporary import and `console.log` before moving on.
10. Run `npm run build` again to confirm it is still clean.

---

## Acceptance Criteria

- [ ] `src/lib/envelope.ts` exists and exports `ScoutEnvelope` and `createEnvelope`
- [ ] `createEnvelope` returns an object with exactly these fields: `version`, `id`, `type`, `sender`, `recipient`, `timestamp`, `payload`, `signature`
- [ ] `version` is typed as the string literal `"scout-protocol/0.1"` (TypeScript should reject any other string)
- [ ] `signature` is `null` — never a string in v0.1
- [ ] `id` is a non-empty string in UUID format (e.g. `"550e8400-e29b-41d4-a716-446655440000"`)
- [ ] `timestamp` is a valid ISO 8601 string (e.g. `"2025-05-04T12:00:00.000Z"`)
- [ ] Two calls to `createEnvelope` with the same params return envelopes with **different** `id` values
- [ ] `npm run build` exits with code 0

---

## Out Of Scope

- Real cryptographic signing
- Wallet integration
- Network transport
- JSON Schema validation of the payload
- Message type registry or validation

---

## Verification

```bash
npm run build
# Expected: exits 0, no TypeScript errors

# Manual verification:
npm run dev
# Open: http://localhost:3004
# Open browser DevTools → Console
# Paste the temporary import block from Baby Step 6 into page.tsx
# Confirm: console shows envelope with all 8 fields
# Confirm: signature is null
# Confirm: id is a UUID string
# Remove the temporary code before committing
```
