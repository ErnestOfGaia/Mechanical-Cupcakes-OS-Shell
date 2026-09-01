import Link from "next/link";
import type { Metadata } from "next";
import { Masthead } from "@/components/Masthead";
import { Stamp } from "@/components/Stamp";

export const metadata: Metadata = {
  title: "Why it is called The Penny Post",
  description:
    "In 1840 the post stopped being a luxury. Here is what changed, and why a little postcard toy is named after it.",
};

/* FACT-CHECKED 2026-09-01, then adversarially re-checked — which caught two errors the
 * first pass had itself introduced. Citations are in the commit carrying this change.
 *
 * Corrected below:
 *
 *  - The Penny Black was called "the first adhesive postage stamp anywhere in the
 *    world." The standard qualification is "issued by a public postal service." That
 *    qualification exists NOT because of earlier private adhesives (there are none;
 *    the first local-post adhesives are New York 1842 and Zurich 1843) but because
 *    prepaid postal stationery (Sardinia 1819, New South Wales 1838) and adhesive
 *    revenue stamps both predate 1840.
 *
 *  - The Mulready was "quietly dropped." It was called in from November 1842 by the
 *    Board of Stamps and Taxes, and the returned stock destroyed.
 *    ⚠️ NOT the Inland Revenue. That board did not exist until the Inland Revenue
 *    Board Act 1849; several secondary sources use the name anachronistically here,
 *    and this page repeated the mistake for one draft.
 *
 *  - Letter volumes said "Britain." The figures are United Kingdom, and they count
 *    CHARGEABLE letters, so the 1839→1840 jump is flattered by the abolition of
 *    parliamentary franking on 10 January 1840. Both facts now stated.
 *
 *  - "The sender did not pay" was absolute. Either party could pay; the recipient
 *    usually did.
 *
 * STANDING EXCLUSIONS — editorial rules, not unfinished work. Do not "fix" these by
 * adding the missing material.
 *
 * 1. The story of Rowland Hill watching a young woman refuse a letter from her
 *    sweetheart. It is apocryphal AS TOLD ABOUT HILL, and the reason is worth keeping:
 *    it is Coleridge's story, told first-person in his Table Talk (Moxon, 1836) — a
 *    cottage at Keswick, a carter demanding a shilling, Coleridge paying, the woman
 *    then showing him the sheet was blank because her son had a prearranged signal.
 *    Correctly attributed to Coleridge it is citable, genuinely pre-1840, and the best
 *    single support for the code paragraph below. Ernest's call whether to use it.
 *    Never attribute it to Hill.
 *
 * 2. Any volume figure without a citation. The numbers now on the page have one;
 *    anything added later needs the same.
 */

function Rule() {
  return <div className="rule-hair my-6" />;
}

export default function About() {
  return (
    <div className="min-h-screen pb-16">
      <Masthead showHonesty={false} linkHome />

      <main className="mx-auto mt-8 max-w-3xl px-4">
        <p className="dateline text-center">The story behind the name</p>
        <h2
          className="masthead mt-2 text-center"
          style={{ fontSize: "clamp(1.5rem, 5vw, 2.6rem)", lineHeight: 1.08 }}
        >
          The year the post
          <br />
          stopped being a luxury
        </h2>

        <Rule />

        <div className="broadsheet-columns" style={{ color: "var(--ink)", lineHeight: 1.72 }}>
          <p className="dropcap" style={{ marginBottom: "1.1rem" }}>
            Before 1840, sending a letter in Britain worked backwards from the way you would expect.
            The sender usually did not pay. The <em>recipient</em> did — on the doorstep, in cash,
            before they were allowed to read a word. And the price was not flat. It climbed with the
            distance the letter had travelled, and again with every additional sheet of paper.
          </p>

          <p style={{ marginBottom: "1.1rem" }}>
            That made a letter a genuine expense, and it produced a small, quiet cruelty: people
            turned letters away. If the money was not there that week, the letter went back — from a
            son who had gone for work, from a family who had emigrated, from anyone far enough away
            that writing was the only way left to reach you.
          </p>

          <p style={{ marginBottom: "1.1rem" }}>
            So people cheated, cleverly. Refusing a letter cost nothing, and enough people refused
            that undelivered mail became a standing Post Office complaint. Contemporary
            accounts describe the trick that followed: a code agreed in advance and written on the
            <em> outside</em> — a particular mark, a way of addressing it, a deliberate slip of the
            pen. You read the cover on the doorstep, learned what you needed to know, and handed it
            back. The honest part: how common that was is not well documented, though the incentive
            for it certainly was.
          </p>

          <p style={{ marginBottom: "1.1rem" }}>
            Then a schoolmaster-turned-reformer named <strong>Rowland Hill</strong> published a
            pamphlet arguing something that sounds obvious now and was heresy then: the real cost of
            carrying a letter had almost nothing to do with how far it went. Nearly all of it was in
            the <em>handling</em> — the sorting, the ledgers, the collecting of money at ten thousand
            front doors. The elaborate pricing system was not recovering the cost. The pricing system
            <em> was</em> the cost.
          </p>

          <p style={{ marginBottom: "1.1rem" }}>
            His proposal: charge one penny. Same penny to anywhere in the country. Paid by the sender,
            in advance, so nobody ever again had to decide at the door whether they could afford to
            hear from someone they loved.
          </p>

          <p style={{ marginBottom: "1.1rem" }}>
            The <strong>Uniform Penny Post</strong> began on <strong>10 January 1840</strong>. A few
            months later came the mechanism that made prepayment practical — a small gummed label you
            stuck to the letter yourself. The <strong>Penny Black</strong>, the first adhesive postage
            stamp issued by a public postal service.
          </p>

          <p style={{ marginBottom: "1.1rem" }}>
            It arrived without perforations, because no one had invented the machine yet. Post offices
            were sent sheets and a pair of scissors. Every Penny Black in every collection today was
            cut out by hand — which is why the good ones are judged partly on how straight somebody
            cut, in 1840, at a counter, in a hurry.
          </p>

          <p style={{ marginBottom: "1.1rem" }}>
            Alongside the stamp the Post Office issued something it expected to be far more popular: an
            ornate illustrated envelope, designed by a Royal Academician, allegorical figures spilling
            across it, Britannia dispatching winged messengers to the corners of the earth. The public
            thought it was ridiculous. It was caricatured mercilessly, and then it died slowly and
            expensively: a replacement envelope went on sale in February 1841, the Board of Stamps
            and Taxes began calling in the unsold stock in November 1842, and the returned sheets sat
            in a warehouse while somebody worked out how to destroy them. Burning failed. A machine
            was built to punch the centre out of every one. The beautiful designed object lost; the
            plain sticky label won and is still winning.
          </p>

          <p style={{ marginBottom: "1.1rem" }}>
            And the letters came. The United Kingdom posted 76 million chargeable letters in 1839 and
            169 million in 1840, and the number kept climbing for decades. Some of that first jump is
            bookkeeping: parliamentary free franking ended on the very day the penny post began, which
            moved millions of previously free letters into the chargeable count. The rest is real. Not
            because anyone had been persuaded to write more, but because writing had stopped being
            something you had to be able to afford. The demand had been sitting there the whole time,
            priced out.
          </p>
        </div>

        <Rule />

        <div className="mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
          <div className="w-16">
            <Stamp cancelled />
          </div>
          <h3 className="smallcaps" style={{ fontFamily: "var(--display)", fontSize: "1rem", color: "var(--ink-soft)" }}>
            why a postcard toy is named after it
          </h3>
          <p style={{ color: "var(--ink)", lineHeight: 1.72 }}>
            Because it is the same shape as the thing I actually care about. Something capable and
            useful gets held behind a price, or a login, or an account, or a form that wants your
            details — and then somebody makes it cheap and open, and it turns out an enormous number
            of people were waiting.
          </p>
          <p style={{ color: "var(--ink-soft)", lineHeight: 1.72 }}>
            So this one asks you for nothing. There is no account, no database, and no email. Nothing
            you write here reaches a server, because there is no server — it is a page, running in your
            browser, and everything you make lives in this tab until you close it. You do not have to
            take my word for that. Open your developer tools, watch the network panel, and use the
            whole thing. Nothing should leave.
          </p>
        </div>

        <Rule />

        <div className="mx-auto max-w-xl">
          <h3 className="smallcaps mb-3" style={{ fontFamily: "var(--display)", fontSize: "1rem", color: "var(--ink-soft)" }}>
            one liberty, admitted
          </h3>
          <p style={{ color: "var(--ink)", lineHeight: 1.72 }}>
            The picture postcard did not exist in 1840. It is roughly fifty years late for this party —
            the 1840s had letters, and folded sheets, and sealing wax. I have borrowed the year, the
            typography and the stamp for something that had not been invented yet, and I would rather
            say so plainly than have you notice on your own and wonder what else I fudged.
          </p>
        </div>

        <Rule />

        <div className="mx-auto max-w-xl text-center">
          <h3 className="smallcaps mb-3" style={{ fontFamily: "var(--display)", fontSize: "1rem", color: "var(--ink-soft)" }}>
            how this was built
          </h3>
          {/* ⛔ Architecture claims deliberately do NOT live here any more. They were
              duplicated between this paragraph and the writeup, and two pages asserting
              the same facts is how they end up contradicting each other. This page owns
              WHY IT IS CALLED THAT; /under-the-hood/ owns HOW IT WAS MADE, rendered from
              apps/pennypost/WRITEUP.md. The one fact kept here is the human one, because
              it belongs beside the human story rather than beside the stack. */}
          <p style={{ color: "var(--ink)", lineHeight: 1.72 }}>
            It was built at nights and on days off, around a full-time restaurant job, which is the
            honest answer to how most of my things get built. The full account of how it was made,
            including the decisions that turned out to be wrong, is{" "}
            <Link href="/under-the-hood/" style={{ color: "var(--ink)", fontFamily: "var(--display)" }}>
              under the hood
            </Link>
            .
          </p>
          <p className="mt-4" style={{ color: "var(--ink-soft)", lineHeight: 1.72 }}>
            I teach people to use AI tools without the hype — mostly small businesses and people who
            have been told they are not technical.
          </p>
          <p className="mt-4">
            <a href="https://ernestofgaia.xyz" style={{ color: "var(--ink)", fontFamily: "var(--display)" }}>
              ernestofgaia.xyz
            </a>
            <span style={{ color: "var(--ink-faint)" }}> · </span>
            <a href="sms:503-664-0546" style={{ color: "var(--ink)", fontFamily: "var(--display)" }}>
              503-664-0546
            </a>
          </p>
        </div>

        <Rule />

        <p className="text-center">
          <Link href="/" style={{ color: "var(--ink)", fontFamily: "var(--display)" }}>
            ← Back to the counter
          </Link>
        </p>
      </main>
    </div>
  );
}
