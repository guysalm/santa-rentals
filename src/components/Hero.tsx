import Link from "next/link";
import type { Dictionary } from "@/dictionaries";
import { localePath } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { VehicleArt } from "./VehicleArt";
import { QuickBook } from "./QuickBook";

function Palm({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 120 220" className={className} aria-hidden>
      <path
        fill="#05010a"
        d="M58 220c2-50 4-95 1-140l6 1c3 45 1 90-1 139zM62 82C40 60 14 58 0 66c18-16 44-18 64 6zM62 80C70 52 92 38 118 42 94 46 76 58 66 84zM60 84C48 54 26 34 4 34c26-4 48 14 60 46zM64 80c18-20 40-24 56-14-20-4-38 2-52 18zM60 86C42 92 30 110 28 130c-4-24 10-44 30-50z"
      />
    </svg>
  );
}

export function Hero({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const h = dict.home;
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-b from-night via-plum to-[#5a1a5e]">
      {/* sky glow */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_75%,_#ff8a3d55,_transparent_60%)]" aria-hidden />
      {/* sun */}
      <div className="sun absolute left-1/2 top-[38%] -z-10 h-[300px] w-[300px] -translate-x-1/2 md:h-[440px] md:w-[440px]" aria-hidden />
      {/* grid floor */}
      <div className="absolute inset-x-[-50%] bottom-[-10%] -z-10 h-[45%]" aria-hidden>
        <div className="grid-floor h-full w-full" />
      </div>
      <Palm className="absolute bottom-0 left-[-30px] -z-10 h-72 md:h-[420px]" />
      <Palm className="absolute bottom-0 right-[-20px] -z-10 h-64 -scale-x-100 md:h-[380px]" />

      <div className="mx-auto flex min-h-[86vh] max-w-7xl flex-col items-center justify-center px-4 pb-40 pt-16 text-center">
        <p className="mb-5 font-display text-lg tracking-[0.35em] text-cyan md:text-xl">{h.kicker}</p>
        <h1 className="flex flex-col items-center">
          <span className="font-script text-6xl normal-case tracking-normal neon-pink -rotate-3 md:text-8xl">{h.title1}</span>
          <span className="chrome-text mt-2 text-7xl md:text-[9rem]">{h.title2}</span>
        </h1>
        <p className="mt-6 max-w-2xl rounded bg-night/55 px-4 py-2 text-lg text-ink backdrop-blur-sm [text-shadow:0_2px_6px_#000] md:text-xl">{h.lead}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href={localePath(lang, "/book")} className="btn btn-primary">
            {h.ctaRent} ▸
          </Link>
          <Link href={localePath(lang, "/tours")} className="btn btn-ghost">
            {h.ctaTours}
          </Link>
        </div>
        <QuickBook lang={lang} />
      </div>
      <VehicleArt type="atv" className="pointer-events-none absolute bottom-6 left-1/2 hidden h-40 -translate-x-1/2 md:block" />
    </section>
  );
}
