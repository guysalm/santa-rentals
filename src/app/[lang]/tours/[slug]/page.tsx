import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, resolveLang, type Dictionary } from "@/dictionaries";
import { getTour, getTours } from "@/lib/catalog";
import { LOCALES, localePath } from "@/lib/i18n";
import { formatUSD } from "@/lib/money";
import { pageMetadata, tourJsonLd } from "@/lib/seo";
import type { Locale, Tour, TourCategory } from "@/lib/types";
import en from "@/dictionaries/en";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { SectionHeading } from "@/components/SectionHeading";
import { Stars } from "@/components/Stars";
import { TourCard } from "@/components/TourCard";
import { VehicleArt } from "@/components/VehicleArt";

// One dynamic segment serves both category pages (/tours/atv-tours) and tours.
const CATEGORY_BY_SLUG = Object.fromEntries(
  (Object.keys(en.categories) as TourCategory[]).map((c) => [en.categories[c].slug, c]),
) as Record<string, TourCategory>;

const CATEGORY_SEO: Record<TourCategory, Record<Locale, { title: string; description: string }>> = {
  "atv-tour": {
    en: { title: "ATV Tours Santa Teresa, Costa Rica — Waterfalls & Sunsets | Santa Rentals", description: "Guided ATV tours from Santa Teresa: Montezuma waterfall, Cabo Blanco sunset ride and full-day jungle-to-coast expeditions. Hotel pickup, book online." },
    es: { title: "Tours en Cuadraciclo Santa Teresa, Costa Rica | Santa Rentals", description: "Tours guiados en cuadraciclo desde Santa Teresa: catarata de Montezuma, atardecer en Cabo Blanco y expediciones de día completo." },
  },
  "dirt-bike-tour": {
    en: { title: "Dirt Bike & Enduro Tours Santa Teresa, Costa Rica | Santa Rentals", description: "Guided enduro dirt bike tours in the mountains above Santa Teresa. Half-day and full-day, bikes and gear included." },
    es: { title: "Tours en Moto y Enduro en Santa Teresa, Costa Rica | Santa Rentals", description: "Tours guiados de enduro en las montañas de Santa Teresa. Medio día y día completo, moto y equipo incluidos." },
  },
  camping: {
    en: { title: "Beach Camping Tours Santa Teresa, Costa Rica | Santa Rentals", description: "Overnight ATV beach camping from Santa Teresa — tents, bonfire dinner and breakfast on the sand. Book online." },
    es: { title: "Camping en la Playa desde Santa Teresa, Costa Rica | Santa Rentals", description: "Camping nocturno en la playa en cuadraciclo desde Santa Teresa — tiendas, cena en fogata y desayuno en la arena." },
  },
  "day-tour": {
    en: { title: "Day Tours Santa Teresa, Costa Rica — Beaches & Wildlife | Santa Rentals", description: "Laid-back day tours from Santa Teresa: hidden beaches, tide pools, Bongo River wildlife and Manzanillo. Book online." },
    es: { title: "Tours de Día en Santa Teresa, Costa Rica — Playas y Fauna | Santa Rentals", description: "Tours de un día desde Santa Teresa: playas escondidas, pozas, fauna del Río Bongo y Manzanillo." },
  },
};

export async function generateStaticParams() {
  const tours = await getTours();
  const slugs = [...Object.keys(CATEGORY_BY_SLUG), ...tours.map((t) => t.slug)];
  return LOCALES.flatMap((lang) => slugs.map((slug) => ({ lang, slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/tours/[slug]">): Promise<Metadata> {
  const lang = await resolveLang(params);
  const { slug } = await params;
  const category = CATEGORY_BY_SLUG[slug];
  if (category) {
    const s = CATEGORY_SEO[category][lang];
    return pageMetadata({ lang, path: `/tours/${slug}`, title: s.title, description: s.description });
  }
  const tour = await getTour(slug);
  if (!tour) return {};
  const c = tour.content[lang];
  return pageMetadata({ lang, path: `/tours/${slug}`, title: `${c.seoTitle} | Santa Rentals`, description: c.seoDescription, image: tour.images[0] });
}

export default async function TourOrCategoryPage({ params }: PageProps<"/[lang]/tours/[slug]">) {
  const lang = await resolveLang(params);
  const { slug } = await params;
  const dict = getDictionary(lang);
  const category = CATEGORY_BY_SLUG[slug];
  if (category) return <CategoryView lang={lang} dict={dict} category={category} />;
  const tour = await getTour(slug);
  if (!tour) notFound();
  return <TourView lang={lang} dict={dict} tour={tour} />;
}

async function CategoryView({ lang, dict, category }: { lang: Locale; dict: Dictionary; category: TourCategory }) {
  const cat = dict.categories[category];
  const tours = await getTours(category);
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Breadcrumbs
        lang={lang}
        crumbs={[
          { name: dict.common.home, path: "/" },
          { name: dict.nav.tours, path: "/tours" },
          { name: cat.name, path: `/tours/${cat.slug}` },
        ]}
      />
      <div className="mt-8">
        <SectionHeading as="h1" kicker="Santa Teresa" title={cat.name} lead={cat.blurb} />
      </div>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {tours.map((t) => (
          <TourCard key={t.id} lang={lang} dict={dict} tour={t} />
        ))}
      </div>
    </div>
  );
}

const DAY_NAMES: Record<Locale, string[]> = {
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  es: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
};

async function TourView({ lang, dict, tour }: { lang: Locale; dict: Dictionary; tour: Tour }) {
  const c = tour.content[lang];
  const cat = dict.categories[tour.category];
  const related = (await getTours()).filter((t) => t.id !== tour.id && t.category === tour.category).slice(0, 3);
  const days = tour.daysOfWeek.length === 7 ? (lang === "es" ? "Todos los días" : "Daily") : tour.daysOfWeek.map((d) => DAY_NAMES[lang][d]).join(" · ");
  const facts: [string, React.ReactNode][] = [
    [dict.tours.duration, tour.overnight ? dict.common.overnight : `${tour.durationHours} ${dict.common.hours}`],
    [dict.tours.departs, `${tour.startTime} · ${days}`],
    [dict.tours.group, `${tour.minPax}–${tour.maxPax} ${dict.tours.people}`],
    [dict.common.difficulty, <Stars key="s" level={tour.difficulty} label={dict.common.difficulty} />],
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Breadcrumbs
        lang={lang}
        crumbs={[
          { name: dict.common.home, path: "/" },
          { name: dict.nav.tours, path: "/tours" },
          { name: cat.name, path: `/tours/${cat.slug}` },
          { name: c.title, path: `/tours/${tour.slug}` },
        ]}
      />
      <div className="mt-8 grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="panel panel-cyan relative aspect-[16/9] overflow-hidden bg-gradient-to-b from-plum-2 via-pink/40 to-orange/50">
            {tour.images[0] ? (
              <Image src={tour.images[0]} alt={c.title} fill priority sizes="(min-width:1024px) 60vw, 100vw" className="object-cover" />
            ) : (
              <>
                <div className="sun absolute left-1/2 top-[12%] h-40 w-40 -translate-x-1/2" aria-hidden />
                <VehicleArt type={tour.category === "dirt-bike-tour" ? "dirtbike" : "atv"} title={c.title} className="absolute inset-x-0 bottom-0 mx-auto h-3/4 w-3/4" />
              </>
            )}
          </div>
          <p className="chip mt-8 text-sun">{cat.name}</p>
          <h1 className="mt-3 text-6xl md:text-7xl">
            <span className="sunset-text">{c.title}</span>
          </h1>
          <p className="mt-4 text-xl text-ink/90">{c.summary}</p>
          <div className="prose-vice mt-8">
            <p>{c.description}</p>
            <h2>{dict.common.itinerary}</h2>
            <ul>
              {c.itinerary.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <div className="grid gap-8 sm:grid-cols-2">
              <div>
                <h3>{dict.common.included}</h3>
                <ul>
                  {c.includes.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>{dict.common.bring}</h3>
                <ul>
                  {c.bring.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-2">
          <div className="panel sticky top-24 p-6">
            <p className="text-xs uppercase tracking-widest text-muted">{dict.common.from}</p>
            <p>
              <span className="hud-money text-6xl">{formatUSD(tour.priceCents)}</span>
              <span className="ml-2 text-muted">{dict.common.perPerson}</span>
            </p>
            <dl className="mt-6 space-y-3">
              {facts.map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-4 border-b border-white/10 pb-2">
                  <dt className="text-sm uppercase tracking-widest text-muted">{k}</dt>
                  <dd className="text-right font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
            <Link href={localePath(lang, `/book?tour=${tour.slug}`)} className="btn btn-primary mt-8 w-full">
              {dict.common.bookTour} ▸
            </Link>
            <p className="mt-3 text-center text-xs text-muted">{dict.common.taxNote}</p>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 text-4xl text-sun">{dict.home.toursTitle}</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((t) => (
              <TourCard key={t.id} lang={lang} dict={dict} tour={t} />
            ))}
          </div>
        </section>
      )}
      <JsonLd data={tourJsonLd(lang, tour)} />
    </div>
  );
}
