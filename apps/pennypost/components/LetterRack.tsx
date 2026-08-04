/**
 * The receiving house: a letter rack behind the counter.
 *
 * Deliberately NOT a mailbox with a little red flag — that is an American rural
 * convention from decades later, and the pillar box does not reach British streets
 * until the 1850s either. In 1840 your letter waited for you in a rack at a
 * receiving house. One anachronism (the picture postcard) is owned out loud on the
 * About page; a second, added silently, would just be sloppiness.
 *
 * Sealed letters = unread. Open ones = already read.
 */
export function LetterRack({ unread, total }: { unread: number; total: number }) {
  const slots = 4;
  const shown = Math.min(total, slots);
  const sealed = Math.min(unread, shown);

  return (
    <svg
      viewBox="0 0 260 150"
      className="h-auto w-full"
      role="img"
      aria-label={
        unread > 0
          ? `A letter rack holding ${unread} unopened ${unread === 1 ? "letter" : "letters"}`
          : "A letter rack, nothing unopened"
      }
    >
      <g stroke="var(--ink)" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* Rack carcass */}
        <rect x={16} y={22} width={228} height={94} strokeWidth={1.6} />
        <line x1={16} y1={70} x2={244} y2={70} strokeWidth={1.1} />
        <line x1={73} y1={22} x2={73} y2={116} strokeWidth={1.1} />
        <line x1={130} y1={22} x2={130} y2={116} strokeWidth={1.1} />
        <line x1={187} y1={22} x2={187} y2={116} strokeWidth={1.1} />

        {/* Counter */}
        <line x1={8} y1={126} x2={252} y2={126} strokeWidth={1.8} />
        <g strokeWidth={0.5} opacity={0.45}>
          <line x1={20} y1={132} x2={240} y2={132} />
          <line x1={30} y1={137} x2={230} y2={137} />
        </g>

        {/* Wood grain on the carcass */}
        <g strokeWidth={0.4} opacity={0.3}>
          <path d="M22 34 q26 -4 46 0" />
          <path d="M79 46 q26 -4 46 0" />
          <path d="M136 82 q26 -4 46 0" />
          <path d="M193 96 q26 -4 46 0" />
        </g>
      </g>

      {/* Letters in the upper row */}
      {Array.from({ length: shown }).map((_, i) => {
        const x = 24 + i * 57;
        const isSealed = i < sealed;
        return (
          <g key={i} transform={`translate(${x} 30) rotate(${i % 2 ? -3 : 2.5})`}>
            <rect
              width={42}
              height={30}
              fill="var(--paper-raised)"
              stroke="var(--ink)"
              strokeWidth={1.2}
            />
            {isSealed ? (
              <>
                {/* Folded flap + wax seal */}
                <path d="M0 0 L21 16 L42 0" fill="none" stroke="var(--ink)" strokeWidth={0.9} />
                <circle cx={21} cy={15} r={5} fill="var(--cancel)" opacity={0.9} />
                <circle cx={21} cy={15} r={5} fill="none" stroke="var(--cancel)" strokeWidth={0.8} />
              </>
            ) : (
              <>
                {/* Opened: address lines showing */}
                <g stroke="var(--ink-faint)" strokeWidth={0.7} opacity={0.75}>
                  <line x1={7} y1={11} x2={30} y2={11} />
                  <line x1={7} y1={17} x2={26} y2={17} />
                  <line x1={7} y1={23} x2={20} y2={23} />
                </g>
                <path d="M0 0 L21 12 L42 0" fill="none" stroke="var(--ink)" strokeWidth={0.7} opacity={0.5} />
              </>
            )}
          </g>
        );
      })}

      {total === 0 && (
        <text
          x={130}
          y={72}
          textAnchor="middle"
          fill="var(--ink-faint)"
          style={{ font: "italic 11px var(--body)" }}
        >
          nothing waiting
        </text>
      )}
    </svg>
  );
}
