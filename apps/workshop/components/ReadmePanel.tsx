"use client";

import type { BoardKind } from "@/lib/types";

/**
 * The README panel: what the workshop is for and how the pieces connect.
 *
 * The diagrams are inline SVG using the app's own CSS variables rather than rendered
 * images. That keeps the "deps deliberately thin" rule (no mermaid, no d3, ~2MB saved
 * on any future client build), needs no render step or committed binaries, themes
 * itself in light and dark for free, and leaves the text selectable and readable to a
 * screen reader.
 */

const C = {
  ink: "var(--ink)",
  soft: "var(--ink-soft)",
  faint: "var(--ink-faint)",
  rule: "var(--rule)",
  paper: "var(--paper-raised)",
  sunk: "var(--paper-sunk)",
  amber: "var(--amber)",
  teal: "var(--teal)",
  in: "var(--in)",
  cut: "var(--cut)",
  hold: "var(--hold)",
};

function Defs() {
  return (
    <defs>
      <marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill={C.faint} />
      </marker>
    </defs>
  );
}

interface BoxProps {
  x: number; y: number; w: number; h: number;
  lines: string[];
  accent?: string;
  dashed?: boolean;
  small?: boolean;
}

function Box({ x, y, w, h, lines, accent = C.rule, dashed, small }: BoxProps) {
  const fs = small ? 10 : 11.5;
  const startY = y + h / 2 - ((lines.length - 1) * (fs + 2.5)) / 2 + fs / 3;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={3}
        fill={C.paper} stroke={accent} strokeWidth={1} strokeDasharray={dashed ? "4 3" : undefined} />
      <rect x={x} y={y} width={3} height={h} fill={accent} />
      {lines.map((t, i) => (
        <text key={i} x={x + w / 2} y={startY + i * (fs + 2.5)} textAnchor="middle"
          fontSize={fs} fill={i === 0 ? C.ink : C.soft} fontWeight={i === 0 ? 600 : 400}>
          {t}
        </text>
      ))}
    </g>
  );
}

function Arrow({ d, label, labelX, labelY, colour = C.faint }: { d: string; label?: string; labelX?: number; labelY?: number; colour?: string }) {
  return (
    <g>
      <path d={d} fill="none" stroke={colour} strokeWidth={1.2} markerEnd="url(#ar)" />
      {label && (
        <text x={labelX} y={labelY} textAnchor="middle" fontSize={9.5} fill={colour}
          style={{ fontFamily: "var(--mono)", letterSpacing: ".04em" }}>
          {label}
        </text>
      )}
    </g>
  );
}

function Figure({ caption, children, height }: { caption: string; children: React.ReactNode; height: number }) {
  return (
    <figure style={{ margin: "0 0 10px" }}>
      <div style={{ border: `1px solid ${C.rule}`, background: C.sunk, borderRadius: 4, padding: "14px 10px", overflowX: "auto" }}>
        <svg viewBox={`0 0 720 ${height}`} width="100%" style={{ maxWidth: 720, display: "block", margin: "0 auto" }} role="img" aria-label={caption}>
          <Defs />
          {children}
        </svg>
      </div>
    </figure>
  );
}

/* ------------------------------------------------------------------ diagrams */

/** 1 — the lifecycle, and it is one-way. */
function Lifecycle() {
  return (
    <Figure caption="The campaign lifecycle, from a note to an archived board. It runs one way." height={188}>
      <Box x={8} y={16} w={126} h={46} accent={C.teal} lines={["a note", "Potential Campaigns"]} />
      <Arrow d="M 138 39 H 176" />
      <Box x={180} y={16} w={132} h={46} accent={C.teal} lines={["campaign-workshop", "scaffolds board.json"]} />
      <Arrow d="M 316 39 H 354" />
      <Box x={358} y={8} w={160} h={62} accent={C.amber} lines={["THE WORKSHOP", "bench · arc · gate", "you are here"]} />
      <Arrow d="M 522 39 H 560" />
      <Box x={564} y={16} w={148} h={46} accent={C.rule} lines={["Campaign Plan .md", "exported"]} />

      <Arrow d="M 638 66 V 96" />
      <Box x={472} y={100} w={240} h={46} accent={C.in} lines={["01 Committed Blog Campaigns", "NN STATUS -Name"]} />
      <Arrow d="M 468 123 H 430" />
      <Box x={286} y={100} w={140} h={46} accent={C.faint} lines={["archived board", "historical record"]} />

      <text x={8} y={120} fontSize={11} fill={C.soft} fontWeight={600}>Once committed, a campaign</text>
      <text x={8} y={134} fontSize={11} fill={C.soft} fontWeight={600}>has left the workshop.</text>
      <text x={8} y={152} fontSize={10} fill={C.faint}>The vault folder is its home from</text>
      <text x={8} y={165} fontSize={10} fill={C.faint}>then on. Last Mile is a named</text>
      <text x={8} y={178} fontSize={10} fill={C.faint}>exception — committed, still worked here.</text>
    </Figure>
  );
}

/** 2 — seed to published post, and the two routes. */
function TwoRoutes() {
  return (
    <Figure caption="Two routes from a seed to a published post: straight to a draft when order does not matter, through the bench when it does." height={310}>
      <Box x={250} y={8} w={220} h={54} accent={C.teal}
        lines={["THE SEED BANK", "Cheap Fixes · inbox · research briefs", "near-misses"]} />

      <Arrow d="M 300 66 V 96 H 150" label="order does NOT matter" labelX={196} labelY={88} />
      <Arrow d="M 420 66 V 96 H 560" label="order MATTERS" labelX={510} labelY={88} />

      <Box x={62} y={102} w={176} h={44} accent={C.rule} lines={["blog-batch-draft", "straight to a draft"]} />
      <Box x={484} y={102} w={176} h={44} accent={C.amber} lines={["an idea on the bench", "it gets a verdict"]} />

      <Arrow d="M 572 150 V 176" />
      <Box x={484} y={180} w={176} h={40} accent={C.amber} lines={["cut · hold · in"]} small />

      <Arrow d="M 484 200 H 360" label="hold — back to the bank" labelX={422} labelY={194} />
      <Arrow d="M 572 224 V 250" label="in" labelX={584} labelY={240} />

      <Box x={432} y={254} w={280} h={44} accent={C.in} lines={["so where does it land?", "its own slot · inside another post · nowhere yet"]} small />

      <Arrow d="M 428 276 H 300" />
      <Box x={120} y={254} w={176} h={44} accent={C.in} lines={["an arc drop", "a slot and a date"]} />
      <Arrow d="M 150 250 V 150" />

      <text x={16} y={172} fontSize={10.5} fill={C.soft} fontWeight={600}>A drop is a committed seed —</text>
      <text x={16} y={186} fontSize={10.5} fill={C.soft}>shaped, verdicted, given a slot</text>
      <text x={16} y={199} fontSize={10.5} fill={C.soft}>and a date.</text>
      <text x={16} y={220} fontSize={10} fill={C.faint}>A campaign earns its keep only</text>
      <text x={16} y={232} fontSize={10} fill={C.faint}>when order matters: post 1 sets</text>
      <text x={16} y={244} fontSize={10} fill={C.faint}>up post 4. Material that stands</text>
      <text x={16} y={256} fontSize={10} fill={C.faint}>alone skips the campaign.</text>

      <text x={250} y={306} fontSize={10} fill={C.amber} style={{ fontFamily: "var(--mono)" }}>
        the blog runs Tue/Wed/Thu and a campaign usually owns one day — the bank fills the rest
      </text>
    </Figure>
  );
}

/** 3 — what the three verdicts mean (Ernest's rule). */
function ThreeVerdicts() {
  return (
    <Figure caption="What the three verdicts mean, and where an idea marked IN has to land." height={266}>
      <Box x={272} y={8} w={176} h={40} accent={C.rule} lines={["an idea on the bench"]} />
      <Arrow d="M 360 52 V 76" />
      <Box x={272} y={80} w={176} h={38} accent={C.amber} lines={["does it ship?"]} />

      <Arrow d="M 272 99 H 168" label="no" labelX={218} labelY={92} />
      <Box x={16} y={80} w={148} h={38} accent={C.cut} lines={["CUT"]} />

      <Arrow d="M 448 99 H 552" label="not now / not here" labelX={500} labelY={92} />
      <Box x={556} y={80} w={156} h={38} accent={C.hold} lines={["HOLD → seed bank"]} />

      <Arrow d="M 360 122 V 146" label="yes" labelX={374} labelY={138} />
      <Box x={272} y={150} w={176} h={38} accent={C.in} lines={["IN — so where does it land?"]} small />

      <Arrow d="M 272 169 H 168" />
      <Box x={16} y={150} w={148} h={38} accent={C.in} lines={["its own slot", "add a drop"]} small />

      <Arrow d="M 448 169 H 552" />
      <Box x={556} y={150} w={156} h={38} accent={C.teal} lines={["inside another post", "seed bank"]} small />

      <Arrow d="M 360 192 V 214" />
      <Box x={230} y={218} w={260} h={40} accent={C.cut} lines={["nowhere yet → write the SEAM", "a NOTE is not a seam"]} small />
    </Figure>
  );
}

/** 4 — where the board actually lives, in the local build. */
function WhereItLives() {
  return (
    <Figure caption="Where a board lives: one board.json in the vault, written by the app and by Claude, backed up on every save." height={230}>
      <Box x={252} y={92} w={216} h={56} accent={C.amber}
        lines={["board.json", "in the Marketing department", "the one copy that counts"]} />

      <Box x={20} y={16} w={186} h={46} accent={C.teal} lines={["this app", "localhost:3005"]} />
      <Arrow d="M 206 42 H 300 V 88" />
      <Arrow d="M 288 88 V 42 H 210" />

      <Box x={512} y={16} w={188} h={46} accent={C.teal} lines={["Claude, through MCP", "Desktop or Code"]} />
      <Arrow d="M 512 42 H 420 V 88" />
      <Arrow d="M 432 88 V 42 H 508" />

      <Arrow d="M 252 126 H 200" />
      <Box x={20} y={104} w={176} h={46} accent={C.rule} lines={["_workshop-backups/auto", "the last ten, every save"]} small />

      <Arrow d="M 468 126 H 520" />
      <Box x={524} y={104} w={176} h={46} accent={C.rule} lines={["Campaign Plan .md", "on export"]} small />

      <text x={360} y={178} textAnchor="middle" fontSize={11} fill={C.soft} fontWeight={600}>
        Two writers, one file — so a save proves what it wrote.
      </text>
      <text x={360} y={195} textAnchor="middle" fontSize={10} fill={C.faint}>
        Every save is read back and compared before it reports success, and a save based on a
      </text>
      <text x={360} y={208} textAnchor="middle" fontSize={10} fill={C.faint}>
        version that has since changed is refused rather than won. The mockup could not do this:
      </text>
      <text x={360} y={221} textAnchor="middle" fontSize={10} fill={C.faint}>
        its downloads were blocked and it said they had worked. One playlist was lost that way.
      </text>
    </Figure>
  );
}

/* ------------------------------------------------------------------ panel */

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="display" style={{ fontSize: 20, margin: "30px 0 4px" }}>{children}</h2>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 14, color: "var(--ink-soft)", maxWidth: "70ch", margin: "0 0 12px", lineHeight: 1.62 }}>{children}</p>;
}

export default function ReadmePanel({ kind }: { kind: BoardKind }) {
  return (
    <section>
      <p className="eyebrow">README</p>
      <h1 className="display" style={{ fontSize: 34, margin: "0 0 6px" }}>How this works</h1>
      <P>
        The workshop is the bench a campaign gets argued over on <em>before</em> anyone commits to
        running it. It scaffolds and files; it never publishes anything.
      </P>

      <H>The lifecycle, and it runs one way</H>
      <Lifecycle />
      <P>
        A note becomes a folder, the folder becomes a board, the board becomes a plan, and the plan
        gets filed. Once a campaign is committed it has left — the vault folder is its home from
        then on and the board is kept as record, the cheapest possible start for the next one.
      </P>

      <H>Two routes from a seed to a post</H>
      <TwoRoutes />
      <P>
        Not everything needs a campaign. Material that stands on its own goes straight from the seed
        bank to a draft. A campaign is for when <strong>order matters</strong> — when post 1 sets up
        post 4. A drop is a committed seed: shaped, given a slot and a date.
      </P>

      <H>What the three verdicts mean</H>
      <ThreeVerdicts />
      <P>
        <strong>An idea marked <code>in</code> must produce a drop or a seed. If it produces
        neither, a seam must say why — not a note.</strong> If there is no seam-worthy reason, it
        was a <code>hold</code>, not an <code>in</code>. Without that rule <code>in</code> quietly
        means both &ldquo;I like this&rdquo; and &ldquo;this ships,&rdquo; which is how a board
        reaches nine INs against five drops with nobody noticing.
      </P>
      <P>
        The rule&rsquo;s real payoff is not catching orphans. It is forcing every
        reason-not-to-place out of the note field and into the seams list.
      </P>

      <H>Where the board lives</H>
      <WhereItLives />

      <H>Five things worth saying plainly</H>
      <P>
        <strong>Campaign, channel, property are three different things.</strong> A campaign is a
        body of work with an arc and an end. A channel is shared machinery — draft DNA, runbooks,
        promo mechanics — that a campaign pulls in. A property is the thing channels point at, like
        the blog. <em>Channels are not campaigns.</em>
        {kind === "channel" && " This board is a channel: its middle section is a weekly rhythm, not an arc with an ending."}
      </P>
      <P>
        <strong>A seam, a gate item and a note are not the same.</strong> A seam is something
        unresolved — an open question, a stale fact, a collision. A gate item is a condition that
        must be <em>true before shipping</em>: a seam can be interesting, but an unticked gate item
        is a way the campaign embarrasses itself in public. A note is neither, and that is the
        point — it is invisible to the seams list, the gate, the meters, and to Katrina.
      </P>
      <P>
        <strong>Ernest decides; Katrina advises.</strong> Her verdicts are input — welcome whenever
        they arrive, never required. Gate items she owns are non-blocking by default, because her
        availability must never hold a campaign at the gate. Where the two of you differ, the row
        raises a flag. It is not a gate.
      </P>
      <P>
        <strong>Stage it honestly.</strong> Spark, shaping, ready to commit, archived. The nudge
        reads the stage, so overstating it just produces worse advice.
      </P>
      <P>
        <strong>The bench is meant to be over-supplied.</strong> More ideas than the arc can use.
        Cutting is the work.
      </P>
    </section>
  );
}
