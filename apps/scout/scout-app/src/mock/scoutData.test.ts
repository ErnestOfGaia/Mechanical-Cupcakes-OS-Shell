import { describe, it, expect } from "vitest";
import {
  MOCK_AGENT_CANDIDATES,
  MOCK_NETWORK_EVENTS,
  MOCK_PEER_NODE,
  MOCK_SCOUT_QUERY,
} from "./scoutData";

describe("mock scout data", () => {
  it("gives every candidate a unique id and ties it to the mock peer node", () => {
    expect(MOCK_AGENT_CANDIDATES.length).toBeGreaterThan(0);

    for (const candidate of MOCK_AGENT_CANDIDATES) {
      expect(candidate.nodeId).toBe(MOCK_PEER_NODE.id);
    }

    const ids = MOCK_AGENT_CANDIDATES.map((candidate) => candidate.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps the walkie events consistent with the query and the candidate list", () => {
    expect(MOCK_NETWORK_EVENTS.length).toBeGreaterThan(0);

    const walkieEvents = MOCK_NETWORK_EVENTS.filter((event) =>
      event.type.startsWith("walkie.")
    );
    expect(walkieEvents.length).toBeGreaterThan(0);

    for (const event of walkieEvents) {
      const payload = event.payload as { queryId: string };
      expect(payload.queryId).toBe(MOCK_SCOUT_QUERY.id);
    }

    const response = MOCK_NETWORK_EVENTS.find(
      (event) => event.type === "walkie.response.received"
    );
    const responsePayload = response?.payload as { candidateCount: number };
    expect(responsePayload.candidateCount).toBe(MOCK_AGENT_CANDIDATES.length);
  });
});
