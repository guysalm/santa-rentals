import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/dictionaries";
import { localePath } from "@/lib/i18n";
import { isIllustration, vehicleThumb } from "@/lib/images";
import { formatUSD } from "@/lib/money";
import type { Locale, VehicleModel } from "@/lib/types";

// Horizontal fleet card: photo left, specs + price + "Book now" right.
export function VehicleCard({ lang, dict, model }: { lang: Locale; dict: Dictionary; model: VehicleModel }) {
  const title = `${model.brand} ${model.name}`;
  const img = vehicleThumb(model);
  const specs = [model.engineCc ? `${model.engineCc}cc` : null, dict.common[model.transmission], `${model.seats} ${dict.common.seats.toLowerCase()}`].filter(Boolean).join(" · ");
  return (
    <article className="panel card-hover flex min-h-44 overflow-hidden">
      <Link href={localePath(lang, `/fleet/${model.slug}`)} className="relative w-[44%] shrink-0 overflow-hidden" tabIndex={-1} aria-hidden>
        <Image src={img} alt="" fill unoptimized={isIllustration(img)} sizes="(min-width:1024px) 15vw, 45vw" className="object-cover transition-transform duration-300 hover:scale-105" />
        <span className="chip absolute left-2 top-2 bg-night/80 !text-xs text-cyan">{dict.types[model.type]}</span>
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1 border-l-2 border-cyan/50 p-4">
        <h3 className="text-2xl leading-none tracking-wide">
          <Link href={localePath(lang, `/fleet/${model.slug}`)} className="hover:text-cyan">
            {title}
          </Link>
        </h3>
        <p className="text-xs text-muted">{specs}</p>
        <p className="line-clamp-2 text-xs text-muted/80">{model.content[lang].tagline}</p>
        <p className="price-cyan mt-auto text-2xl">
          {lang === "es" ? "Alquiler" : "Rent"} {formatUSD(model.priceDayCents)}
          <span className="text-base">{dict.common.perDay.replace(" ", "")}</span>
        </p>
        <p className="text-[11px] text-muted">
          {dict.common.from} {formatUSD(model.price8hCents)} {dict.common.per8h}
        </p>
        <Link href={localePath(lang, `/book?model=${model.slug}`)} className="btn btn-pill mt-2 self-start" aria-label={`${dict.nav.book}: ${title}`}>
          {dict.nav.book}
        </Link>
      </div>
    </article>
  );
}
