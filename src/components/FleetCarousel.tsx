"use client";
import { useRef } from "react";

/**
 * Horizontal carousel showing 3 cards at a time on desktop (1 on phones, 2 on
 * tablets). Cards are server-rendered children; scroll-snap does the layout and
 * the neon arrows scroll one card at a time. Swipe works natively on touch.
 */
export function FleetCarousel({ children, label, prev, next }: { children: React.ReactNode[]; label: string; prev: string; next: string }) {
  const track = useRef<HTMLUListElement>(null);
  const scroll = (dir: 1 | -1) => {
    const el = track.current;
    const card = el?.firstElementChild as HTMLElement | null;
    if (!el || !card) return;
    el.scrollBy({ left: dir * (card.offsetWidth + 24), behavior: "smooth" });
  };
  const arrow = "absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border-2 border-cyan bg-night/90 text-xl text-cyan shadow-[0_0_14px_rgb(0_243_255/0.6)] transition hover:bg-cyan hover:text-night md:grid";
  return (
    <div className="relative" role="region" aria-roledescription="carousel" aria-label={label}>
      <button type="button" onClick={() => scroll(-1)} aria-label={prev} className={`${arrow} -left-4 xl:-left-6`}>
        ‹
      </button>
      <ul
        ref={track}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-1 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children.map((child, i) => (
          <li key={i} className="w-[88%] shrink-0 snap-start sm:w-[calc((100%-1.5rem)/2)] xl:w-[calc((100%-3rem)/3)]">
            {child}
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => scroll(1)} aria-label={next} className={`${arrow} -right-4 xl:-right-6`}>
        ›
      </button>
    </div>
  );
}
