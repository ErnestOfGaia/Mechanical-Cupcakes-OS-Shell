/**
 * A stamp in the Penny Black idiom — an original, not a facsimile.
 *
 * One detail worth not getting wrong: THE PENNY BLACK WAS IMPERFORATE. Perforation
 * machines did not arrive until the 1850s, so sheets were cut apart with scissors
 * and the edges are straight. The modern scalloped perforation everyone reaches
 * for when drawing a stamp would be a decade early. Straight edges here are the
 * accurate choice, not a simplification.
 */

export function Stamp({
  cancelled = false,
  className = "",
}: {
  cancelled?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 76 92"
      className={className}
      role="img"
      aria-label={cancelled ? "A one penny stamp, cancelled" : "A one penny stamp"}
    >
      {/* Straight-cut edge — see note above. */}
      <rect x={0} y={0} width={76} height={92} fill="var(--ink)" />
      <rect x={3} y={3} width={70} height={86} fill="none" stroke="var(--paper)" strokeWidth={0.6} opacity={0.5} />

      <text
        x={38}
        y={13}
        textAnchor="middle"
        fill="var(--paper)"
        style={{ font: "600 8px var(--display)", letterSpacing: "1.6px" }}
      >
        POSTAGE
      </text>

      {/* Corner ornaments, where a real plate carried its check letters. */}
      <g fill="var(--paper)" opacity={0.85}>
        <path d="M8 7 l2.2 4.4 4.4 -0 -3.4 3 1.3 4.6 -4.5 -2.8 -4.5 2.8 1.3 -4.6 -3.4 -3 4.4 0z" transform="scale(0.62) translate(4 4)" />
        <path d="M8 7 l2.2 4.4 4.4 -0 -3.4 3 1.3 4.6 -4.5 -2.8 -4.5 2.8 1.3 -4.6 -3.4 -3 4.4 0z" transform="scale(0.62) translate(100 4)" />
      </g>

      {/* Engraved profile — a generic head in the period idiom, deliberately not a
          portrait of anybody. */}
      <g transform="translate(38 48)">
        <ellipse cx={0} cy={0} rx={22} ry={26} fill="none" stroke="var(--paper)" strokeWidth={0.5} opacity={0.35} />
        <path
          d="M -2 -22 C 10 -22 16 -13 15 -4 C 14 2 11 5 10 9 C 9 14 12 17 12 20 L -14 20 C -14 14 -16 8 -16 0 C -16 -13 -12 -22 -2 -22 Z"
          fill="var(--paper)"
        />
        {/* Hatching over the profile, the way a line engraving models a face. */}
        <g stroke="var(--ink)" strokeWidth={0.45} opacity={0.55}>
          <path d="M-14 -8 q12 -3 22 -1" />
          <path d="M-15 -2 q13 -3 24 -1" />
          <path d="M-15 4 q13 -3 24 -1" />
          <path d="M-14 10 q12 -3 23 -1" />
          <path d="M-13 16 q11 -3 22 -1" />
        </g>
      </g>

      <text
        x={38}
        y={85}
        textAnchor="middle"
        fill="var(--paper)"
        style={{ font: "600 8px var(--display)", letterSpacing: "1.2px" }}
      >
        ONE PENNY
      </text>

      {cancelled && <MalteseCross />}
    </svg>
  );
}

/**
 * The 1840 cancellation: a Maltese cross, struck in red. It is the mark that says
 * a stamp has been used and cannot be used again — which makes it exactly the
 * right motif for "this card has been posted."
 */
function MalteseCross({ opacity = 0.82 }: { opacity?: number }) {
  return (
    <g transform="translate(38 48)" opacity={opacity}>
      <g fill="var(--cancel)" stroke="var(--cancel)" strokeWidth={1}>
        {[0, 90, 180, 270].map((deg) => (
          <path
            key={deg}
            // One arm: narrow at the centre, splayed and notched at the tip.
            d="M0 0 L -13 -22 L -6 -26 L 0 -19 L 6 -26 L 13 -22 Z"
            transform={`rotate(${deg})`}
          />
        ))}
      </g>
    </g>
  );
}

export { MalteseCross };

/**
 * The postmark ring — town name and date around a circle, struck alongside the
 * cancel. Used on the card back and on the downloadable PNG.
 */
export function Postmark({
  dateLabel,
  className = "",
}: {
  dateLabel: string;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label={`Postmarked ${dateLabel}`}>
      <g stroke="var(--cancel)" fill="none" strokeWidth={1.6} opacity={0.75}>
        <circle cx={50} cy={50} r={44} />
        <circle cx={50} cy={50} r={37} strokeWidth={0.8} />
        <line x1={13} y1={40} x2={87} y2={40} strokeWidth={0.8} />
        <line x1={13} y1={62} x2={87} y2={62} strokeWidth={0.8} />
      </g>
      <text
        x={50}
        y={35}
        textAnchor="middle"
        fill="var(--cancel)"
        opacity={0.85}
        style={{ font: "600 9px var(--display)", letterSpacing: "1.4px" }}
      >
        PENNY POST
      </text>
      <text
        x={50}
        y={55}
        textAnchor="middle"
        fill="var(--cancel)"
        opacity={0.85}
        style={{ font: "600 10px var(--display)", letterSpacing: "0.6px" }}
      >
        {dateLabel}
      </text>
      <text
        x={50}
        y={74}
        textAnchor="middle"
        fill="var(--cancel)"
        opacity={0.8}
        style={{ font: "600 7px var(--display)", letterSpacing: "1.2px" }}
      >
        PAID
      </text>
    </svg>
  );
}
