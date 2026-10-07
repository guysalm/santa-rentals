import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, resolveLang } from "@/dictionaries";
import { getModel, getModels } from "@/lib/catalog";
import { LOCALES, localePath } from "@/lib/i18n";
import { formatUSD } from "@/lib/money";
import { weekPrice } from "@/lib/pricing";
import { pageMetadata, vehicleJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { isIllustration, vehicleImage } from "@/lib/images";
import { VehicleCard } from "@/components/VehicleCard";

export async function generateStaticParams() {
  const models = await getModels();
  return LOCALES.flatMap((lang) => models.map((m) => ({ lang, model: m.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/fleet/[model]">): Promise<Metadata> {
  const lang = await resolveLang(params);
  const model = await getModel((await params).model);
  if (!model) return {};
  const c = model.content[lang];
  return pageMetadata({ lang, path: `/fleet/${model.slug}`, title: `${c.seoTitle} | Santa Rentals`, description: c.seoDescription, image: model.images[0] });
}

export default async function ModelPage({ params }: PageProps<"/[lang]/fleet/[model]">) {
  const lang = await resolveLang(params);
  const dict = getDictionary(lang);
  const model = await getModel((await params).model);
  if (!model) notFound();
  const c = model.content[lang];
  const title = `${model.brand} ${model.name}`;
  const related = (await getModels(model.type)).filter((m) => m.id !== model.id).slice(0, 3);
  const landing = model.type === "dirtbike" ? "/dirt-bike-rental-santa-teresa" : "/atv-rental-santa-teresa";
  const specs: [string, string][] = [
    [dict.common.engine, model.engineCc ? `${model.engineCc}cc` : "—"],
    [dict.common.transmission, dict.common[model.transmission]],
    [dict.common.seats, String(model.seats)],
    [dict.common.minAge, `${model.minAge}+`],
    [dict.common.deposit, formatUSD(model.depositCents)],
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Breadcrumbs
        lang={lang}
        crumbs={[
          { name: dict.common.home, path: "/" },
          { name: model.type === "dirtbike" ? dict.rentalPage.dirtbike.h1 : dict.rentalPage.atv.h1, path: landing },
          { name: title, path: `/fleet/${model.slug}` },
        ]}
      />
      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div className="panel relative aspect-[4/3] overflow-hidden">
          <Image src={vehicleImage(model)} alt={title} fill priority unoptimized={isIllustration(vehicleImage(model))} sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
        </div>
        <div>
          <p className="chip text-cyan">{dict.types[model.type]}</p>
          <h1 className="mt-4 text-6xl md:text-7xl">
            <span className="chrome-text">{title}</span>
          </h1>
          <p className="mt-4 text-xl text-ink/90">{c.tagline}</p>

          <div className="panel panel-cyan mt-8 grid grid-cols-3 divide-x-2 divide-white/15 text-center">
            {[
              [formatUSD(model.price8hCents), "8h"],
              [formatUSD(model.priceDayCents), dict.common.perDay.replace("/ ", "")],
              [formatUSD(weekPrice(model)), dict.common.perWeek.replace("/ ", "")],
            ].map(([price, label]) => (
              <div key={label} className="p-4">
                <p className="hud-money text-3xl md:text-4xl">{price}</p>
                <p className="text-xs uppercase tracking-widest text-muted">{label}</p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">{dict.common.taxNote}</p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link href={localePath(lang, `/book?model=${model.slug}`)} className="btn btn-primary">
              {dict.common.bookThis} ▸
            </Link>
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
            {specs.map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs uppercase tracking-widest text-muted">{k}</dt>
                <dd className="font-display text-2xl tracking-wide">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <section className="prose-retro mt-16 grid gap-10 lg:grid-cols-2">
        <div>
          <h2>{dict.common.learnMore}</h2>
          <p>{c.description}</p>
        </div>
        <div>
          <h2>{dict.common.included}</h2>
          <ul>
            {c.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-4xl text-sun">{dict.home.fleetTitle}</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((m) => (
              <VehicleCard key={m.id} lang={lang} dict={dict} model={m} />
            ))}
          </div>
        </section>
      )}
      <JsonLd data={vehicleJsonLd(lang, model)} />
    </div>
  );
}
