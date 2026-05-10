import React from "react";
import { AgentCandidate } from "../../types/scout";

interface WhiteboardProps {
  candidates: AgentCandidate[];
}

export const Whiteboard: React.FC<WhiteboardProps> = ({ candidates }) => {
  if (candidates.length === 0) {
    return (
      <div className="whiteboard-module">
        <div className="module-heading">
          <h2>Whiteboard</h2>
        </div>
        <div className="whiteboard-empty">
          <p>No candidates saved.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="whiteboard-module">
      <div className="module-heading">
        <h2>Whiteboard</h2>
      </div>
      <div className="console-card">
        <div className="console-body">
          {candidates.map((candidate) => (
            <div key={candidate.id} style={{ marginBottom: "1rem" }}>
              <p className="field-label">Saved Agent</p>
              <p style={{ color: "var(--blue)", fontWeight: 700, marginTop: "12px" }}>
                {candidate.name}
              </p>
              <p style={{ color: "var(--text-soft)", fontSize: "13px", marginTop: "6px" }}>
                {candidate.summary}
              </p>
              <p style={{ color: "var(--muted)", fontSize: "12px", marginTop: "4px" }}>
                Reputation: {candidate.reputation}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
