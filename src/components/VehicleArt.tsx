import type { VehicleType } from "@/lib/types";

// Neon line-art stand-ins until real fleet photos are uploaded in /admin.
export function VehicleArt({ type, className = "", title }: { type: VehicleType; className?: string; title?: string }) {
  const gid = `g-${type}`;
  return (
    <svg viewBox="0 0 240 150" className={className} role="img" aria-label={title ?? type} fill="none">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#22e4ff" />
          <stop offset="1" stopColor="#ff2e88" />
        </linearGradient>
        <filter id={`${gid}-glow`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g stroke={`url(#${gid})`} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" filter={`url(#${gid}-glow)`}>
        {type === "atv" || type === "utv" ? (
          <>
            <circle cx="62" cy="110" r="28" />
            <circle cx="62" cy="110" r="10" />
            <circle cx="182" cy="110" r="26" />
            <circle cx="182" cy="110" r="9" />
            <path d="M24 96 Q60 56 102 86" />
            <path d="M148 88 Q182 58 220 92" />
            <path d="M100 88 H150" />
            <path d="M70 66 Q96 54 126 62 L124 72 L74 74 Z" />
            <path d="M124 64 L160 60 L168 76 L124 78" />
            <path d="M160 60 L170 38 M156 38 L184 35" />
            <path d="M26 70 H70 M190 66 H222" />
          </>
        ) : type === "dirtbike" ? (
          <>
            <circle cx="56" cy="110" r="30" />
            <circle cx="56" cy="110" r="5" />
            <circle cx="190" cy="110" r="30" />
            <circle cx="190" cy="110" r="5" />
            <path d="M56 110 L98 78 L150 74 L190 110" />
            <path d="M190 110 L164 44" />
            <path d="M152 40 L180 37" />
            <path d="M84 64 L140 58" />
            <path d="M120 58 Q142 46 162 54 L150 72" />
            <path d="M168 70 Q192 60 214 76" />
            <path d="M28 76 Q56 62 88 66" />
            <path d="M98 78 L112 96 H140" />
          </>
        ) : (
          <>
            <circle cx="64" cy="118" r="20" />
            <circle cx="180" cy="118" r="20" />
            <path d="M44 100 Q60 80 100 84 L150 86 L168 50" />
            <path d="M156 48 L184 44" />
            <path d="M80 72 L128 70" />
            <path d="M100 86 Q120 104 160 100 L180 98" />
          </>
        )}
      </g>
    </svg>
  );
}
