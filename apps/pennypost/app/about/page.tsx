import Link from "next/link";
import type { Metadata } from "next";
import { Masthead } from "@/components/Masthead";
import { Stamp } from "@/components/Stamp";

export const metadata: Metadata = {
  title: "Why it is called The Penny Post",
  description:
    "In 1840 the post stopped being a luxury. Here is what changed, and why a little postcard toy is named after it.",
};

/* ⚠️ FACT-CHECK BEFORE THIS GOES LIVE.
 *
 * Every date and name below is written from recall and ships publicly under
 * Ernest's name. Verify against a real source — the Postal Museum, the Royal Mail
 * archive, Britannica — and record the sources in the commit message.
 *
 * Specifically confirm: the 1837 pamphlet title; 10 January 1840 for the uniform
 * rate; 1 May / 6 May 1840 for the Penny Black's issue and validity; that the
 * Mulready was withdrawn rather than merely mocked.
 *
 * Deliberately NOT included: the widely-repeated story of Rowland Hill watching a
 * young woman refuse a letter from her sweetheart. It is the best anecdote in the
 * whole subject and it is very probably apocryphal. A page whose entire premise is
 * "these are real facts" cannot afford it.
 *
 * Deliberately NOT included: any specific figure for how far letter volumes rose.
 * The direction is not in dispute; the number needs a citation nobody has supplied
 * yet. Add one, with a source, or leave the sentence as it is.
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
            The sender did not pay. The <em>recipient</em> did — on the doorstep, in cash, before
            they were allowed to read a word. And the price was not flat. It climbed with the
            distance the letter had travelled, and again with every additional sheet of paper.
          </p>

          <p style={{ marginBottom: "1.1rem" }}>
            That made a letter a genuine expense, and it produced a small, quiet cruelty: people
            turned letters away. If the money was not there that week, the letter went back — from a
            son who had gone for work, from a family who had emigrated, from anyone far enough away
            that writing was the only way left to reach you.
          </p>

          <p style={{ marginBottom: "1.1rem" }}>
            So people cheated, cleverly. Since you could examine a letter before deciding whether to
            pay for it, correspondents worked out codes in advance and wrote them on the
            <em> outside</em> — a particular mark, a way of addressing it, a deliberate slip of the
            pen. You looked at the envelope on the doorstep, learned what you needed to know, and
            refused it. An entire secret language, invented so that poor people could hear from each
            other for nothing.
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
            stamp anywhere in the world.
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
            thought it was ridiculous. It was caricatured mercilessly and quietly dropped. The
            beautiful designed object lost; the plain sticky label won and is still winning.
          </p>

          <p style={{ marginBottom: "1.1rem" }}>
            And the letters came. Volumes rose immediately and kept rising — not because anyone had
            been persuaded to write more, but because writing had stopped being something you had to
            be able to afford. The demand had been sitting there the whole time, priced out.
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
          <p style={{ color: "var(--ink)", lineHeight: 1.72 }}>
            A static site — no backend, no framework of accounts, no analytics. The engravings are
            drawn in code rather than photographed, which is cheaper and also happens to be the correct
            idiom for 1840. It was built at nights and on days off, around a full-time restaurant job,
            which is the honest answer to how most of my things get built.
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
