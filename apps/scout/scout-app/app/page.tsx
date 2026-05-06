import {
  MOCK_GARAGE_IDENTITY,
  MOCK_PEER_NODE,
  MOCK_AGENT_CANDIDATES,
  MOCK_NETWORK_EVENTS,
} from "../src/mock/scoutData";
import { NetworkActivityLog } from "../src/components/scout/NetworkActivityLog";

export default function GaragePage() {
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

          {/* Agent Candidates */}
          <div className="module">
            <div className="module-heading split-heading">
              <h2>Agent Candidates</h2>
            </div>
            <div className="console-card">
              <div className="console-body">
                {MOCK_AGENT_CANDIDATES.map((candidate) => (
                  <div key={candidate.id}>
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
            <NetworkActivityLog events={MOCK_NETWORK_EVENTS} />
            <footer className="activity-footer">
              <span>{MOCK_NETWORK_EVENTS.length} events</span>
            </footer>
          </div>
        </div>
      </div>
    </>
  );
}
