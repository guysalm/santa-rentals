import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/dictionaries";
import { localePath } from "@/lib/i18n";
import { formatUSD } from "@/lib/money";
import type { Locale, VehicleModel } from "@/lib/types";
import { VehicleArt } from "./VehicleArt";

// Styled like a garage "vehicle select" screen.
export function VehicleCard({ lang, dict, model }: { lang: Locale; dict: Dictionary; model: VehicleModel }) {
  const c = model.content[lang];
  const title = `${model.brand} ${model.name}`;
  return (
    <article className="panel group relative flex flex-col overflow-hidden transition-transform hover:-translate-y-1">
      <div className="relative aspect-[16/10] bg-[radial-gradient(ellipse_at_bottom,_#ff2e8855,_transparent_70%)]">
        {model.images[0] ? (
          <Image src={model.images[0]} alt={title} fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover" />
        ) : (
          <VehicleArt type={model.type} title={title} className="absolute inset-0 m-auto h-full w-full p-6" />
        )}
        <span className="chip absolute left-3 top-3 bg-night/80 text-cyan">{dict.types[model.type]}</span>
        {model.engineCc && <span className="chip absolute right-3 top-3 bg-night/80 text-sun">{model.engineCc}cc</span>}
      </div>
      <div className="flex flex-1 flex-col gap-3 border-t-[3px] border-white p-5">
        <h3 className="text-4xl">
          <Link href={localePath(lang, `/fleet/${model.slug}`)} className="after:absolute after:inset-0">
            {title}
          </Link>
        </h3>
        <p className="text-sm text-muted">{c.tagline}</p>
        <dl className="mt-auto flex items-end justify-between gap-4 pt-2">
          <div>
            <dt className="text-xs uppercase tracking-widest text-muted">{dict.common.from}</dt>
            <dd className="hud-money text-4xl">
              {formatUSD(model.price8hCents)}
              <span className="ml-1 text-base text-muted [-webkit-text-stroke:0]">{dict.common.per8h}</span>
            </dd>
          </div>
          <div className="text-right">
            <dd className="hud-money text-2xl">
              {formatUSD(model.priceDayCents)}
              <span className="ml-1 text-sm text-muted [-webkit-text-stroke:0]">{dict.common.perDay}</span>
            </dd>
          </div>
        </dl>
      </div>
    </article>
  );
}
