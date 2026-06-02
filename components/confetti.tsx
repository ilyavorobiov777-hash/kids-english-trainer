"use client";

import { useEffect, useState } from "react";

type Piece = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  rotate: number;
  size: number;
};

const COLORS = ["#E84D7A", "#FFC58A", "#7DC6FF", "#A8E6BE", "#FFD166", "#C8B6FF"];

function makePieces(count: number): Piece[] {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 250,
    duration: 1400 + Math.random() * 1400,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rotate: Math.random() * 360,
    size: 6 + Math.random() * 8
  }));
}

/**
 * Lightweight confetti burst.
 * Renders 60 falling pieces for ~2.5s then unmounts itself.
 * Pass `trigger` prop changes to replay.
 */
export function Confetti({ trigger = 0, durationMs = 2600 }: { trigger?: number; durationMs?: number }) {
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    setPieces(makePieces(60));
    setShow(true);
    const id = window.setTimeout(() => setShow(false), durationMs);
    return () => window.clearTimeout(id);
  }, [trigger, durationMs]);

  if (!show) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            position: "absolute",
            top: -20,
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.4,
            background: p.color,
            transform: `rotate(${p.rotate}deg)`,
            borderRadius: 2,
            animation: `confetti-fall ${p.duration}ms ${p.delay}ms ease-in forwards`
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translate3d(0, -20px, 0) rotate(0deg); opacity: 1; }
          100% { transform: translate3d(0, 100vh, 0) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
