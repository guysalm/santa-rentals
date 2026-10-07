import Image from "next/image";
import type { Dictionary } from "@/dictionaries";
import { HERO_IMAGE, HERO_VEHICLES } from "@/lib/images";
import type { Locale } from "@/lib/types";
import { QuickBook } from "./QuickBook";

// Centered hero: headline → vehicle silhouette slot → quick booking widget.
export function Hero({ lang, dict, overlap = false }: { lang: Locale; dict: Dictionary; overlap?: boolean }) {
  const h = dict.home;
  return (
    <section className="relative isolate overflow-hidden">
      <Image src={HERO_IMAGE} alt="" fill priority quality={85} sizes="100vw" className="-z-20 object-cover object-[50%_60%]" />
      {/* Keep the headline and widget readable over the photo */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-night/55 via-night/10 to-night/75" aria-hidden />

      <div className={`mx-auto flex max-w-5xl flex-col items-center px-4 ${overlap ? "pb-56" : "pb-14"} pt-10 text-center`}>
        <p className="mb-4 font-display text-lg tracking-[0.35em] text-cyan drop-shadow-[0_0_8px_#00f3ff]">{h.kicker}</p>
        <h1 className="headline text-5xl leading-[0.95] sm:text-6xl xl:text-7xl">
          <span className="block">{h.title1}</span>
          <span className="block">{h.title2}</span>
        </h1>
        <p className="mt-4 text-base text-ink/90 [text-shadow:0_2px_6px_#000] sm:text-lg">{h.tagline}</p>

        {/* Center vehicle silhouette (image supplied separately). Space is reserved so
            adding it later doesn't shift the layout. */}
        <div className="relative mt-2 aspect-[16/5] w-full max-w-2xl" aria-hidden={!HERO_VEHICLES}>
          {HERO_VEHICLES && (
            <Image
              src={HERO_VEHICLES}
              alt={lang === "es" ? "Cuadraciclo y moto al atardecer" : "ATV and dirt bike at sunset"}
              fill
              priority
              sizes="(min-width:672px) 672px, 100vw"
              className="object-contain drop-shadow-[0_0_24px_rgb(255_0_127/0.55)]"
            />
          )}
        </div>

        <div className="w-full max-w-2xl">
          <QuickBook lang={lang} />
        </div>
      </div>
      {!overlap && <div className="gradient-bar" />}
    </section>
  );
}
