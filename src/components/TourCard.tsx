import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/dictionaries";
import { localePath } from "@/lib/i18n";
import { formatUSD } from "@/lib/money";
import type { Locale, Tour } from "@/lib/types";
import { Stars } from "./Stars";
import { VehicleArt } from "./VehicleArt";

// Tours are presented as "missions" with a wanted-level difficulty.
export function TourCard({ lang, dict, tour }: { lang: Locale; dict: Dictionary; tour: Tour }) {
  const c = tour.content[lang];
  const duration = tour.overnight ? dict.common.overnight : `${tour.durationHours} ${dict.common.hours}`;
  return (
    <article className="panel panel-cyan group relative flex flex-col overflow-hidden transition-transform hover:-translate-y-1">
      <div className="relative aspect-[16/9] bg-gradient-to-b from-plum-2 via-pink/40 to-orange/40">
        {tour.images[0] ? (
          <Image src={tour.images[0]} alt={c.title} fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover" />
        ) : (
          <>
            <div className="sun absolute left-1/2 top-[18%] h-28 w-28 -translate-x-1/2" aria-hidden />
            <VehicleArt type={tour.category === "dirt-bike-tour" ? "dirtbike" : "atv"} title={c.title} className="absolute inset-x-0 bottom-0 mx-auto h-3/4 w-3/4" />
          </>
        )}
        <span className="chip absolute left-3 top-3 bg-night/80 text-sun">{dict.categories[tour.category].name}</span>
      </div>
      <div className="flex flex-1 flex-col gap-3 border-t-[3px] border-cyan p-5">
        <div className="flex items-center justify-between text-sm text-muted">
          <span>⏱ {duration}</span>
          <Stars level={tour.difficulty} label={dict.common.difficulty} />
        </div>
        <h3 className="text-3xl">
          <Link href={localePath(lang, `/tours/${tour.slug}`)} className="after:absolute after:inset-0">
            {c.title}
          </Link>
        </h3>
        <p className="text-sm text-muted">{c.summary}</p>
        <p className="mt-auto pt-2">
          <span className="text-xs uppercase tracking-widest text-muted">{dict.common.from} </span>
          <span className="hud-money text-3xl">{formatUSD(tour.priceCents)}</span>
          <span className="ml-1 text-sm text-muted">{dict.common.perPerson}</span>
        </p>
      </div>
    </article>
  );
}
