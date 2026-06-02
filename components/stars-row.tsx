"use client";

/**
 * Renders three stars in a row, lit up to `value`.
 * Used inside practice screens so the child sees progress while answering.
 */
export function StarsRow({ value, max = 3, size = 22 }: { value: number; max?: number; size?: number }) {
  const items = Array.from({ length: max });
  return (
    <div className="inline-flex items-center gap-1" aria-label={`${value} из ${max} звёзд`}>
      {items.map((_, i) => {
        const lit = i < value;
        return (
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className={lit ? "" : "opacity-40"}
            aria-hidden="true"
          >
            <path
              d="M12 2.5l2.9 6 6.6.9-4.8 4.7 1.2 6.6L12 17.6 6.1 20.7l1.2-6.6L2.5 9.4l6.6-.9L12 2.5z"
              fill={lit ? "#FFD166" : "#E5E7EB"}
              stroke={lit ? "#E0A800" : "#CBD5E1"}
              strokeWidth="1"
              strokeLinejoin="round"
            />
          </svg>
        );
      })}
    </div>
  );
}
