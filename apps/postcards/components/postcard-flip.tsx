"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, RotateCcw } from "lucide-react";

interface PostcardFlipProps {
  imageUrl: string;
  message: string;
  senderName: string;
  date: string;
}

export default function PostcardFlip({ imageUrl, message, senderName, date }: PostcardFlipProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const formattedDate = date ? new Date(date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "";

  return (
    <div
      className="postcard-flip w-full cursor-pointer mx-auto"
      onClick={() => setIsFlipped(!isFlipped)}
      role="button"
      tabIndex={0}
      onKeyDown={(e: React.KeyboardEvent) => { if (e?.key === "Enter" || e?.key === " ") setIsFlipped(!isFlipped); }}
    >
      <div className="relative w-full" style={{ paddingBottom: "66.67%" }}>
        <div className={`postcard-inner absolute inset-0 w-full h-full ${isFlipped ? "flipped" : ""}`}>
          {/* Front - Image */}
          <div className="postcard-front rounded-xl overflow-hidden shadow-lg border-4 border-white bg-amber-100">
            <div className="absolute inset-0">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt="Postcard front"
                  fill
                  className="object-cover bg-amber-100"
                  unoptimized
                  onError={(e) => {
                    // Fallback to placeholder if image is broken
                    (e.target as HTMLImageElement).src = "/images/katrina-mailbox-scene.png"; 
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Heart className="w-16 h-16 text-rose-300" />
                </div>
              )}
            </div>
            {/* Flip hint */}
            <div className="absolute bottom-2 right-2 bg-black/40 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <RotateCcw className="w-3 h-3" /> Tap to flip
            </div>
          </div>

          {/* Back - Message */}
          <div className="postcard-back rounded-xl overflow-hidden shadow-lg border-4 border-white bg-amber-50">
            <div className="absolute inset-0 flex flex-col">
              {/* Postcard lines pattern */}
              <div className="flex-1 p-6 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-rose-400" fill="currentColor" />
                  <span className="text-base sm:text-lg md:text-xl font-semibold text-rose-600">
                    From {senderName ?? "someone special"}
                  </span>
                </div>
                <div className="flex-1 overflow-auto flex items-center justify-center px-8 sm:px-16 md:px-24">
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap font-serif text-lg sm:text-xl md:text-2xl text-center max-w-2xl mx-auto">
                    {(message ?? "").replace(/^((?:Hi|Hey|Dear|Hello)[^!.,\n]+[!.,])\s*/i, "$1\n\n")}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-amber-200 pt-3">
                  <span className="text-sm md:text-base text-muted-foreground">{formattedDate}</span>
                  <div className="flex items-center gap-1">
                    <RotateCcw className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm md:text-base text-muted-foreground">Tap to flip</span>
                  </div>
                </div>
              </div>
              {/* Stamp decoration */}
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 w-20 h-24 sm:w-24 sm:h-28 md:w-28 md:h-32 border-2 border-dashed border-rose-300 rounded flex items-center justify-center bg-white/40 backdrop-blur-sm z-10">
                <Heart className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-rose-400" fill="currentColor" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
