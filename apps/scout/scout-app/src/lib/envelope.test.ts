import { describe, it, expect } from "vitest";
import { createScoutEnvelope } from "./envelope";

// createScoutEnvelope reaches for crypto.randomUUID() and new Date(), so these
// tests assert the envelope contract rather than any exact id or timestamp.
const params = {
  type: "walkie.query.sent",
  sender: "loc_01HQX7ZK8P4F2T9B5X5W0A3V8N",
  recipient: "peer_01HQX7ZK8P4F2T9B5X5W0A3V8P",
  payload: { capability: "code.review", mission: "Review the Garage UI." },
};

describe("createScoutEnvelope", () => {
  it("stamps the v0.1 protocol version and leaves the signature unsigned", () => {
    const envelope = createScoutEnvelope(params);

    expect(envelope.version).toBe("scout-protocol/0.1");
    expect(envelope.signature).toBeNull();
  });

  it("mints a non-empty unique id and a parseable ISO timestamp each call", () => {
    const first = createScoutEnvelope(params);
    const second = createScoutEnvelope(params);

    expect(typeof first.id).toBe("string");
    expect(first.id.length).toBeGreaterThan(0);
    expect(second.id).not.toBe(first.id);

    expect(Number.isNaN(Date.parse(first.timestamp))).toBe(false);
    expect(new Date(first.timestamp).toISOString()).toBe(first.timestamp);
  });

  it("passes type, sender, recipient and payload through unchanged", () => {
    const envelope = createScoutEnvelope(params);

    expect(envelope.type).toBe(params.type);
    expect(envelope.sender).toBe(params.sender);
    expect(envelope.recipient).toBe(params.recipient);
    expect(envelope.payload).toEqual(params.payload);
    expect(envelope.payload.mission).toBe("Review the Garage UI.");
  });
});
