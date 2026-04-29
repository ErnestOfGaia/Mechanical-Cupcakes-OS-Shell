const starterEvents = [
  "garage.started: Local Garage initialized in simulated mode.",
  "walkie.ready: Walkie Talkie placeholder is ready for the first mock query.",
  "whiteboard.empty: No saved agents yet.",
];

export default function Home() {
  return (
    <main className="page-shell">
      <section className="garage-placeholder" aria-labelledby="garage-title">
        <header className="garage-header">
          <div>
            <p className="eyebrow">Scout Protocol / Garage v0.1</p>
            <h1 id="garage-title">Local Garage Prototype</h1>
            <p className="lede">
              This first screen is intentionally small: one simulated Garage,
              one future Walkie Talkie, one Whiteboard, and a Network Activity
              log we can grow one careful step at a time.
            </p>
          </div>
          <div className="status-pill" aria-label="Prototype mode">
            Simulated mode
          </div>
        </header>

        <div className="panel-grid" aria-label="Garage starter panels">
          <section className="garage-panel">
            <h2>Walkie Talkie</h2>
            <p>
              The first working tool will send a mock discovery query to a
              simulated Cape Kiwanda peer node.
            </p>
          </section>

          <section className="garage-panel">
            <h2>Whiteboard</h2>
            <p>
              Saved agent candidates will appear here after the first
              query-response loop is wired up.
            </p>
          </section>

          <section className="garage-panel">
            <h2>Network Activity</h2>
            <ul className="activity-list" aria-label="Starter activity events">
              {starterEvents.map((event) => (
                <li key={event}>{event}</li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="callout" aria-label="Prototype boundary">
          <p>
            v0.1 does not use real gossip, blockchain settlement, Mastra, or
            remote nodes. Those pieces stay outside the room until the local
            loop is useful.
          </p>
        </aside>
      </section>
    </main>
  );
}
