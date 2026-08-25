/**
 * The reality read: what is ACTUALLY scheduled in Postiz.
 *
 * ⚖️ This is the I/O half of the calendar, deliberately in its own file. `lib/calendar.ts`
 * stays pure — no fetch, no fs, no child processes — so the projection and the merge
 * remain testable with plain data. Everything that can fail lives here.
 *
 * Why the CLI rather than the HTTP API: `postiz` already resolves auth (POSTIZ_API_KEY)
 * and the base URL (POSTIZ_API_URL, unset locally, so the CLI's own default applies).
 * Re-deriving that here would mean guessing a URL and copying a credential into a second
 * place. The CLI's output shape was verified against the live account 2026-08-09.
 *
 * 🔑 The contract that matters: this function NEVER throws and never returns a partial
 * list dressed as a complete one. Any failure comes back as `{ ok: false, error }`, and
 * the calendar renders that loudly. A reality read that fails quietly would report a
 * free slot on a day that is already taken — the exact defect this layer was built for.
 */
import { execFile } from "child_process";
import type { Reality, ScheduledPost } from "./calendar";

/** Postiz's own default window is ±30 days; we ask for the month explicitly. */
function monthWindow(month: string): { start: string; end: string } {
  const [y, m] = month.split("-").map(Number);
  // A day of padding each side: Postiz filters on UTC, we bucket on Pacific, and a post
  // late on the last PT day of the month is an early-UTC instant in the next one.
  const start = new Date(Date.UTC(y, m - 1, 1));
  start.setUTCDate(start.getUTCDate() - 1);
  const end = new Date(Date.UTC(y, m, 1));
  end.setUTCDate(end.getUTCDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

/** Pull the JSON object out of the CLI's human-decorated output ("📋 Posts:" then JSON). */
export function parsePostizOutput(raw: string): ScheduledPost[] {
  const m = /\{[\s\S]*\}/.exec(raw);
  if (!m) throw new Error("no JSON object in postiz output");
  const parsed = JSON.parse(m[0]) as {
    posts?: Array<{
      id?: string; publishDate?: string; state?: string; content?: string;
      integration?: { providerIdentifier?: string };
    }>;
  };
  if (!Array.isArray(parsed.posts)) throw new Error("postiz output has no posts array");
  return parsed.posts.map((p) => ({
    id: String(p.id ?? ""),
    publishDate: String(p.publishDate ?? ""),
    state: String(p.state ?? ""),
    content: String(p.content ?? ""),
    provider: String(p.integration?.providerIdentifier ?? "unknown"),
  }));
}

/**
 * Read the month's scheduled posts. Resolves to `{ ok: false, error }` on every failure
 * path — missing CLI, missing credential, non-zero exit, timeout, unparseable output.
 */
export async function readPostizMonth(month: string, timeoutMs = 15_000): Promise<Reality> {
  if (!process.env.POSTIZ_API_KEY) {
    return { ok: false, posts: [], error: "Postiz is not configured here (no POSTIZ_API_KEY) — reality layer off." };
  }
  const { start, end } = monthWindow(month);
  try {
    const raw = await new Promise<string>((resolve, reject) => {
      execFile(
        "postiz",
        ["posts:list", "--startDate", start, "--endDate", end],
        { timeout: timeoutMs, maxBuffer: 20 * 1024 * 1024, shell: true, windowsHide: true },
        (err, stdout) => (err ? reject(err) : resolve(stdout)),
      );
    });
    return { ok: true, posts: parsePostizOutput(raw) };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    // Name the most common cause rather than surfacing a raw ENOENT.
    const hint = /ENOENT|not recognized|not found/i.test(msg)
      ? "the `postiz` CLI is not on this process's PATH"
      : msg.split("\n")[0];
    return { ok: false, posts: [], error: `Could not read Postiz — ${hint}` };
  }
}
