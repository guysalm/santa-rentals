import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/dictionaries";
import { localePath } from "@/lib/i18n";
import { isIllustration, tourImage } from "@/lib/images";
import { formatUSD } from "@/lib/money";
import type { Locale, Tour } from "@/lib/types";
import { Stars } from "./Stars";

// Tours are "missions": scene image, wanted-level difficulty, price.
export function TourCard({ lang, dict, tour, accent }: { lang: Locale; dict: Dictionary; tour: Tour; accent?: string }) {
  const c = tour.content[lang];
  const img = tourImage(tour);
  const duration = tour.overnight ? dict.common.overnight : `${tour.durationHours} ${dict.common.hours}`;
  return (
    <article className="panel panel-pink card-hover group relative flex flex-col overflow-hidden">
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image src={img} alt="" fill unoptimized={isIllustration(img)} sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover transition-transform duration-300 group-hover:scale-105" />
        <span className="chip absolute left-3 top-3 bg-night/80 text-sun">{dict.categories[tour.category].name}</span>
        {accent && <span className="absolute right-3 top-3 h-3 w-3 rounded-full" style={{ background: accent, boxShadow: `0 0 10px ${accent}` }} aria-hidden />}
      </div>
      <div className="flex flex-1 flex-col gap-2 border-t-2 border-pink/60 p-5">
        <div className="flex items-center justify-between text-sm text-muted">
          <span>⏱ {duration}</span>
          <Stars level={tour.difficulty} label={dict.common.difficulty} />
        </div>
        <h3 className="text-3xl">
          <Link href={localePath(lang, `/tours/${tour.slug}`)} className="after:absolute after:inset-0 hover:text-cyan">
            {c.title}
          </Link>
        </h3>
        <p className="text-sm text-muted">{c.summary}</p>
        <p className="mt-auto pt-2">
          <span className="text-xs uppercase tracking-widest text-muted">{dict.common.from} </span>
          <span className="price-pink text-3xl">{formatUSD(tour.priceCents)}</span>
          <span className="ml-1 text-sm text-muted">{dict.common.perPerson}</span>
        </p>
      </div>
    </article>
  );
}
