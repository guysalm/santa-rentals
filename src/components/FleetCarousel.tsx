"use client";
import { useCallback, useEffect, useRef } from "react";

const AUTOPLAY_MS = 3500;
const TOUCH_PAUSE_MS = 6000;

/**
 * Endless auto-rotating carousel: 3 cards per view on desktop, 2 on tablets, 1 on
 * phones. Items are rendered twice; when the scroll passes into the copy it jumps
 * back by exactly one set, so the loop is seamless. Pauses while hovered, focused
 * or touched (and never autoplays with prefers-reduced-motion). Hovered cards grow 30% on wide screens (8% on tablets, where two wide cards fill the screen) (track has room so they are not clipped).
 */
export function FleetCarousel({ children, label, prev, next }: { children: React.ReactNode[]; label: string; prev: string; next: string }) {
  const track = useRef<HTMLUListElement>(null);
  const paused = useRef(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const n = children.length;

  /** Distance from the first item to the first copy = width of one full set. */
  const setWidth = useCallback(() => {
    const el = track.current;
    if (!el || el.children.length < 2 * n) return 0;
    return (el.children[n] as HTMLElement).offsetLeft - (el.children[0] as HTMLElement).offsetLeft;
  }, [n]);

  const jump = useCallback((el: HTMLUListElement, left: number) => {
    el.style.scrollSnapType = "none"; // avoid re-snapping during the silent jump
    el.scrollLeft = left;
    requestAnimationFrame(() => (el.style.scrollSnapType = ""));
  }, []);

  const step = useCallback(
    (dir: 1 | -1) => {
      const el = track.current;
      const card = el?.firstElementChild as HTMLElement | null;
      if (!el || !card) return;
      const w = setWidth();
      // Going back from the very start: hop into the copy first so there's room.
      if (dir === -1 && w && el.scrollLeft < card.offsetWidth / 2) jump(el, el.scrollLeft + w);
      el.scrollBy({ left: dir * (card.offsetWidth + 24), behavior: "smooth" });
    },
    [jump, setWidth],
  );

  // Seamless wrap: once scrolling settles inside the copy, jump back one set.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => {
      if (settleTimer.current) clearTimeout(settleTimer.current);
      settleTimer.current = setTimeout(() => {
        const w = setWidth();
        if (w && el.scrollLeft >= w - 2) jump(el, el.scrollLeft - w);
      }, 140);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [jump, setWidth]);

  // Autoplay.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      if (!paused.current && !document.hidden) step(1);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [step]);

  const pause = () => {
    paused.current = true;
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
  };
  const resume = (delay = 0) => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => (paused.current = false), delay);
  };

  const arrow =
    "absolute top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border-2 border-cyan bg-night/90 text-xl text-cyan shadow-[0_0_14px_rgb(0_243_255/0.6)] transition hover:bg-cyan hover:text-night md:grid";
  const item = "w-[88%] shrink-0 snap-start transition-transform duration-300 ease-out hover:z-10 md:hover:scale-[1.08] xl:hover:scale-[1.3] sm:w-[calc((100%-1.5rem)/2)] xl:w-[calc((100%-3rem)/3)]";

  return (
    <div
      className="relative"
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={pause}
      onMouseLeave={() => resume()}
      onFocus={pause}
      onBlur={() => resume()}
      onTouchStart={pause}
      onTouchEnd={() => resume(TOUCH_PAUSE_MS)}
    >
      <button type="button" onClick={() => step(-1)} aria-label={prev} className={`${arrow} -left-4 xl:-left-6`}>
        ‹
      </button>
      <ul
        ref={track}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-3 py-5 [scrollbar-width:none] md:-mx-16 md:-my-6 md:scroll-px-16 md:px-16 md:py-11 [&::-webkit-scrollbar]:hidden"
      >
        {children.map((child, i) => (
          <li key={i} className={item}>
            {child}
          </li>
        ))}
        {/* Copy for the endless loop — hidden from screen readers and keyboard */}
        {children.map((child, i) => (
          <li key={`copy-${i}`} className={item} aria-hidden inert>
            {child}
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => step(1)} aria-label={next} className={`${arrow} -right-4 xl:-right-6`}>
        ›
      </button>
    </div>
  );
}
