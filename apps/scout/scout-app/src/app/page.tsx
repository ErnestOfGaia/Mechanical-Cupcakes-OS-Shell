import {
  CircleDot,
  ClipboardList,
  LayoutDashboard,
  ListX,
  Mic,
  MoreVertical,
  Network,
  Radio,
  Send,
  TerminalSquare,
} from "lucide-react";

const networkEvents = [
  {
    time: "10:05:22",
    type: "garage.started",
    tone: "amber",
    summary: "Local Garage initialized in simulated mode.",
  },
  {
    time: "10:05:23",
    type: "peer.mock.ready",
    tone: "blue",
    summary: "Cape Kiwanda mock peer available at local://peer/alpha.",
  },
  {
    time: "10:05:25",
    type: "walkie.ready",
    tone: "green",
    summary: "Walkie Talkie standing by for first discovery query.",
  },
  {
    time: "10:12:44",
    type: "whiteboard.empty",
    tone: "muted",
    summary: "No agent candidates saved.",
  },
];

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Walkie", icon: Mic, active: false },
  { label: "Whiteboard", icon: ClipboardList, active: false },
  { label: "Network", icon: Network, active: false },
];

export default function Home() {
  return (
    <main className="garage-shell">
      <header className="top-bar" aria-label="Scout Garage header">
        <div className="brand-lockup">
          <TerminalSquare aria-hidden="true" size={25} strokeWidth={2.4} />
          <h1>Garage v0.1</h1>
        </div>

        <div className="top-actions">
          <span className="mode-badge">[ MODE: SIMULATED ]</span>
          <button className="icon-button" type="button" aria-label="More options">
            <MoreVertical aria-hidden="true" size={22} />
          </button>
        </div>
      </header>

      <section className="garage-workspace" aria-label="Scout Garage dashboard">
        <div className="primary-column">
          <div className="top-grid">
            <section className="module" aria-labelledby="walkie-title">
              <header className="module-heading">
                <span className="heading-icon">
                  <Mic aria-hidden="true" size={18} />
                </span>
                <h2 id="walkie-title">Walkie Talkie</h2>
              </header>

              <div className="console-card walkie-card">
                <div className="console-body">
                  <label className="field-label" htmlFor="mission-query">
                    Mission Query
                  </label>
                  <textarea
                    id="mission-query"
                    className="mission-input"
                    placeholder="Enter transmission parameters..."
                    disabled
                  />
                  <button className="send-button" type="button" disabled>
                    <Send aria-hidden="true" size={18} />
                    Send Query
                  </button>
                </div>

                <footer className="console-footer">
                  <span>Channel: 01-Alpha</span>
                  <strong>Ready</strong>
                </footer>
              </div>
            </section>

            <section className="module" aria-labelledby="identity-title">
              <header className="module-heading split-heading">
                <h2 id="identity-title">Local Identity</h2>
                <span className="status-light" aria-label="Local node online" />
              </header>

              <div className="console-card identity-card">
                <dl className="identity-grid">
                  <dt>Node ID:</dt>
                  <dd>node-772</dd>

                  <dt>Alias:</dt>
                  <dd>Ernest-Local</dd>

                  <dt>Address:</dt>
                  <dd>local://garage/ernest</dd>

                  <dt>Peer:</dt>
                  <dd>Cape Kiwanda Mock Node</dd>
                </dl>
              </div>
            </section>
          </div>

          <section className="module whiteboard-module" aria-labelledby="whiteboard-title">
            <header className="module-heading">
              <span className="heading-icon">
                <ClipboardList aria-hidden="true" size={18} />
              </span>
              <h2 id="whiteboard-title">Whiteboard</h2>
            </header>

            <div className="whiteboard-empty">
              <div className="empty-icon">
                <ListX aria-hidden="true" size={32} />
              </div>
              <p>No agents saved to whiteboard yet.</p>
            </div>
          </section>
        </div>

        <aside className="module activity-module" aria-labelledby="activity-title">
          <header className="module-heading">
            <span className="heading-icon">
              <Network aria-hidden="true" size={18} />
            </span>
            <h2 id="activity-title">Network Activity</h2>
          </header>

          <div className="console-card activity-card">
            <ol className="activity-feed" aria-label="Static network activity events">
              {networkEvents.map((event) => (
                <li className="activity-event" key={`${event.time}-${event.type}`}>
                  <time>[{event.time}]</time>
                  <span className={`event-type ${event.tone}`}>{event.type}</span>
                  <span className="event-summary">{event.summary}</span>
                </li>
              ))}
            </ol>

            <footer className="activity-footer">
              <span>
                <CircleDot aria-hidden="true" size={12} />
                Live stream standby
              </span>
              <button type="button" disabled>
                Clear Logs
              </button>
            </footer>
          </div>
        </aside>
      </section>

      <nav className="bottom-nav" aria-label="Garage sections">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              className={item.active ? "nav-item active" : "nav-item"}
              type="button"
              key={item.label}
              aria-current={item.active ? "page" : undefined}
              disabled
            >
              <Icon aria-hidden="true" size={24} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <aside className="prototype-strip" aria-label="Prototype scope">
        <Radio aria-hidden="true" size={15} />
        <span>
          Static local prototype: no real gossip, settlement, API routes, or saved state.
        </span>
      </aside>
    </main>
  );
}
