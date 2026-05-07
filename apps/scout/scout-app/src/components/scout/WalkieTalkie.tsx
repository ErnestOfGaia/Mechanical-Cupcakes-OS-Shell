"use client";

import React, { useState } from "react";
import { ScoutEnvelope, createScoutEnvelope } from "../../lib/envelope";
import { AgentCandidate } from "../../types/scout";
import { MOCK_AGENT_CANDIDATES } from "../../mock/scoutData";

interface WalkieTalkieProps {
  onQuerySent: (envelope: ScoutEnvelope<Record<string, unknown>>) => void;
  onResultsReceived: (candidates: AgentCandidate[]) => void;
}

export const WalkieTalkie: React.FC<WalkieTalkieProps> = ({ onQuerySent, onResultsReceived }) => {
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
    </div>
  );
};
