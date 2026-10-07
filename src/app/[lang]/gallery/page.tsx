import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getDictionary, resolveLang } from "@/dictionaries";
import { getModels, getTours } from "@/lib/catalog";
import { localePath } from "@/lib/i18n";
import { HERO_IMAGE, isIllustration, tourImage, vehicleImage } from "@/lib/images";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SectionHeading } from "@/components/SectionHeading";

const COPY = {
  en: {
    title: "Gallery — ATVs, Dirt Bikes & Beaches in Santa Teresa | Santa Rentals",
    description: "Photos of our ATVs, dirt bikes and scooters and the beaches and trails around Santa Teresa, Costa Rica.",
    lead: "Our machines and the coast they live on.",
    beach: "Sunset on the Santa Teresa coast",
  },
  es: {
    title: "Galería — Cuadraciclos, Motos y Playas en Santa Teresa | Santa Rentals",
    description: "Fotos de nuestros cuadraciclos, motos y scooters y de las playas y senderos de Santa Teresa, Costa Rica.",
    lead: "Nuestras máquinas y la costa donde viven.",
    beach: "Atardecer en la costa de Santa Teresa",
  },
};

export async function generateMetadata({ params }: PageProps<"/[lang]/gallery">): Promise<Metadata> {
  const lang = await resolveLang(params);
  return pageMetadata({ lang, path: "/gallery", title: COPY[lang].title, description: COPY[lang].description });
}

export default async function GalleryPage({ params }: PageProps<"/[lang]/gallery">) {
  const lang = await resolveLang(params);
  const dict = getDictionary(lang);
  const c = COPY[lang];
  const [models, tours] = await Promise.all([getModels(), getTours()]);

  // One tile per distinct photo (types share a default photo until per-model photos are uploaded).
  const seen = new Set<string>();
  const tiles: { src: string; caption: string; href?: string }[] = [];
  const add = (src: string, caption: string, href?: string) => {
    if (seen.has(src) || isIllustration(src)) return;
    seen.add(src);
    tiles.push({ src, caption, href });
  };
  add(HERO_IMAGE, c.beach);
  models.forEach((m) => add(vehicleImage(m), `${m.brand} ${m.name}`, localePath(lang, `/fleet/${m.slug}`)));
  tours.forEach((t) => add(tourImage(t), t.content[lang].title, localePath(lang, `/tours/${t.slug}`)));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Breadcrumbs lang={lang} crumbs={[{ name: dict.common.home, path: "/" }, { name: dict.nav.gallery, path: "/gallery" }]} />
      <div className="mt-8">
        <SectionHeading as="h1" title={dict.nav.gallery} lead={c.lead} />
      </div>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t, i) => {
          const figure = (
            <figure className="panel card-hover overflow-hidden">
              <div className={`relative ${i === 0 ? "aspect-[16/9]" : "aspect-[8/7]"}`}>
                <Image src={t.src} alt={t.caption} fill sizes={i === 0 ? "(min-width:1024px) 66vw, 100vw" : "(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"} className="object-cover" />
              </div>
              <figcaption className="border-t border-cyan/40 px-4 py-2 font-display text-xl tracking-wide">{t.caption}</figcaption>
            </figure>
          );
          return (
            <li key={t.src} className={i === 0 ? "sm:col-span-2" : ""}>
              {t.href ? <Link href={t.href}>{figure}</Link> : figure}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
