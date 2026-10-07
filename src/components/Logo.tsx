// Original wordmark: neon script "Santa" between two palms, "RENTALS" below.
function PalmIcon({ flip = false }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 40 48" className={`h-8 w-7 ${flip ? "-scale-x-100" : ""}`} aria-hidden fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M20 47 C19 34 21 22 26 12" />
      <path d="M26 12 C20 6 10 6 4 12 M26 12 C24 4 30 0 36 2 M26 12 C32 8 39 12 39 18 M26 12 C20 14 14 20 13 27 M26 12 C31 16 33 22 31 28" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex select-none items-end gap-1 ${className}`}>
      <span className="text-cyan drop-shadow-[0_0_6px_#00f3ff]">
        <PalmIcon />
      </span>
      <span className="flex flex-col items-center leading-none">
        <span className="font-script text-4xl neon-pink -rotate-6">Santa</span>
        <span className="font-display text-xs tracking-[0.55em] text-cyan drop-shadow-[0_0_6px_#00f3ff]">RENTALS</span>
      </span>
      <span className="text-cyan drop-shadow-[0_0_6px_#00f3ff]">
        <PalmIcon flip />
      </span>
    </span>
  );
}
