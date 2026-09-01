import Link from "next/link";
import type { Metadata } from "next";
import Markdown from "markdown-to-jsx";
import { Masthead } from "@/components/Masthead";
import { readWriteup } from "@/lib/writeup";

/**
 * "Under the Hood" — the development and architecture writeup, rendered.
 *
 * ⭐ THE ONE RULE FOR THIS PAGE: it renders `WRITEUP.md` and does not restate it.
 * The file in the repo and the page a visitor reads are the same bytes, so they
 * cannot drift apart. If you find yourself typing prose into this file, stop —
 * it belongs in WRITEUP.md.
 *
 * The read happens at BUILD time. `output: "export"` still runs Server Components
 * in Node during `next build`; the export is a post-pass. See lib/writeup.ts for
 * why that is the mirror image of this app's sessionStorage rule rather than an
 * exception to it.
 *
 * `markdown-to-jsx` is a devDependency, not a dependency, and that is accurate
 * rather than a dodge: the shipped artifact is nginx serving static files, so no
 * node_modules of any kind reaches production. The app still has exactly three
 * runtime dependencies, which is a claim the README makes out loud.
 */

export const metadata: Metadata = {
  title: "Under the Hood — The Penny Post",
  description:
    "How The Penny Post was actually built: the decisions, the architecture, and the five things that were harder than they looked.",
};

// Redundant under `output: "export"`, which cannot emit a dynamic route at all.
// Kept because it states the invariant in code rather than in a comment alone.
export const dynamic = "force-static";

function Rule() {
  return <div className="rule-hair my-6" />;
}

/* The writeup is authored as a standalone document, so it opens with an `#` of its
   own. The Masthead already owns this page's <h1>, so that becomes the headline
   <h2> — which means the page title comes from the file too, and there is no
   second place to edit it. */
function WriteupTitle({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      {...props}
      className="masthead mt-2 text-center"
      style={{ fontSize: "clamp(1.4rem, 4.4vw, 2.2rem)", lineHeight: 1.1 }}
    >
      {children}
    </h2>
  );
}

/* Section heads are full assertions rather than labels, so they are set in the
   display face at reading size instead of the small-caps treatment the About page
   uses for its two- and three-word subheads. Small caps with 0.14em tracking on a
   ten-word sentence is unreadable. Hair rule above, as a broadsheet subhead. */
function SectionHead({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <>
      <div className="rule-hair mt-9 mb-5" />
      <h3
        {...props}
        style={{
          fontFamily: "var(--display)",
          fontSize: "1.16rem",
          fontWeight: 700,
          lineHeight: 1.3,
          color: "var(--ink)",
          marginBottom: "0.85rem",
        }}
      >
        {children}
      </h3>
    </>
  );
}

function SubHead({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h4
      {...props}
      className="smallcaps"
      style={{
        fontFamily: "var(--display)",
        fontSize: "0.95rem",
        color: "var(--ink-soft)",
        marginTop: "1.6rem",
        marginBottom: "0.6rem",
      }}
    >
      {children}
    </h4>
  );
}

function Divider() {
  return <div className="rule-double my-8" />;
}

function Quote({ children, ...props }: React.HTMLAttributes<HTMLQuoteElement>) {
  return (
    <blockquote
      {...props}
      style={{
        borderLeft: "1px solid var(--rule)",
        paddingLeft: "1rem",
        marginBottom: "1.1rem",
        color: "var(--ink-soft)",
      }}
    >
      {children}
    </blockquote>
  );
}

export default function UnderTheHood() {
  const writeup = readWriteup();

  return (
    <div className="min-h-screen pb-16">
      <Masthead showHonesty={false} linkHome />

      <main className="mx-auto mt-8 max-w-3xl px-4">
        <p className="dateline text-center">A description of the mechanism</p>

        <div className="writeup">
          <Markdown
            options={{
              overrides: {
                h1: WriteupTitle,
                h2: SectionHead,
                h3: SubHead,
                hr: Divider,
                blockquote: Quote,
              },
            }}
          >
            {writeup}
          </Markdown>
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
