// Original wordmark: generic coconut-palm icon + "SANTA.RENTALS".
function PalmIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-8 w-8 shrink-0 sm:h-10 sm:w-10 drop-shadow-[0_0_6px_#00f3ff]" aria-hidden fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* trunk */}
      <path d="M22 46 C21 36 22 26 26 17" stroke="#00F3FF" strokeWidth="2.6" />
      <path d="M21.6 40h2.4 M21.4 34h2.6 M22 28h2.6 M23.4 22h2.4" stroke="#00F3FF" strokeWidth="1.2" />
      {/* fronds */}
      <path d="M26 17 C20 10 10 10 4 16 C11 14 18 15 26 17Z" fill="#00F3FF" fillOpacity=".25" stroke="#00F3FF" strokeWidth="1.8" />
      <path d="M26 17 C25 9 30 3 38 3 C32 7 28 11 26 17Z" fill="#00F3FF" fillOpacity=".25" stroke="#00F3FF" strokeWidth="1.8" />
      <path d="M26 17 C33 11 42 12 46 19 C39 17 32 16 26 17Z" fill="#00F3FF" fillOpacity=".25" stroke="#00F3FF" strokeWidth="1.8" />
      <path d="M26 17 C20 19 14 25 13 32 C17 26 21 21 26 17Z" fill="#00F3FF" fillOpacity=".25" stroke="#00F3FF" strokeWidth="1.8" />
      <path d="M26 17 C32 20 35 26 34 33 C31 27 29 22 26 17Z" fill="#00F3FF" fillOpacity=".25" stroke="#00F3FF" strokeWidth="1.8" />
      {/* coconuts */}
      <circle cx="24.5" cy="19.5" r="2.2" fill="#FF007F" />
      <circle cx="28.5" cy="19.8" r="2.2" fill="#FF007F" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex select-none items-center gap-1.5 sm:gap-2 ${className}`}>
      <PalmIcon />
      <span className="font-anton text-xl leading-none tracking-wide sm:text-[1.7rem]">
        <span className="text-white [text-shadow:0_0_2px_#fff,0_0_10px_#ff007f,0_0_22px_#ff007f]">SANTA</span>
        <span className="text-pink">.</span>
        <span className="text-cyan [text-shadow:0_0_10px_#00f3ff]">RENTALS</span>
      </span>
    </span>
  );
}
