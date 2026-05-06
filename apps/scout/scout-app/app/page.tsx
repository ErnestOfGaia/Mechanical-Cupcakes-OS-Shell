import { MOCK_GARAGE_IDENTITY, MOCK_PEER_NODE, MOCK_SCOUT_QUERY, MOCK_AGENT_CANDIDATES, MOCK_NETWORK_EVENTS } from "../src/mock/scoutData";

export default function GaragePage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Garage Prototype</h1>

      <section>
        <h2>Local Identity</h2>
        <pre>{JSON.stringify(MOCK_GARAGE_IDENTITY, null, 2)}</pre>
      </section>

      <section>
        <h2>Peer Node</h2>
        <pre>{JSON.stringify(MOCK_PEER_NODE, null, 2)}</pre>
      </section>

      <section>
        <h2>Scout Query</h2>
        <pre>{JSON.stringify(MOCK_SCOUT_QUERY, null, 2)}</pre>
      </section>

      <section>
        <h2>Agent Candidates</h2>
        <pre>{JSON.stringify(MOCK_AGENT_CANDIDATES[0], null, 2)}</pre>
      </section>

      <section>
        <h2>Network Events</h2>
        <pre>{JSON.stringify(MOCK_NETWORK_EVENTS[0], null, 2)}</pre>
      </section>
    </div>
  );
}
