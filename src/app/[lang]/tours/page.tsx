import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary, resolveLang } from "@/dictionaries";
import { getTours } from "@/lib/catalog";
import { localePath } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import type { TourCategory } from "@/lib/types";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SectionHeading } from "@/components/SectionHeading";
import { TourCard } from "@/components/TourCard";

const CATEGORY_ORDER: TourCategory[] = ["atv-tour", "dirt-bike-tour", "camping", "day-tour"];

export async function generateMetadata({ params }: PageProps<"/[lang]/tours">): Promise<Metadata> {
  const lang = await resolveLang(params);
  const t = getDictionary(lang).tours;
  return pageMetadata({ lang, path: "/tours", title: t.seoTitle, description: t.seoDescription });
}

export default async function ToursPage({ params }: PageProps<"/[lang]/tours">) {
  const lang = await resolveLang(params);
  const dict = getDictionary(lang);
  const tours = await getTours();
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Breadcrumbs lang={lang} crumbs={[{ name: dict.common.home, path: "/" }, { name: dict.nav.tours, path: "/tours" }]} />
      <div className="mt-8">
        <SectionHeading as="h1" kicker="Santa Teresa · Mal País · Montezuma" title={dict.tours.h1} lead={dict.tours.lead} />
      </div>

      {/* "Radio station" category tabs */}
      <nav aria-label="Tour categories" className="mb-12 flex flex-wrap gap-3">
        {CATEGORY_ORDER.map((c) => (
          <Link key={c} href={localePath(lang, `/tours/${dict.categories[c].slug}`)} className="chip text-xl text-sun hover:bg-sun hover:text-night">
            📻 {dict.categories[c].name}
          </Link>
        ))}
      </nav>

      {CATEGORY_ORDER.map((c) => {
        const list = tours.filter((t) => t.category === c);
        if (!list.length) return null;
        return (
          <section key={c} className="mb-16">
            <h2 className="text-5xl text-cyan">
              <Link href={localePath(lang, `/tours/${dict.categories[c].slug}`)} className="hover:text-pink">
                {dict.categories[c].name}
              </Link>
            </h2>
            <p className="mb-6 mt-2 text-muted">{dict.categories[c].blurb}</p>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((t) => (
                <TourCard key={t.id} lang={lang} dict={dict} tour={t} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
