import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/dictionaries";
import { localePath } from "@/lib/i18n";
import { isIllustration, vehicleThumb } from "@/lib/images";
import { formatUSD } from "@/lib/money";
import type { Locale, VehicleModel } from "@/lib/types";

// Mockup fleet card: photo fills the left half, name/specs/price/"Book now" on the right.
export function VehicleCard({ lang, dict, model }: { lang: Locale; dict: Dictionary; model: VehicleModel }) {
  const title = `${model.brand} ${model.name}`;
  const img = vehicleThumb(model);
  const specs = [model.engineCc ? `${model.engineCc}cc` : null, dict.common[model.transmission]].filter(Boolean).join(" · ");
  return (
    <article className="panel card-hover flex h-56 overflow-hidden">
      <Link href={localePath(lang, `/fleet/${model.slug}`)} className="group relative w-1/2 shrink-0 overflow-hidden" tabIndex={-1} aria-hidden>
        <Image
          src={img}
          alt=""
          fill
          unoptimized={isIllustration(img)}
          sizes="(min-width:1280px) 210px, (min-width:768px) 25vw, 50vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="chip absolute left-2 top-2 bg-night/80 !text-xs text-cyan">{dict.types[model.type]}</span>
      </Link>
      <div className="flex min-w-0 flex-1 flex-col border-l-2 border-cyan/50 p-4">
        <h3 className="text-xl leading-none tracking-wide sm:text-[1.6rem]">
          <Link href={localePath(lang, `/fleet/${model.slug}`)} className="hover:text-cyan">
            {title}
          </Link>
        </h3>
        <p className="mt-1.5 text-xs text-muted">{specs}</p>
        <p className="text-xs text-muted">
          {model.seats} {dict.common.seats.toLowerCase()} · {dict.common.from} {formatUSD(model.price8hCents)} {dict.common.per8h}
        </p>
        <p className="price-cyan mt-auto text-[1.7rem] leading-none">
          {lang === "es" ? "Alquiler" : "Rent"} {formatUSD(model.priceDayCents)}
          <span className="text-base">{dict.common.perDay.replace(" ", "")}</span>
        </p>
        <Link href={localePath(lang, `/book?model=${model.slug}`)} className="btn btn-pill mt-3 self-start" aria-label={`${dict.nav.book}: ${title}`}>
          {dict.nav.book}
        </Link>
      </div>
    </article>
  );
}
