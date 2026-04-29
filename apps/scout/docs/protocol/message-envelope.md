# Protocol Note: Message Envelope

Status: draft

The local prototype should use the same general message shape that future Scout network messages can grow into. Signatures can be placeholders in v0.1.

## Draft Envelope

```ts
type ScoutEnvelope<TPayload> = {
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
  timestamp: string;
  payload: TPayload;
  signature: string | null;
};
```

## v0.1 Rules

- `version` is required.
- `id` is unique per message.
- `type` uses dot notation, such as `discovery.query`.
- `timestamp` is ISO 8601.
- `signature` may be `null` while identity is simulated.
- Payloads should be plain JSON.

## Open Questions

- Whether signatures should cover the whole envelope or only the payload.
- Whether addresses should be Ethereum addresses, DIDs, or protocol-native public key hashes.
- Whether message types should be centrally registered or convention-based.

