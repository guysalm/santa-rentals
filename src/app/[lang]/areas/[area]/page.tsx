import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, resolveLang } from "@/dictionaries";
import { getModels, getTours } from "@/lib/catalog";
import { LOCALES, localePath } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { AREAS } from "@/content/areas";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SectionHeading } from "@/components/SectionHeading";
import { TourCard } from "@/components/TourCard";
import { VehicleCard } from "@/components/VehicleCard";

export function generateStaticParams() {
  return LOCALES.flatMap((lang) => AREAS.map((a) => ({ lang, area: a.slug })));
}

const findArea = (slug: string) => AREAS.find((a) => a.slug === slug);

export async function generateMetadata({ params }: PageProps<"/[lang]/areas/[area]">): Promise<Metadata> {
  const lang = await resolveLang(params);
  const area = findArea((await params).area);
  if (!area) return {};
  const c = area.content[lang];
  return pageMetadata({ lang, path: `/areas/${area.slug}`, title: c.seoTitle, description: c.seoDescription });
}

export default async function AreaPage({ params }: PageProps<"/[lang]/areas/[area]">) {
  const lang = await resolveLang(params);
  const area = findArea((await params).area);
  if (!area) notFound();
  const dict = getDictionary(lang);
  const c = area.content[lang];
  const [models, tours] = await Promise.all([getModels("atv"), getTours()]);
  const nearbyTours = tours.filter((t) => t.content.en.description.includes(area.name) || t.content.en.summary.includes(area.name)).slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Breadcrumbs
        lang={lang}
        crumbs={[
          { name: dict.common.home, path: "/" },
          { name: area.name, path: `/areas/${area.slug}` },
        ]}
      />
      <div className="mt-8">
        <SectionHeading as="h1" kicker={`${area.name} · Costa Rica`} title={c.h1} lead={c.intro} />
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="prose-retro lg:col-span-2">
          {c.body.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
        <ul className="panel space-y-3 p-6">
          {c.highlights.map((h) => (
            <li key={h} className="flex gap-2">
              <span className="text-pink">★</span>
              <span>{h}</span>
            </li>
          ))}
        </ul>
      </div>

      <section className="mt-16">
        <h2 className="mb-6 text-4xl text-sun">{dict.home.fleetTitle}</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {models.map((m) => (
            <VehicleCard key={m.id} lang={lang} dict={dict} model={m} />
          ))}
        </div>
      </section>

      {nearbyTours.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-4xl text-sun">{dict.home.toursTitle}</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {nearbyTours.map((t) => (
              <TourCard key={t.id} lang={lang} dict={dict} tour={t} />
            ))}
          </div>
        </section>
      )}

      <nav aria-label={dict.home.areasTitle} className="mt-16 flex flex-wrap gap-3">
        {AREAS.filter((a) => a.slug !== area.slug).map((a) => (
          <Link key={a.slug} href={localePath(lang, `/areas/${a.slug}`)} className="chip text-lg text-cyan hover:bg-cyan hover:text-night">
            {a.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
