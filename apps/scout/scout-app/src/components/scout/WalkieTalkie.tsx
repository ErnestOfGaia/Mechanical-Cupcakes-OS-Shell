"use client";

import React, { useState } from "react";
import { ScoutEnvelope, createScoutEnvelope } from "../../lib/envelope";
import { AgentCandidate } from "../../types/scout";
import { MOCK_AGENT_CANDIDATES } from "../../mock/scoutData";

interface WalkieTalkieProps {
  onQuerySent: (envelope: ScoutEnvelope<Record<string, unknown>>) => void;
  onResultsReceived: (candidates: AgentCandidate[]) => void;
  candidates?: AgentCandidate[];
  onSaveCandidate?: (candidate: AgentCandidate) => void;
}

export const WalkieTalkie: React.FC<WalkieTalkieProps> = ({ onQuerySent, onResultsReceived, candidates = [], onSaveCandidate }) => {
  const [mission, setMission] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mission.trim()) return;

    // Create the mock outbound event envelope
    const envelope = createScoutEnvelope({
      type: "walkie.query.sent",
      sender: "loc_01HQX7ZK8P4F2T9B5X5W0A3V8N", // Local Garage Alpha ID
      recipient: "network",
      payload: { mission },
    });

    onQuerySent(envelope);

    // Simulate finding candidates
    onResultsReceived(MOCK_AGENT_CANDIDATES);

    setMission("");
  };

  return (
    <div className="walkie-card">
      <div className="console-body">
        <label className="field-label" htmlFor="mission-input">
          MISSION PARAMETERS
        </label>
        <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            id="mission-input"
            className="mission-input"
            type="text"
            value={mission}
            onChange={(e) => setMission(e.target.value)}
            placeholder="Describe the agent mission..."
          />
          <div className="console-footer">
            <button className="send-button" type="submit" disabled={!mission.trim()}>
              TRANSMIT QUERY
            </button>
          </div>
        </form>
      </div>

      {candidates.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <div className="module-heading split-heading">
            <h2>Agent Candidates</h2>
          </div>
          <div className="console-card">
            <div className="console-body">
              {candidates.map((candidate) => (
                <div key={candidate.id} style={{ marginBottom: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <p className="field-label">Agent</p>
                      <p style={{ color: "var(--blue)", fontWeight: 700, marginTop: "12px" }}>
                        {candidate.name}
                      </p>
                    </div>
                    {onSaveCandidate && (
                      <button
                        className="send-button"
                        style={{ padding: "4px 8px", fontSize: "11px", marginTop: "12px" }}
                        onClick={() => onSaveCandidate(candidate)}
                      >
                        Save
                      </button>
                    )}
                  </div>
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
      )}
    </div>
  );
};
