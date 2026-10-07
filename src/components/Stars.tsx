// "Wanted level" difficulty meter.
export function Stars({ level, label }: { level: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${label}: ${level}/5`} title={`${label}: ${level}/5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 24 24" className={`h-4 w-4 ${i <= level ? "fill-sun" : "fill-white/15"}`} aria-hidden>
          <path d="M12 2l2.9 6.9L22 9.6l-5.5 4.8L18.2 22 12 18.3 5.8 22l1.7-7.6L2 9.6l7.1-.7z" stroke="#000" strokeWidth="1.2" />
        </svg>
      ))}
    </span>
  );
}
