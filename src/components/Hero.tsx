import Image from "next/image";
import type { Dictionary } from "@/dictionaries";
import { HERO_IMAGE } from "@/lib/images";
import type { Locale } from "@/lib/types";
import { QuickBook } from "./QuickBook";

// Desktop (lg+): mockup layout — vehicles visible on the left, headline + Quick
// Booking on the right over the full-bleed image.
// Phones: the image gets its own band (headline over the sky, vehicles visible
// below it) and Quick Booking sits under the image instead of covering it.
export function Hero({ lang, dict, overlap = false }: { lang: Locale; dict: Dictionary; overlap?: boolean }) {
  const h = dict.home;
  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-20 h-[118vw] max-h-[620px] sm:h-[90vw] lg:inset-0 lg:h-auto lg:max-h-none">
        <Image
          src={HERO_IMAGE}
          alt={lang === "es" ? "Cuadraciclo y moto en la playa al atardecer, Santa Teresa" : "ATV and dirt bike on the beach at sunset, Santa Teresa"}
          fill
          priority
          quality={85}
          sizes="100vw"
          className="object-cover object-[28%_50%] lg:object-[30%_45%]"
        />
        {/* Phones: darken the sky under the headline and fade the bottom into the page.
            Desktop: darken behind the right-hand text column only. */}
        <div
          className="absolute inset-0 bg-[linear-gradient(to_bottom,rgb(5_5_5/0.7)_0%,rgb(5_5_5/0.15)_38%,transparent_60%,rgb(5_5_5/0.9)_92%,#050505_100%)] lg:bg-none lg:bg-gradient-to-l lg:from-night/70 lg:via-night/20 lg:to-transparent"
          aria-hidden
        />
      </div>

      <div className={`mx-auto grid max-w-7xl items-start px-4 lg:grid-cols-[1fr_minmax(0,36rem)] ${overlap ? "pb-8 lg:pb-56" : "pb-12 lg:pb-16"} pt-6 lg:pt-14`}>
        <div className="hidden lg:block" aria-hidden />
        <div className="min-w-0 text-center lg:text-right">
          <p className="mb-4 hidden font-display text-lg tracking-[0.35em] text-cyan drop-shadow-[0_0_8px_#00f3ff] lg:block">{h.kicker}</p>
          <h1 className="headline text-[2.6rem] leading-[0.95] sm:text-6xl xl:text-7xl">
            <span className="block">{h.title1}</span>
            <span className="block">{h.title2}</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xs text-xs leading-relaxed text-ink/90 [text-shadow:0_2px_6px_#000] sm:max-w-none sm:text-base lg:mt-4">{h.tagline}</p>
          {/* Phones: leave the vehicles in the photo visible */}
          <div className="h-[62vw] max-h-[340px] sm:h-[48vw] lg:hidden" aria-hidden />
          <div className="mt-2 lg:mt-8">
            <QuickBook lang={lang} />
          </div>
        </div>
      </div>
      {!overlap && <div className="gradient-bar" />}
    </section>
  );
}
