import type { EngravingId } from "@/lib/types";

/**
 * The card fronts: four line engravings, drawn as inline SVG.
 *
 * Inline rather than image files because this app makes zero network requests —
 * and because line engraving is the period-correct idiom for 1840, which means
 * the cheapest thing to build here also happens to be the most authentic. A
 * photograph would be both more expensive and more wrong.
 *
 * No <pattern> or <linearGradient> ids anywhere: the same engraving renders
 * several times on one page (picker, preview, gallery) and duplicate ids collide
 * silently. Hatching is drawn as explicit lines instead.
 */

const SKY_TOP = 8;

/** Sky hatching — denser toward the top, the way a burin lays it in. */
function skyHatch(from = SKY_TOP, to = 72, count = 16) {
  const lines = [];
  for (let i = 0; i < count; i++) {
    // Ease the spacing so lines crowd at the top and open out toward the horizon.
    const t = Math.pow(i / (count - 1), 1.55);
    const y = from + t * (to - from);
    // Shorter strokes near the top edge give the plate a hand-cut margin.
    const inset = 14 + (1 - i / count) * 26;
    lines.push(
      <line
        key={`s${i}`}
        x1={inset}
        y1={y}
        x2={300 - inset}
        y2={y}
        strokeWidth={0.5}
        opacity={0.34 + 0.24 * (1 - i / count)}
      />,
    );
  }
  return lines;
}

/** Water hatching — long horizontals, broken, to read as swell rather than sky. */
function waterHatch(from: number, to: number, count: number) {
  const lines = [];
  for (let i = 0; i < count; i++) {
    const y = from + (i / (count - 1)) * (to - from);
    const wobble = (i % 3) * 12;
    lines.push(
      <line key={`w${i}a`} x1={16 + wobble} y1={y} x2={140 - wobble / 2} y2={y} strokeWidth={0.6} opacity={0.4} />,
      <line key={`w${i}b`} x1={158 + wobble / 2} y1={y} x2={284 - wobble} y2={y} strokeWidth={0.6} opacity={0.4} />,
    );
  }
  return lines;
}

function Plate({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 300 200"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      role="presentation"
      focusable="false"
      style={{ color: "var(--ink)", background: "var(--paper-raised)" }}
    >
      <g stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {children}
        {/* Plate border: heavy rule inside a hair rule, as an engraving was struck. */}
        <rect x={6} y={6} width={288} height={188} strokeWidth={1.6} />
        <rect x={10} y={10} width={280} height={180} strokeWidth={0.5} opacity={0.65} />
      </g>
    </svg>
  );
}

/** A square sail: yard across the mast, canvas below, bellied at the foot. */
function Sail({ mx, top, hw, h }: { mx: number; top: number; hw: number; h: number }) {
  return (
    <>
      <line x1={mx - hw - 3} y1={top} x2={mx + hw + 3} y2={top} strokeWidth={1} />
      <path
        d={`M${mx - hw} ${top} L${mx + hw} ${top} L${mx + hw - 2} ${top + h} Q${mx} ${top + h + 5} ${mx - hw + 2} ${top + h} Z`}
      />
    </>
  );
}

/**
 * The Writing Desk.
 *
 * This slot was a mail coach — the obvious Royal Mail image — but a convincing
 * horse is genuinely hard to author blind in path data, and two attempts read as
 * a bundle of sticks and then as a beetle. Rather than spend a third, the plate
 * became the desk the letter gets written at: entirely geometric, drawable, and
 * arguably a better front for an app whose whole activity is writing a card.
 */
function WritingDesk() {
  return (
    <Plate>
      {/* Panelled wall behind, hatched */}
      {skyHatch(14, 92, 13)}
      <line x1={96} y1={14} x2={96} y2={132} strokeWidth={0.5} opacity={0.35} />
      <line x1={210} y1={14} x2={210} y2={132} strokeWidth={0.5} opacity={0.35} />

      {/* Desk: top surface, front edge, one drawer */}
      <g strokeWidth={1.5}>
        <line x1={18} y1={132} x2={282} y2={132} />
        <path d="M18 132 L18 146 L282 146 L282 132" />
      </g>
      <g strokeWidth={0.6} opacity={0.5}>
        <line x1={26} y1={139} x2={274} y2={139} />
        <rect x={116} y={135} width={68} height={8} />
        <circle cx={150} cy={139} r={1.6} />
      </g>
      {/* Desk legs */}
      <g strokeWidth={1.2}>
        <line x1={30} y1={146} x2={30} y2={182} />
        <line x1={270} y1={146} x2={270} y2={182} />
        <line x1={30} y1={176} x2={270} y2={176} strokeWidth={0.8} />
      </g>

      {/* Candlestick, left */}
      <g strokeWidth={1.3}>
        <path d="M44 132 L52 132 L50 128 L46 128 Z" />
        <line x1={48} y1={128} x2={48} y2={112} />
        <path d="M44 112 L52 112 L51 108 L45 108 Z" />
        <line x1={48} y1={108} x2={48} y2={88} strokeWidth={2.2} />
        {/* Flame */}
        <path d="M48 88 C44.5 84 46 79 48 76 C50 79 51.5 84 48 88 Z" strokeWidth={1} />
      </g>

      {/* A folded letter lying on the desk, with a wax seal */}
      <g strokeWidth={1.4}>
        <path d="M104 132 L118 112 L192 112 L178 132 Z" />
        <path d="M118 112 L146 124 L192 112" strokeWidth={0.8} />
      </g>
      <circle cx={148} cy={126} r={5} strokeWidth={1} style={{ fill: "var(--cancel)" }} opacity={0.85} />

      {/* Inkwell with a quill standing in it */}
      <g strokeWidth={1.4}>
        <path d="M218 132 L216 116 L238 116 L236 132 Z" />
        <path d="M214 116 L240 116" strokeWidth={1.1} />
        <line x1={222} y1={121} x2={234} y2={121} strokeWidth={0.6} opacity={0.6} />
      </g>
      {/* Quill: shaft rising right, feather barbs down one side */}
      <g strokeWidth={1.2}>
        <line x1={228} y1={118} x2={262} y2={62} />
        <path d="M262 62 C256 66 252 74 250 82 C254 78 259 74 262 62 Z" strokeWidth={1} />
        <g strokeWidth={0.5} opacity={0.65}>
          <line x1={256} y1={72} x2={250} y2={70} />
          <line x1={252} y1={79} x2={246} y2={77} />
          <line x1={259} y1={66} x2={253} y2={64} />
        </g>
      </g>

      {/* A small stack of finished letters, right */}
      <g strokeWidth={1.1}>
        <rect x={246} y={124} width={28} height={8} />
        <rect x={249} y={119} width={26} height={7} />
      </g>
    </Plate>
  );
}

function PacketShip() {
  return (
    <Plate>
      {skyHatch(SKY_TOP, 62, 14)}
      <line x1={10} y1={132} x2={290} y2={132} strokeWidth={1} opacity={0.7} />
      {waterHatch(140, 184, 8)}

      {/* Hull */}
      <g strokeWidth={1.5}>
        <path d="M96 132 L204 132 L188 150 L112 150 Z" />
        <path d="M100 138 L200 138" strokeWidth={0.7} opacity={0.7} />
      </g>

      {/* Three masts */}
      <g strokeWidth={1.2}>
        <line x1={124} y1={132} x2={124} y2={54} />
        <line x1={152} y1={132} x2={152} y2={40} />
        <line x1={180} y1={132} x2={180} y2={58} />
        <line x1={204} y1={132} x2={228} y2={120} />
      </g>

      {/* Square sails: a yard across the mast, canvas hanging below and bellied
          at the foot. The first attempt mirrored two quadratic curves, which
          produces a lens — the sails came out as beads threaded on the masts. */}
      <g strokeWidth={1.1}>
        <Sail mx={124} top={60} hw={15} h={20} />
        <Sail mx={124} top={86} hw={19} h={24} />
        <Sail mx={152} top={46} hw={17} h={22} />
        <Sail mx={152} top={74} hw={22} h={28} />
        <Sail mx={180} top={64} hw={15} h={20} />
        <Sail mx={180} top={90} hw={18} h={22} />
      </g>
      {/* Jib */}
      <path d="M204 130 L228 120 L206 104 Z" strokeWidth={1} />
      {/* Pennant */}
      <path d="M152 40 L168 44 L152 48" strokeWidth={0.9} />

      {/* Swell against the hull */}
      <g strokeWidth={0.8} opacity={0.7}>
        <path d="M84 150 q12 -6 24 0 t24 0" />
        <path d="M168 150 q12 -6 24 0 t24 0" />
      </g>
      {/* Gulls */}
      <g strokeWidth={0.7} opacity={0.6}>
        <path d="M60 62 q5 -4 10 0 M70 62 q5 -4 10 0" />
        <path d="M232 82 q4 -3 8 0 M240 82 q4 -3 8 0" />
      </g>
    </Plate>
  );
}

function Lighthouse() {
  return (
    <Plate>
      {skyHatch(SKY_TOP, 66, 15)}
      <line x1={10} y1={140} x2={290} y2={140} strokeWidth={1} opacity={0.7} />
      {waterHatch(148, 186, 7)}

      {/* Beam — two thin rays, the only straight lines allowed to leave the plate */}
      <g strokeWidth={0.6} opacity={0.45}>
        <path d="M150 56 L286 26" />
        <path d="M150 62 L286 74" />
        <path d="M144 56 L18 28" />
        <path d="M144 62 L18 76" />
      </g>

      {/* Rock */}
      <path d="M104 140 L124 118 L146 126 L170 114 L192 140 Z" strokeWidth={1.4} />
      <g strokeWidth={0.5} opacity={0.55}>
        <line x1={118} y1={136} x2={130} y2={124} />
        <line x1={128} y1={138} x2={142} y2={126} />
        <line x1={158} y1={136} x2={172} y2={122} />
        <line x1={168} y1={138} x2={180} y2={128} />
      </g>

      {/* Tower — tapered, banded */}
      <g strokeWidth={1.5}>
        <path d="M134 120 L140 70 L156 70 L162 120 Z" />
        <line x1={138} y1={100} x2={158} y2={100} strokeWidth={0.9} />
        <line x1={136} y1={110} x2={160} y2={110} strokeWidth={0.9} />
      </g>
      {/* Lantern room + gallery + cap */}
      <g strokeWidth={1.3}>
        <path d="M136 68 L160 68 L158 62 L138 62 Z" />
        <rect x={140} y={50} width={16} height={12} />
        <path d="M138 50 L148 42 L158 50 Z" />
        <line x1={148} y1={42} x2={148} y2={36} strokeWidth={0.8} />
      </g>
      {/* Light */}
      <circle cx={148} cy={56} r={3} strokeWidth={0.9} />

      {/* Spray at the base */}
      <g strokeWidth={0.8} opacity={0.7}>
        <path d="M92 146 q10 -10 20 -2" />
        <path d="M184 144 q10 -10 22 -2" />
      </g>
    </Plate>
  );
}

function Valley() {
  return (
    <Plate>
      {skyHatch(SKY_TOP, 58, 13)}

      {/* Layered ridges, lightest furthest */}
      <path d="M10 96 L54 70 L92 86 L130 62 L172 84 L214 66 L256 88 L290 74" strokeWidth={0.8} opacity={0.55} />
      <path d="M10 116 L48 96 L88 110 L134 88 L182 108 L228 92 L290 112" strokeWidth={1} opacity={0.75} />

      {/* River, widening toward the reader */}
      <g strokeWidth={1.2}>
        <path d="M150 112 Q140 138 118 156 Q104 168 92 190" />
        <path d="M158 112 Q156 138 148 158 Q142 172 140 190" />
      </g>
      <g strokeWidth={0.45} opacity={0.5}>
        <path d="M132 146 q10 -3 18 1" />
        <path d="M120 162 q12 -3 22 1" />
        <path d="M108 178 q14 -3 26 1" />
      </g>

      {/* Field lines on the near bank */}
      <g strokeWidth={0.5} opacity={0.45}>
        <path d="M14 150 q60 -14 100 -6" />
        <path d="M14 164 q56 -14 92 -4" />
        <path d="M172 148 q54 -12 106 -4" />
        <path d="M182 164 q50 -12 96 -4" />
      </g>

      {/* Trees — a copse, and one standing alone */}
      <g strokeWidth={1.1}>
        <path d="M46 148 L46 132" />
        <path d="M38 132 q8 -18 16 0 z" />
        <path d="M60 150 L60 136" />
        <path d="M53 136 q7 -15 14 0 z" />
        <path d="M232 152 L232 130" />
        <path d="M222 130 q10 -22 20 0 z" />
      </g>

      {/* A cottage, because a valley needs somewhere for the letter to go */}
      <g strokeWidth={1.2}>
        <path d="M196 150 L196 136 L220 136 L220 150 Z" />
        <path d="M192 136 L208 124 L224 136" />
        <rect x={204} y={142} width={7} height={8} strokeWidth={0.7} />
        <line x1={214} y1={128} x2={214} y2={120} strokeWidth={0.8} />
      </g>
      {/* Smoke */}
      <path d="M214 120 q6 -6 0 -12 q-6 -6 2 -12" strokeWidth={0.5} opacity={0.5} />
    </Plate>
  );
}

export const ENGRAVINGS: Record<
  EngravingId,
  { label: string; caption: string; Component: () => React.JSX.Element }
> = {
  "writing-desk": {
    label: "The Writing Desk",
    caption: "Where the letter begins",
    Component: WritingDesk,
  },
  "packet-ship": {
    label: "The Packet Ship",
    caption: "Outward bound, with the mails",
    Component: PacketShip,
  },
  lighthouse: {
    label: "The Lighthouse",
    caption: "A light kept for strangers",
    Component: Lighthouse,
  },
  valley: {
    label: "The Valley",
    caption: "Somewhere worth writing to",
    Component: Valley,
  },
};

export const ENGRAVING_IDS = Object.keys(ENGRAVINGS) as EngravingId[];

export function Engraving({ id }: { id: EngravingId }) {
  const entry = ENGRAVINGS[id] ?? ENGRAVINGS["writing-desk"];
  const C = entry.Component;
  return <C />;
}
