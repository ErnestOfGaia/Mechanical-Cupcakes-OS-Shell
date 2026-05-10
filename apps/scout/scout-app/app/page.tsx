"use client";

import { useState } from "react";
import {
  MOCK_GARAGE_IDENTITY,
  MOCK_PEER_NODE,
  MOCK_NETWORK_EVENTS,
} from "../src/mock/scoutData";
import { NetworkActivityLog } from "../src/components/scout/NetworkActivityLog";
import { WalkieTalkie } from "../src/components/scout/WalkieTalkie";
import { Whiteboard } from "../src/components/scout/Whiteboard";
import { AgentCandidate } from "../src/types/scout";
import { ScoutEnvelope, createScoutEnvelope } from "../src/lib/envelope";

import { NetworkEvent } from "../src/types/scout";

export default function GaragePage() {
  const [events, setEvents] = useState<NetworkEvent[]>(MOCK_NETWORK_EVENTS);
  const [candidates, setCandidates] = useState<AgentCandidate[]>([]);
  const [savedCandidates, setSavedCandidates] = useState<AgentCandidate[]>([]);

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

  const handleSaveCandidate = (candidate: AgentCandidate) => {
    if (savedCandidates.some(c => c.id === candidate.id)) {
      return;
    }
    setSavedCandidates(prev => [...prev, candidate]);

    const envelope = createScoutEnvelope({
      type: "whiteboard.agent.saved",
      sender: "loc_01HQX7ZK8P4F2T9B5X5W0A3V8N",
      recipient: "local",
      payload: { agentId: candidate.id, agentName: candidate.name },
    });

    const newEvent: NetworkEvent = {
      id: envelope.id,
      timestamp: envelope.timestamp,
      type: envelope.type,
      direction: "local" as const,
      summary: `Saved candidate: ${candidate.name}`,
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
              candidates={candidates}
              onSaveCandidate={handleSaveCandidate}
            />
          </div>

          <Whiteboard candidates={savedCandidates} />
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
