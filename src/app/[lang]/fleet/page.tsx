import type { Metadata } from "next";
import { getDictionary, resolveLang } from "@/dictionaries";
import { getModels } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SectionHeading } from "@/components/SectionHeading";
import { VehicleCard } from "@/components/VehicleCard";

const COPY = {
  en: {
    title: "Our Fleet — ATVs, Dirt Bikes & Scooters in Santa Teresa | Santa Rentals",
    description: "Browse every ATV, quad, dirt bike and scooter for rent in Santa Teresa, Costa Rica. Honda & Kymco, from $45. Free delivery, instant online booking.",
    h1: "The Garage",
    lead: "Every machine we rent, serviced before each hire. Pick your ride.",
  },
  es: {
    title: "Nuestra Flota — Cuadraciclos, Motos y Scooters en Santa Teresa | Santa Rentals",
    description: "Todos los cuadraciclos, motos y scooters en alquiler en Santa Teresa, Costa Rica. Honda y Kymco desde $45. Entrega gratis, reserva en línea.",
    h1: "El Garaje",
    lead: "Todas nuestras máquinas, revisadas antes de cada alquiler. Elige la tuya.",
  },
};

export async function generateMetadata({ params }: PageProps<"/[lang]/fleet">): Promise<Metadata> {
  const lang = await resolveLang(params);
  return pageMetadata({ lang, path: "/fleet", title: COPY[lang].title, description: COPY[lang].description });
}

export default async function FleetPage({ params }: PageProps<"/[lang]/fleet">) {
  const lang = await resolveLang(params);
  const dict = getDictionary(lang);
  const models = await getModels();
  const types = [...new Set(models.map((m) => m.type))];
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Breadcrumbs lang={lang} crumbs={[{ name: dict.common.home, path: "/" }, { name: dict.nav.fleet, path: "/fleet" }]} />
      <div className="mt-8">
        <SectionHeading as="h1" title={COPY[lang].h1} lead={COPY[lang].lead} />
      </div>
      {types.map((t) => (
        <section key={t} className="mb-16">
          <h2 className="mb-6 text-4xl text-cyan">{dict.types[t]}</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {models
              .filter((m) => m.type === t)
              .map((m) => (
                <VehicleCard key={m.id} lang={lang} dict={dict} model={m} />
              ))}
          </div>
        </section>
      ))}
      <p className="text-sm text-muted">{dict.common.taxNote}</p>
    </div>
  );
}
