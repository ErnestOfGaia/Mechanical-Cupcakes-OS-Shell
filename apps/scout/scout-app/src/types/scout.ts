export type GarageIdentity = {
  id: string;
  name: string;
  address: string;
  mode: "simulated" | "local" | "networked";
};

export type PeerNode = {
  id: string;
  name: string;
  address: string;
  status: "online" | "offline" | "unknown";
};

export type ScoutQuery = {
  id: string;
  capability: string;
  mission: string;
  maxBudgetGaia?: number;
  maxLatencyMs?: number;
  createdAt: string;
};

export type AgentCandidate = {
  id: string;
  name: string;
  nodeId: string;
  capabilities: string[];
  reputation: number;
  priceGaiaPerCall: number;
  averageLatencyMs: number;
  summary: string;
};

export type NetworkEvent = {
  id: string;
  timestamp: string;
  type: string;
  direction: "local" | "outbound" | "inbound";
  summary: string;
  payload: unknown;
};
