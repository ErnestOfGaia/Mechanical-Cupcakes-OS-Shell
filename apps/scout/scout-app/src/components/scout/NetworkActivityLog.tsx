import { NetworkEvent } from "../../types/scout";

interface NetworkActivityLogProps {
  events: NetworkEvent[];
}

export function NetworkActivityLog({ events }: NetworkActivityLogProps) {
  if (events.length === 0) {
    return (
      <div className="whiteboard-empty">
        <div className="empty-icon">
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <p>No network events recorded yet.</p>
      </div>
    );
  }

  return (
    <ol className="activity-feed">
      {events.map((event) => {
        const colorClass =
          event.direction === "outbound"
            ? "amber"
            : event.direction === "inbound"
            ? "blue"
            : "muted";

        return (
          <li key={event.id} className="activity-event">
            <time dateTime={event.timestamp}>
              {new Date(event.timestamp).toLocaleTimeString()}
            </time>
            <span className={`event-type ${colorClass}`}>{event.type}</span>
            <span className="event-summary">{event.summary}</span>
          </li>
        );
      })}
    </ol>
  );
}
