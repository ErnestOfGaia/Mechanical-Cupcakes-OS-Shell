import Link from "next/link";

/**
 * The masthead of a Victorian broadsheet: title, double rule, and a dateline strip
 * carrying issue number and price — which is genuinely how these papers ran, and
 * happens to be the right place to put the honesty notice.
 */
export function Masthead({
  showHonesty = true,
  linkHome = false,
}: {
  showHonesty?: boolean;
  linkHome?: boolean;
}) {
  const title = (
    <h1
      className="masthead text-center"
      style={{ fontSize: "clamp(1.9rem, 7vw, 3.6rem)", color: "var(--ink)" }}
    >
      The Penny Post
    </h1>
  );

  return (
    <header className="mx-auto w-full max-w-5xl px-4 pt-6">
      {linkHome ? (
        <Link href="/" className="block no-underline" style={{ color: "inherit" }}>
          {title}
        </Link>
      ) : (
        title
      )}

      <div className="rule-double mt-3" />

      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 py-2 text-center">
        <span className="dateline">No. 1</span>
        <span className="dateline" aria-hidden>
          ·
        </span>
        <span className="dateline">Established 1840</span>
        <span className="dateline" aria-hidden>
          ·
        </span>
        <span className="dateline">Price One Penny</span>
      </div>

      <div className="rule-hair" />

      {showHonesty && (
        <p
          className="mx-auto mt-3 max-w-2xl text-center"
          style={{ fontSize: "0.86rem", lineHeight: 1.55, color: "var(--ink-soft)" }}
        >
          Nothing here is sent, and nothing is stored. There is no account, no database and no
          email — everything you make stays in this browser tab and is gone when you close it.{" "}
          <span style={{ color: "var(--ink-faint)" }}>
            Open your developer tools and watch the network panel if you like; you should see
            nothing leave.
          </span>
        </p>
      )}
    </header>
  );
}
