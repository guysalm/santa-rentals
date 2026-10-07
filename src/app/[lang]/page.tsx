import type { Metadata } from "next";
import { getDictionary, resolveLang } from "@/dictionaries";
import { getModels, getTours } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";
import { Hero } from "@/components/Hero";
import { SectionHeading } from "@/components/SectionHeading";
import { VehicleCard } from "@/components/VehicleCard";
import { CoastMap } from "@/components/CoastMap";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const lang = await resolveLang(params);
  const d = getDictionary(lang);
  return pageMetadata({ lang, path: "/", title: d.meta.homeTitle, description: d.meta.homeDescription });
}

// Mockup structure: hero + quick booking → legendary fleet → mission map → footer.
export default async function Home({ params }: PageProps<"/[lang]">) {
  const lang = await resolveLang(params);
  const dict = getDictionary(lang);
  const h = dict.home;
  const [models, tours] = await Promise.all([getModels(), getTours()]);

  return (
    <>
      <Hero lang={lang} dict={dict} />

      <section className="mx-auto max-w-7xl px-4 py-16">
        <SectionHeading title={h.fleetTitle} lead={h.fleetLead} />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {models.map((m) => (
            <VehicleCard key={m.id} lang={lang} dict={dict} model={m} />
          ))}
        </div>
        <p className="mt-6 text-sm text-muted">{dict.common.taxNote}</p>
      </section>

      <section className="relative pb-20 pt-16">
        <div className="gradient-bar absolute inset-x-0 top-0 opacity-60" aria-hidden />
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeading title={h.toursTitle} lead={h.toursLead} />
          <CoastMap lang={lang} dict={dict} tours={tours} />
        </div>
      </section>
    </>
  );
}
