import type { Metadata } from "next";
import { getDictionary, resolveLang } from "@/dictionaries";
import { getModels, getTours } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";
import { Hero } from "@/components/Hero";
import { SectionHeading } from "@/components/SectionHeading";
import { VehicleCard } from "@/components/VehicleCard";
import { CoastMap } from "@/components/CoastMap";
import { FleetCarousel } from "@/components/FleetCarousel";

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
      <Hero lang={lang} dict={dict} overlap />

      {/* Fleet carousel overlapping the bottom of the hero scene, like the mockup */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-10 pt-6 lg:-mt-52 lg:pt-0">
        <h2 className="mb-3 text-3xl sm:text-4xl md:text-5xl">
          {/* Dark outline keeps the sunset gradient readable over the beach photo */}
          <span className="sunset-text [filter:drop-shadow(0_0_1px_#000)_drop-shadow(0_2px_0_#000)_drop-shadow(0_0_14px_#000)]">{h.fleetTitle}</span>
        </h2>
        <FleetCarousel
          label={h.fleetTitle}
          prev={lang === "es" ? "Vehículos anteriores" : "Previous vehicles"}
          next={lang === "es" ? "Más vehículos" : "More vehicles"}
        >
          {models.map((m) => (
            <VehicleCard key={m.id} lang={lang} dict={dict} model={m} />
          ))}
        </FleetCarousel>
        <p className="mt-3 text-sm text-muted">{dict.common.taxNote}</p>
      </section>
      <div className="gradient-bar" />

      <section className="relative pb-20 pt-16">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeading title={h.toursTitle} lead={h.toursLead} />
          <CoastMap lang={lang} dict={dict} tours={tours} />
        </div>
      </section>
    </>
  );
}
