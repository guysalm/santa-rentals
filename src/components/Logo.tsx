export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex flex-col leading-none select-none ${className}`}>
      <span className="font-script text-4xl neon-pink -rotate-6 -mb-1">Santa</span>
      <span className="font-display text-sm tracking-[0.5em] text-cyan pl-6">RENTALS</span>
    </span>
  );
}
