"use client";

import { useEffect, useState } from "react";

export type CatMood = "idle" | "happy" | "sad" | "wave" | "sleepy";

type Props = {
  mood?: CatMood;
  size?: number;
  className?: string;
  name?: string;
  speech?: string;
};

/**
 * Friendly cat mascot "Whiskers" (Усатик).
 * Pure inline SVG, no external assets, no licensing concerns.
 * Renders different facial expressions based on `mood`.
 */
export function CatMascot({ mood = "idle", size = 120, className = "", name, speech }: Props) {
  // Tiny "blink" animation: every ~4 seconds eyes shut briefly.
  const [blink, setBlink] = useState(false);
  useEffect(() => {
    const id = window.setInterval(() => {
      setBlink(true);
      window.setTimeout(() => setBlink(false), 160);
    }, 4200);
    return () => window.clearInterval(id);
  }, []);

  const showSpeech = Boolean(speech);

  return (
    <div className={`inline-flex items-end gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 160 160"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={`Котёнок ${name ?? "Усатик"}`}
      >
        {/* Body / head */}
        <ellipse cx="80" cy="92" rx="56" ry="50" fill="#FFC58A" />
        <ellipse cx="80" cy="90" rx="56" ry="48" fill="#FFD9A8" />

        {/* Ears */}
        <polygon points="32,52 28,12 62,38" fill="#FFC58A" />
        <polygon points="128,52 132,12 98,38" fill="#FFC58A" />
        <polygon points="36,46 36,22 56,36" fill="#FF9B6A" />
        <polygon points="124,46 124,22 104,36" fill="#FF9B6A" />

        {/* Cheek blush when happy */}
        {mood === "happy" && (
          <>
            <ellipse cx="44" cy="100" rx="9" ry="5" fill="#FF8FB0" opacity="0.75" />
            <ellipse cx="116" cy="100" rx="9" ry="5" fill="#FF8FB0" opacity="0.75" />
          </>
        )}

        {/* Eyes */}
        {blink || mood === "sleepy" ? (
          <>
            <path d="M52 88 Q60 92 68 88" stroke="#243042" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M92 88 Q100 92 108 88" stroke="#243042" strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        ) : mood === "happy" ? (
          <>
            <path d="M48 90 Q60 78 70 90" stroke="#243042" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M90 90 Q102 78 112 90" stroke="#243042" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          </>
        ) : mood === "sad" ? (
          <>
            <circle cx="60" cy="88" r="5" fill="#243042" />
            <circle cx="100" cy="88" r="5" fill="#243042" />
            <circle cx="62" cy="86" r="1.6" fill="#fff" />
            <circle cx="102" cy="86" r="1.6" fill="#fff" />
            {/* tear */}
            <path d="M58 96 Q56 104 60 108 Q64 104 62 96 Z" fill="#7DC6FF" />
          </>
        ) : (
          <>
            <circle cx="60" cy="88" r="6" fill="#243042" />
            <circle cx="100" cy="88" r="6" fill="#243042" />
            <circle cx="62" cy="86" r="2" fill="#fff" />
            <circle cx="102" cy="86" r="2" fill="#fff" />
          </>
        )}

        {/* Nose */}
        <path d="M76 102 L84 102 L80 108 Z" fill="#E84D7A" />

        {/* Mouth */}
        {mood === "happy" ? (
          <path d="M68 112 Q80 124 92 112" stroke="#243042" strokeWidth="3" fill="none" strokeLinecap="round" />
        ) : mood === "sad" ? (
          <path d="M68 120 Q80 110 92 120" stroke="#243042" strokeWidth="3" fill="none" strokeLinecap="round" />
        ) : mood === "wave" ? (
          <path d="M70 114 Q80 118 90 114" stroke="#243042" strokeWidth="3" fill="none" strokeLinecap="round" />
        ) : (
          <path d="M72 114 Q80 119 88 114" stroke="#243042" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        )}

        {/* Whiskers */}
        <g stroke="#243042" strokeWidth="1.5" strokeLinecap="round">
          <line x1="48" y1="108" x2="28" y2="104" />
          <line x1="48" y1="112" x2="28" y2="114" />
          <line x1="112" y1="108" x2="132" y2="104" />
          <line x1="112" y1="112" x2="132" y2="114" />
        </g>

        {/* Wave hand for greeting mood */}
        {mood === "wave" && (
          <g>
            <ellipse cx="138" cy="78" rx="9" ry="7" fill="#FFC58A" />
            <ellipse cx="138" cy="78" rx="6" ry="4.5" fill="#FFD9A8" />
          </g>
        )}
      </svg>
      {showSpeech && (
        <div className="relative max-w-[220px] rounded-2xl bg-white px-3 py-2 text-sm font-semibold text-ink shadow-soft">
          <span
            className="absolute -left-2 bottom-3 h-3 w-3 rotate-45 bg-white"
            aria-hidden="true"
          />
          {speech}
        </div>
      )}
    </div>
  );
}
