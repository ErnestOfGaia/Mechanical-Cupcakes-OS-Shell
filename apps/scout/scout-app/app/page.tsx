"use client";

import { useState } from "react";
import {
  MOCK_GARAGE_IDENTITY,
  MOCK_PEER_NODE,
  MOCK_NETWORK_EVENTS,
} from "../src/mock/scoutData";
import { NetworkActivityLog } from "../src/components/scout/NetworkActivityLog";
import { WalkieTalkie } from "../src/components/scout/WalkieTalkie";
import { AgentCandidate } from "../src/types/scout";
import { ScoutEnvelope } from "../src/lib/envelope";

import { NetworkEvent } from "../src/types/scout";

export default function GaragePage() {
  const [events, setEvents] = useState<NetworkEvent[]>(MOCK_NETWORK_EVENTS);
  const [candidates, setCandidates] = useState<AgentCandidate[]>([]);

  const handleQuerySent = (envelope: ScoutEnvelope<Record<string, unknown>>) => {
    const newEvent: NetworkEvent = {
      id: envelope.id,
      timestamp: envelope.timestamp,
      type: envelope.type,
      direction: "outbound" as const,
      summary: `Query sent for mission: "${envelope.payload.mission}"`,
      payload: envelope.payload,
    };
    setEvents((prev) => [newEvent, ...prev]);
  };

  const handleResultsReceived = (results: AgentCandidate[]) => {
    setCandidates(results);
    const newEvent: NetworkEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: "walkie.response.received",
      direction: "inbound" as const,
      summary: `Received ${results.length} candidates.`,
      payload: { candidateCount: results.length },
    };
    setEvents((prev) => [newEvent, ...prev]);
  };

  return (
    <>
      <header className="top-bar">
        <div className="brand-lockup">
          <h1>Scout Protocol</h1>
        </div>
        <div className="top-actions">
          <span className="mode-badge">[MODE: SIMULATED]</span>
        </div>
      </header>

      <div className="garage-workspace">
        <div className="primary-column">
          <div className="top-grid">
            {/* Local Identity */}
            <div className="module">
              <div className="module-heading">
                <h2>Local Identity</h2>
                <div className="status-light" />
              </div>
              <div className="console-card identity-card">
                <dl className="identity-grid">
                  <dt>Name</dt>
                  <dd>{MOCK_GARAGE_IDENTITY.name}</dd>
                  <dt>Address</dt>
                  <dd>{MOCK_GARAGE_IDENTITY.address}</dd>
                  <dt>Mode</dt>
                  <dd>{MOCK_GARAGE_IDENTITY.mode}</dd>
                </dl>
              </div>
            </div>

            {/* Peer Node */}
            <div className="module">
              <div className="module-heading">
                <h2>Peer Node</h2>
              </div>
              <div className="console-card identity-card">
                <dl className="identity-grid">
                  <dt>Name</dt>
                  <dd>{MOCK_PEER_NODE.name}</dd>
                  <dt>Status</dt>
                  <dd>{MOCK_PEER_NODE.status}</dd>
                  <dt>Address</dt>
                  <dd>{MOCK_PEER_NODE.address}</dd>
                </dl>
              </div>
            </div>
          </div>

          {/* Walkie Talkie */}
          <div className="module">
            <div className="module-heading">
              <h2>Walkie Talkie</h2>
            </div>
            <WalkieTalkie
              onQuerySent={handleQuerySent}
              onResultsReceived={handleResultsReceived}
            />
          </div>

          {/* Agent Candidates */}
          <div className="module">
            <div className="module-heading split-heading">
              <h2>Agent Candidates</h2>
            </div>
            <div className="console-card">
              <div className="console-body">
                {candidates.length === 0 && (
                  <p style={{ color: "var(--muted)", fontSize: "13px", fontStyle: "italic" }}>
                    No candidates found. Transmit a query to begin discovery.
                  </p>
                )}
                {candidates.map((candidate) => (
                  <div key={candidate.id} style={{ marginBottom: "1rem" }}>
                    <p className="field-label">Agent</p>
                    <p style={{ color: "var(--blue)", fontWeight: 700, marginTop: "12px" }}>
                      {candidate.name}
                    </p>
                    <p style={{ color: "var(--text-soft)", fontSize: "13px", marginTop: "6px" }}>
                      {candidate.summary}
                    </p>
                    <p style={{ color: "var(--muted)", fontSize: "12px", marginTop: "4px" }}>
                      Reputation: {candidate.reputation} &nbsp;·&nbsp;{" "}
                      {candidate.priceGaiaPerCall} GAIA/call &nbsp;·&nbsp;{" "}
                      {candidate.averageLatencyMs}ms avg
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Network Activity */}
        <div className="module activity-module">
          <div className="module-heading">
            <h2>Network Activity</h2>
          </div>
          <div className="console-card activity-card">
            <NetworkActivityLog events={events} />
            <footer className="activity-footer">
              <span>{events.length} events</span>
            </footer>
          </div>
        </div>
      </div>
    </>
  );
}
