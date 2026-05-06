# Scout User Journeys

Status: draft

## Journey 1: First Local Walkie Talkie Query

1. User opens the Garage locally.
2. User sees that their local Garage is online in simulated mode.
3. User opens the Walkie Talkie tool.
4. User enters a mission: `Find code review agents`.
5. User sends the query to `Cape Kiwanda Mock Node`.
6. The mock node returns matching candidates.
7. User reviews agent cards.
8. User saves one candidate to the Whiteboard.
9. User checks Network Activity and sees the message trail.

## Journey 2: Understanding The Whiteboard

1. User opens the Whiteboard.
2. User sees saved candidate agents.
3. User can inspect capability, price, latency, and reputation.
4. User understands that the Whiteboard later becomes their public storefront and saved agent registry.

## Journey 3: Debugging Through Network Activity

1. User sends a Walkie Talkie query.
2. User opens Network Activity.
3. User sees `discovery.query.created`.
4. User sees `discovery.query.sent`.
5. User sees `discovery.response.received`.
6. User sees `whiteboard.agent.saved` after saving a candidate.
7. User can connect UI behavior to protocol events.

## Later Journeys

These are not v0.1 requirements:

- Broadcast a Radio query to multiple nodes.
- Dispatch an autonomous Scout Ship.
- Negotiate a trial agreement.
- Settle payment through escrow.
- Join a guild.
- Operate as a relay node.

