import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/dictionaries";
import { localePath } from "@/lib/i18n";
import { HERO_IMAGE } from "@/lib/images";
import type { Locale } from "@/lib/types";
import { QuickBook } from "./QuickBook";

export function Hero({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const h = dict.home;
  return (
    <section className="relative isolate overflow-hidden">
      <Image src={HERO_IMAGE} alt="" fill priority unoptimized sizes="100vw" className="-z-20 object-cover object-[30%_85%]" />
      {/* Darken the right side so the headline stays readable */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-night/40 via-transparent to-night/70 lg:bg-gradient-to-l lg:from-night/75 lg:via-night/25 lg:to-transparent" aria-hidden />

      <div className="mx-auto grid min-h-[78vh] max-w-7xl items-center px-4 pb-16 pt-12 lg:grid-cols-2">
        <div className="hidden lg:block" aria-hidden />
        <div className="text-center lg:text-right">
          <p className="mb-4 font-display text-lg tracking-[0.35em] text-cyan drop-shadow-[0_0_8px_#00f3ff]">{h.kicker}</p>
          <h1 className="headline text-6xl leading-[0.9] sm:text-7xl xl:text-8xl">
            <span className="block">{h.title1}</span>
            <span className="block">{h.title2}</span>
          </h1>
          <p className="mt-4 text-base text-ink/90 [text-shadow:0_2px_6px_#000] sm:text-lg">{h.tagline}</p>
          <div className="mt-6 lg:ml-auto lg:max-w-xl">
            <QuickBook lang={lang} />
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3 lg:justify-end">
            <Link href={localePath(lang, "/fleet")} className="btn btn-ghost">
              {h.ctaRent}
            </Link>
            <Link href={localePath(lang, "/tours")} className="btn btn-ghost">
              {h.ctaTours}
            </Link>
          </div>
        </div>
      </div>
      <div className="gradient-bar" />
    </section>
  );
}
