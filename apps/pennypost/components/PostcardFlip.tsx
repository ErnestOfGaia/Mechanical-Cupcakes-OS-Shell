"use client";

import { useId, useState } from "react";
import { Engraving, ENGRAVINGS } from "./Engravings";
import { Stamp, Postmark } from "./Stamp";
import type { Card } from "@/lib/types";

/**
 * The flip card.
 *
 * The 3D mechanic comes from `.postcard-flip` / `.postcard-inner` / `.flipped` in
 * globals.css, ported verbatim from the private original — the one thing this app
 * takes from it. Everything else here is new: the original rendered a
 * database-backed photo through next/image and was covered in hearts.
 */
export function PostcardFlip({ card, autoFocus = false }: { card: Card; autoFocus?: boolean }) {
  const [flipped, setFlipped] = useState(false);
  const labelId = useId();
  const meta = ENGRAVINGS[card.engraving] ?? ENGRAVINGS["writing-desk"];

  return (
    <div className="mx-auto w-full">
      <div
        className="postcard-flip w-full cursor-pointer"
        role="button"
        tabIndex={0}
        aria-labelledby={labelId}
        aria-pressed={flipped}
        autoFocus={autoFocus}
        onClick={() => setFlipped((f) => !f)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setFlipped((f) => !f);
          }
        }}
      >
        <span id={labelId} className="sr-only">
          {flipped
            ? `Back of the card to ${card.to}. Activate to turn it over.`
            : `${meta.label}. Activate to turn the card over and read it.`}
        </span>

        {/* 3:2, the proportion of a real card. */}
        <div className="relative w-full" style={{ paddingBottom: "66.67%" }}>
          <div className={`postcard-inner ${flipped ? "flipped" : ""}`}>
            {/* ------------------------------------------------------- front */}
            <div
              className="postcard-front"
              style={{
                background: "var(--paper-raised)",
                border: "1px solid var(--rule)",
                boxShadow: "0 1px 0 var(--rule-soft), 0 10px 24px -18px rgba(26,21,18,0.6)",
              }}
            >
              <div className="absolute inset-0">
                <Engraving id={card.engraving} />
              </div>
              {/* Caption plate along the bottom, as an engraving carried its title. */}
              <div
                className="absolute inset-x-0 bottom-0 px-3 py-1.5 text-center"
                style={{ background: "var(--paper)", borderTop: "1px solid var(--rule)" }}
              >
                <span
                  className="smallcaps"
                  style={{ fontFamily: "var(--display)", fontSize: "0.66rem", color: "var(--ink-soft)" }}
                >
                  {meta.caption}
                </span>
              </div>
            </div>

            {/* -------------------------------------------------------- back */}
            <div
              className="postcard-back"
              style={{
                background: "var(--paper-raised)",
                border: "1px solid var(--rule)",
                boxShadow: "0 1px 0 var(--rule-soft), 0 10px 24px -18px rgba(26,21,18,0.6)",
              }}
            >
              <div className="absolute inset-0 flex">
                {/* Left half: the message */}
                <div className="flex min-w-0 flex-[1.15] flex-col p-[4%]">
                  <p
                    className="script min-w-0 flex-1 overflow-hidden break-words"
                    style={{
                      color: "var(--ink)",
                      fontSize: "clamp(0.62rem, 2.1cqw, 1rem)",
                      lineHeight: 1.5,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {card.message}
                  </p>
                  <p
                    className="script mt-[3%] shrink-0 text-right"
                    style={{ color: "var(--ink-soft)", fontSize: "clamp(0.58rem, 1.9cqw, 0.92rem)" }}
                  >
                    — {card.from}
                  </p>
                </div>

                {/* The vertical rule down the middle of a postcard back */}
                <div style={{ width: 1, background: "var(--rule)" }} aria-hidden />

                {/* Right half: stamp, postmark, address */}
                <div className="relative flex flex-1 flex-col p-[4%]">
                  <div className="flex items-start justify-between gap-[4%]">
                    <div className="w-[34%] max-w-[64px]">
                      <Postmark dateLabel={card.dateLabel} className="h-auto w-full" />
                    </div>
                    <div className="w-[26%] max-w-[46px]">
                      <Stamp cancelled className="h-auto w-full" />
                    </div>
                  </div>

                  <div className="mt-auto">
                    <div className="mb-[6%] space-y-[8%]">
                      <div style={{ borderBottom: "1px solid var(--rule-soft)" }} />
                      <div style={{ borderBottom: "1px solid var(--rule-soft)" }} />
                    </div>
                    <p
                      className="script truncate"
                      style={{ color: "var(--ink)", fontSize: "clamp(0.62rem, 2cqw, 0.98rem)" }}
                    >
                      {card.to}
                    </p>
                    <div className="mt-[8%] space-y-[10%]">
                      <div style={{ borderBottom: "1px solid var(--rule-soft)" }} />
                      <div style={{ borderBottom: "1px solid var(--rule-soft)" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="dateline mt-2 text-center" aria-hidden>
        {flipped ? "click to turn back" : "click the card to read it"}
      </p>
    </div>
  );
}
