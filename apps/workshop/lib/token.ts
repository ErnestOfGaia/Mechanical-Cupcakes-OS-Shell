/**
 * UTM token format rules (Round 2 §10, AGENTS - Marketing rule 10d).
 *
 * One campaign, one token; minting and declaring are the same act. Two campaigns
 * sharing a token is unrecoverable — attribution cannot be backfilled — so the format
 * is validated on entry rather than discovered broken in analytics.
 *
 * FORMAT lives here (client-safe, pure). UNIQUENESS lives wherever the token register
 * can be read — the register's single home is the weekly analytics digest skill, and
 * per its own rule the table is never copied elsewhere, this app included.
 */

/** Error message, or null when the token is well-formed. */
export function tokenError(token: string): string | null {
  if (!token) return null; // absent is a valid state — undated, untokened is normal
  if (token !== token.toLowerCase()) return "tokens are lowercase";
  if (/_/.test(token)) return "no underscores — kebab-case";
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(token)) return "kebab-case only: letters, digits, single hyphens";
  if (token.length > 24) return `${token.length} chars — the limit is 24`;
  return null;
}

/** Same shape for the utm_content prefix; posts become `<prefix>-NN`. */
export function prefixError(prefix: string): string | null {
  if (!prefix) return null;
  if (prefix !== prefix.toLowerCase()) return "prefixes are lowercase";
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(prefix)) return "kebab-case only: letters, digits, single hyphens";
  if (prefix.length > 12) return `${prefix.length} chars — keep it short; posts append -NN`;
  return null;
}
