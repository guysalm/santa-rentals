import Image from "next/image";
import type { Dictionary } from "@/dictionaries";
import { HERO_IMAGE } from "@/lib/images";
import type { Locale } from "@/lib/types";
import { QuickBook } from "./QuickBook";

// Mockup layout: the ATV + dirt bike in the background stay visible on the left;
// headline and Quick Booking sit on the right (stacked and centered on phones).
export function Hero({ lang, dict, overlap = false }: { lang: Locale; dict: Dictionary; overlap?: boolean }) {
  const h = dict.home;
  return (
    <section className="relative isolate overflow-hidden">
      <Image
        src={HERO_IMAGE}
        alt={lang === "es" ? "Cuadraciclo y moto en la playa al atardecer, Santa Teresa" : "ATV and dirt bike on the beach at sunset, Santa Teresa"}
        fill
        priority
        quality={85}
        sizes="100vw"
        className="-z-20 object-cover object-[30%_45%]"
      />
      {/* Darken behind the text column only, so the vehicles stay bright */}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-b from-night/60 via-night/20 to-night/80 lg:bg-gradient-to-l lg:from-night/70 lg:via-night/20 lg:to-transparent"
        aria-hidden
      />

      <div className={`mx-auto grid max-w-7xl items-start px-4 lg:grid-cols-[1fr_minmax(0,36rem)] ${overlap ? "pb-56" : "pb-16"} pt-10 lg:pt-14`}>
        <div className="hidden lg:block" aria-hidden />
        <div className="text-center lg:text-right">
          <p className="mb-4 font-display text-lg tracking-[0.35em] text-cyan drop-shadow-[0_0_8px_#00f3ff]">{h.kicker}</p>
          <h1 className="headline text-5xl leading-[0.95] sm:text-6xl xl:text-7xl">
            <span className="block">{h.title1}</span>
            <span className="block">{h.title2}</span>
          </h1>
          <p className="mt-4 text-sm text-ink/90 [text-shadow:0_2px_6px_#000] sm:text-base">{h.tagline}</p>
          <div className="mt-8">
            <QuickBook lang={lang} />
          </div>
        </div>
      </div>
      {!overlap && <div className="gradient-bar" />}
    </section>
  );
}
