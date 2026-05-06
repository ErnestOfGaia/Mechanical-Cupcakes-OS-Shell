# Issue: Build Network Activity Log

Status: ready
Owner: unassigned
Suggested agent: Jules
GitHub issue: https://github.com/ErnestOfGaia/Mechanical-Cupcakes-OS-Shell/issues/3

**Depends on:** Issue 003 (you need the `NetworkEvent` type)

---

## Goal

Extract the Network Activity panel out of `page.tsx` into a standalone React component
that accepts `NetworkEvent` records as props. The page should look identical before and
after this change.

---

## Context

The current `page.tsx` renders a hardcoded `<aside>` with an inline `<ol>` for network
events. This issue refactors it into a reusable `NetworkActivityLog` component so that
later issues (006, 007) can pass dynamic state to it as a prop.

Network Activity is a first-class product feature — it is how Ernest understands what the
protocol is doing. Every direction (local, outbound, inbound) must be visually distinct.

---

## Files

```
Create:
  scout-app/src/components/NetworkActivityLog.tsx

Modify:
  scout-app/src/app/page.tsx        — replace inline <ol> with <NetworkActivityLog />
  scout-app/src/app/globals.css     — add direction CSS classes (see below)
```

---

## Component to Implement

```typescript
// src/components/NetworkActivityLog.tsx
import type { NetworkEvent } from "../types/scout";

type Props = {
  events: NetworkEvent[];
};

export function NetworkActivityLog({ events }: Props) {
  // When events is empty: render empty state paragraph
  // When events has items: render an <ol> with one <li> per event
}
```

### Rendering rules

**Empty state** (when `events.length === 0`):
```tsx
<p className="activity-empty">No network events yet.</p>
```

**Event list** (when `events.length > 0`):
```tsx
<ol className="activity-feed" aria-label="Network activity events">
  {events.map((event) => (
    <li key={event.id} className="activity-event">
      <span className="event-time">{formatTime(event.timestamp)}</span>
      <span className={`event-type direction-${event.direction}`}>{event.type}</span>
      <span className="event-summary">{event.summary}</span>
    </li>
  ))}
</ol>
```

Use a local `formatTime` helper that formats an ISO timestamp as `HH:MM:SS`:
```typescript
function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", { hour12: false });
}
```

### CSS classes to add in `globals.css`

The existing `globals.css` already has `.activity-feed`, `.activity-event`, `.event-type`,
and `.event-summary`. You only need to **add** the three direction classes using the existing
CSS variable palette:

```css
/* Add these three classes to globals.css */
.direction-local    { color: var(--amber); }
.direction-outbound { color: var(--blue); }
.direction-inbound  { color: var(--green); }
```

Also add the empty state class if it is not already there:
```css
.activity-empty {
  color: var(--muted);
  font-size: 0.85rem;
  padding: 1rem 0;
}
```

---

## Integration into page.tsx

Find the existing `<aside>` block in `page.tsx` that contains the `<ol className="activity-feed">`.
Replace the entire `<ol>` (and its children) with:

```tsx
import { NetworkActivityLog } from "../components/NetworkActivityLog";
import { initialNetworkEvents } from "../mock/garage";

// In the JSX where the <ol> was:
<NetworkActivityLog events={initialNetworkEvents} />
```

Note: in Issue 006 you will replace `initialNetworkEvents` with a `useState` variable.
For now, pass the static import — the prop signature is what matters.

---

## Baby Steps

1. Create `src/components/NetworkActivityLog.tsx` with the component signature above.
2. Add the `formatTime` helper function (not exported — private to the file).
3. Implement the empty state branch: if `events.length === 0`, return the `<p>` element.
4. Implement the list branch: map over `events` and render each with time, type, and summary.
5. Apply `direction-${event.direction}` to the event type span (this creates the color coding).
6. Open `globals.css` and add the three direction classes and the `.activity-empty` class.
7. In `page.tsx`, add the import for `NetworkActivityLog`.
8. In `page.tsx`, replace the inline `<ol>` block with `<NetworkActivityLog events={initialNetworkEvents} />`.
9. Open the browser and confirm the Network Activity panel looks identical to before.
10. Temporarily change the prop to `events={[]}` and confirm the empty state text appears.
11. Revert to `events={initialNetworkEvents}` and run `npm run build`.

---

## Acceptance Criteria

- [ ] `src/components/NetworkActivityLog.tsx` exists and exports `NetworkActivityLog`
- [ ] Component accepts only `events: NetworkEvent[]` as props — no other props
- [ ] When events array is empty, a `<p>` with text "No network events yet." is rendered
- [ ] When events array has items, each item shows timestamp, event type, and summary text
- [ ] `direction-local`, `direction-outbound`, and `direction-inbound` produce visually distinct colors
- [ ] `page.tsx` no longer contains the inline `<ol className="activity-feed">` block
- [ ] The Network Activity panel in the browser looks identical to before this change
- [ ] `npm run build` exits with code 0

---

## Out Of Scope

- Live streaming
- WebSockets or real network transport
- Filtering or searching events
- Timestamps in any format other than HH:MM:SS

---

## Verification

```bash
npm run build
# Expected: exits 0

npm run dev
# Open: http://localhost:3004
# Confirm: Network Activity panel shows all 4 mock events with timestamps
# Confirm: Event types are color-coded (amber for local, blue for outbound, green for inbound)
# Confirm: Temporarily passing events={[]} shows "No network events yet." text
```
