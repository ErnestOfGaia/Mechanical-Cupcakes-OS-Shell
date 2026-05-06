import {
  AgentCandidate,
  GarageIdentity,
  NetworkEvent,
  PeerNode,
  ScoutQuery,
} from "../types/scout";

const HARDCODED_DATE = "2026-05-06T12:00:00.000Z";

export const MOCK_GARAGE_IDENTITY: GarageIdentity = {
  id: "loc_01HQX7ZK8P4F2T9B5X5W0A3V8N",
  name: "Local Garage Alpha",
  address: "0x1234567890123456789012345678901234567890",
  mode: "simulated",
};

export const MOCK_PEER_NODE: PeerNode = {
  id: "peer_01HQX7ZK8P4F2T9B5X5W0A3V8P",
  name: "Scout Relay Beta",
  address: "0x0987654321098765432109876543210987654321",
  status: "online",
};

export const MOCK_SCOUT_QUERY: ScoutQuery = {
  id: "query_01HQX7ZK8P4F2T9B5X5W0A3V8Q",
  capability: "code.review",
  mission: "Review the new Garage UI components for accessibility and performance.",
  maxBudgetGaia: 5.0,
  maxLatencyMs: 2000,
  createdAt: HARDCODED_DATE,
};

export const MOCK_AGENT_CANDIDATES: AgentCandidate[] = [
  {
    id: "agent_01HQX7ZK8P4F2T9B5X5W0A3V8R",
    name: "Optimus Reviewer",
    nodeId: MOCK_PEER_NODE.id,
    capabilities: ["code.review", "code.test"],
    reputation: 98,
    priceGaiaPerCall: 0.5,
    averageLatencyMs: 1200,
    summary: "Fast and reliable code review agent with high reputation.",
  },
  {
    id: "agent_01HQX7ZK8P4F2T9B5X5W0A3V8S",
    name: "Bug Squasher 3000",
    nodeId: MOCK_PEER_NODE.id,
    capabilities: ["code.review", "security.audit"],
    reputation: 85,
    priceGaiaPerCall: 1.0,
    averageLatencyMs: 1800,
    summary: "Specializes in deep security audits and bug finding.",
  },
  {
    id: "agent_01HQX7ZK8P4F2T9B5X5W0A3V8T",
    name: "Linting Larry",
    nodeId: MOCK_PEER_NODE.id,
    capabilities: ["code.review"],
    reputation: 72,
    priceGaiaPerCall: 0.1,
    averageLatencyMs: 500,
    summary: "Cheap and fast, focuses on syntax and linting.",
  }
];

export const MOCK_NETWORK_EVENTS: NetworkEvent[] = [
  {
    id: "evt_01HQX7ZK8P4F2T9B5X5W0A3V8U",
    timestamp: HARDCODED_DATE,
    type: "garage.started",
    direction: "local",
    summary: "Garage node started in simulated mode.",
    payload: { version: "0.1.0", identity: MOCK_GARAGE_IDENTITY.id },
  },
  {
    id: "evt_01HQX7ZK8P4F2T9B5X5W0A3V8V",
    timestamp: HARDCODED_DATE,
    type: "walkie.query.sent",
    direction: "outbound",
    summary: `Query sent to ${MOCK_PEER_NODE.name}.`,
    payload: { queryId: MOCK_SCOUT_QUERY.id, to: MOCK_PEER_NODE.id },
  },
  {
    id: "evt_01HQX7ZK8P4F2T9B5X5W0A3V8W",
    timestamp: HARDCODED_DATE,
    type: "walkie.response.received",
    direction: "inbound",
    summary: `Received 3 candidates from ${MOCK_PEER_NODE.name}.`,
    payload: { queryId: MOCK_SCOUT_QUERY.id, from: MOCK_PEER_NODE.id, candidateCount: MOCK_AGENT_CANDIDATES.length },
  }
];
