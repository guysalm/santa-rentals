import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { getDictionary, resolveLang } from "@/dictionaries";
import { BOOKING_COPY } from "@/dictionaries/booking";
import { currentAffiliate } from "@/lib/affiliate";
import { crToday } from "@/lib/booking";
import { getModels, getSeasons, getSettings, getTours } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";
import type { Locale, VehicleType } from "@/lib/types";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SectionHeading } from "@/components/SectionHeading";
import { BookingWizard } from "@/components/booking/BookingWizard";

const META = {
  en: { title: "Book an ATV, Dirt Bike or Tour in Santa Teresa — Instant Confirmation | Santa Rentals", description: "Check live availability and book your ATV, dirt bike or guided tour in Santa Teresa, Costa Rica. Secure online payment, free delivery, instant confirmation." },
  es: { title: "Reserva Cuadraciclo, Moto o Tour en Santa Teresa — Confirmación Inmediata | Santa Rentals", description: "Consulta disponibilidad en vivo y reserva tu cuadraciclo, moto o tour en Santa Teresa, Costa Rica. Pago seguro, entrega gratis y confirmación inmediata." },
};

export async function generateMetadata({ params }: PageProps<"/[lang]/book">): Promise<Metadata> {
  const lang = await resolveLang(params);
  return pageMetadata({ lang, path: "/book", title: META[lang].title, description: META[lang].description });
}

export default async function BookPage({ params, searchParams }: PageProps<"/[lang]/book">) {
  const lang = await resolveLang(params);
  const dict = getDictionary(lang);
  const t = BOOKING_COPY[lang];
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Breadcrumbs lang={lang} crumbs={[{ name: dict.common.home, path: "/" }, { name: dict.nav.book, path: "/book" }]} />
      <div className="mt-8">
        <SectionHeading as="h1" title={t.title} lead={t.lead} />
      </div>
      <Suspense fallback={<div className="panel h-96 animate-pulse" aria-busy="true" />}>
        <BookingContent lang={lang} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function BookingContent({ lang, searchParams }: { lang: Locale; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  await connection(); // request-time render: crToday() reads the clock
  const str = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  const [models, tours, seasons, settings, affiliate] = await Promise.all([getModels(), getTours(), getSeasons(), getSettings(), currentAffiliate()]);
  const type = str("type");
  return (
    <BookingWizard
      lang={lang}
      today={crToday()}
      models={models}
      tours={tours}
      seasons={seasons}
      pickupWindow={{ earliest: settings.earliestPickup, latest: settings.latestPickup }}
      affiliate={affiliate ? { name: affiliate.fullName.split(" ")[0], discount: affiliate.customerDiscount } : null}
      initial={{
        kind: str("tour") || str("kind") === "tour" || type === "tour" ? "tour" : "rental",
        model: str("model"),
        tour: str("tour"),
        type: type && ["atv", "dirtbike", "scooter", "utv"].includes(type) ? (type as VehicleType) : undefined,
        date: str("date")?.match(/^\d{4}-\d{2}-\d{2}$/) ? str("date") : undefined,
      }}
      released={str("released")?.match(/^[0-9a-f]{36}$/) ? str("released")! : null}
    />
  );
}
