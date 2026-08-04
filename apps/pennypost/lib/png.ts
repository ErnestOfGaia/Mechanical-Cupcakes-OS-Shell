import type { Card } from "./types";

/**
 * Turn a card into a PNG the visitor can keep.
 *
 * This is the take-home artifact — the thing that replaces "we emailed it to you"
 * in a build that deliberately sends no email.
 *
 * Two things here are less obvious than they look:
 *
 * 1. The engraving is inline SVG styled with CSS custom properties. Those DO NOT
 *    resolve once the SVG is serialised into a standalone data URL — there is no
 *    document for `var(--ink)` to look up, so every stroke silently renders black
 *    on black. The variables have to be substituted with their computed values
 *    before serialising.
 *
 * 2. On iOS Safari, `<a download>` on a blob URL is unreliable. `navigator.share`
 *    with a file is the path that actually works there — and it doubles as the
 *    honest "send this to yourself" route, since the visitor's own apps do the
 *    sending.
 */

const VAR_NAMES = [
  "--ink",
  "--ink-soft",
  "--ink-faint",
  "--paper",
  "--paper-raised",
  "--paper-sunk",
  "--rule",
  "--rule-soft",
  "--cancel",
  "--cancel-soft",
] as const;

function resolveVars(): Record<string, string> {
  const computed = getComputedStyle(document.documentElement);
  const out: Record<string, string> = {};
  for (const name of VAR_NAMES) {
    out[name] = computed.getPropertyValue(name).trim() || "#000000";
  }
  return out;
}

/** Serialise an SVG element with its CSS variables baked into literal colours. */
function serialiseSvg(svg: SVGSVGElement, vars: Record<string, string>): string {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  let markup = new XMLSerializer().serializeToString(clone);
  for (const [name, value] of Object.entries(vars)) {
    // Both `var(--x)` and `var(--x, fallback)` forms.
    markup = markup.replace(new RegExp(`var\\(\\s*${name}\\s*(?:,[^)]*)?\\)`, "g"), value);
  }
  return markup;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("engraving failed to rasterise"));
    img.src = src;
  });
}

/** Wrap text to a pixel width, returning lines. */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    let line = "";
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const candidate = line ? `${line} ${word}` : word;
      if (ctx.measureText(candidate).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    }
    lines.push(line);
  }
  return lines;
}

export type ExportResult =
  | { ok: true; shared: boolean }
  | { ok: false; error: string };

export async function exportCardPng(svg: SVGSVGElement | null, card: Card): Promise<ExportResult> {
  if (!svg) return { ok: false, error: "nothing to draw yet" };

  try {
    const vars = resolveVars();
    const markup = serialiseSvg(svg, vars);
    const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
    const engraving = await loadImage(dataUrl);

    // 2× for a crisp result on a phone screen or in a printout.
    const S = 2;
    const W = 600 * S;
    // Height must clear: plate (W-2M at 3:2) + caption + up to 3 wrapped message
    // lines + the signature + the footer rule. At 470 the signature landed below
    // the canvas and the footer rule cut straight through it.
    const H = 505 * S;
    const M = 24 * S;

    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return { ok: false, error: "canvas unavailable" };

    const display = `"Bookman Old Style", "Book Antiqua", "Palatino Linotype", Palatino, Georgia, serif`;

    // Paper
    ctx.fillStyle = vars["--paper"];
    ctx.fillRect(0, 0, W, H);

    // Plate: 3:2 engraving
    const plateW = W - M * 2;
    const plateH = Math.round(plateW / 1.5);
    ctx.drawImage(engraving, M, M, plateW, plateH);

    // Plate border — heavy inside hair, as struck
    ctx.strokeStyle = vars["--ink"];
    ctx.lineWidth = 1.6 * S;
    ctx.strokeRect(M, M, plateW, plateH);

    const belowY = M + plateH + 22 * S;

    // Caption
    ctx.fillStyle = vars["--ink"];
    ctx.font = `600 ${13 * S}px ${display}`;
    ctx.textAlign = "left";
    ctx.fillText(`To ${card.to}`, M, belowY);

    ctx.fillStyle = vars["--ink-soft"];
    ctx.font = `${11 * S}px ${display}`;
    const msgLines = wrap(ctx, card.message, plateW - 108 * S).slice(0, 3);
    msgLines.forEach((line, i) => {
      ctx.fillText(line, M, belowY + (17 + i * 15) * S);
    });

    ctx.fillStyle = vars["--ink-faint"];
    ctx.font = `${10 * S}px ${display}`;
    ctx.fillText(`— ${card.from}`, M, belowY + (17 + msgLines.length * 15 + 4) * S);

    // Postmark ring, struck at the right
    const cx = W - M - 40 * S;
    const cy = belowY + 24 * S;
    ctx.strokeStyle = vars["--cancel"];
    ctx.globalAlpha = 0.75;
    ctx.lineWidth = 1.6 * S;
    ctx.beginPath();
    ctx.arc(cx, cy, 36 * S, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 0.8 * S;
    ctx.beginPath();
    ctx.arc(cx, cy, 30 * S, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = vars["--cancel"];
    ctx.textAlign = "center";
    ctx.font = `600 ${8 * S}px ${display}`;
    ctx.fillText("PENNY POST", cx, cy - 8 * S);
    ctx.font = `600 ${9 * S}px ${display}`;
    ctx.fillText(card.dateLabel, cx, cy + 5 * S);
    ctx.font = `600 ${7 * S}px ${display}`;
    ctx.fillText("PAID", cx, cy + 18 * S);
    ctx.globalAlpha = 1;

    // Footer rule + provenance
    ctx.strokeStyle = vars["--rule"];
    ctx.lineWidth = 1 * S;
    ctx.beginPath();
    ctx.moveTo(M, H - 26 * S);
    ctx.lineTo(W - M, H - 26 * S);
    ctx.stroke();

    ctx.fillStyle = vars["--ink-faint"];
    ctx.textAlign = "left";
    ctx.font = `${9 * S}px ${display}`;
    ctx.fillText("The Penny Post · mechanicalcupcakes.fun", M, H - 12 * S);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) return { ok: false, error: "could not encode the image" };

    const filename = `penny-post-${card.to.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "card"}.png`;
    const file = new File([blob], filename, { type: "image/png" });

    // Prefer the share sheet where it can take files — this is the iOS path, and
    // it is also how a visitor genuinely "sends it to themselves".
    const nav = navigator as Navigator & {
      canShare?: (data: ShareData) => boolean;
    };
    if (typeof navigator.share === "function" && nav.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "A postcard" });
        return { ok: true, shared: true };
      } catch (err) {
        // A cancelled share sheet is not a failure — fall through to download.
        if ((err as Error)?.name === "AbortError") return { ok: true, shared: true };
      }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    // Revoke on the next frame; revoking synchronously can cancel the download.
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    return { ok: true, shared: false };
  } catch (err) {
    return { ok: false, error: (err as Error)?.message ?? "something went wrong" };
  }
}
