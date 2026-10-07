import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary, resolveLang } from "@/dictionaries";
import { localePath } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { GUIDES } from "@/content/guides";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SectionHeading } from "@/components/SectionHeading";

const COPY = {
  en: { title: "Santa Teresa Riding Guides — Routes, Rules & Tips | Santa Rentals", description: "Local guides to riding ATVs and dirt bikes around Santa Teresa, Costa Rica: routes, rules, sunsets and day trips.", lead: "Routes, rules and local tips from the crew." },
  es: { title: "Guías de Ruta en Santa Teresa — Rutas, Reglas y Consejos | Santa Rentals", description: "Guías locales para manejar cuadraciclo y moto en Santa Teresa, Costa Rica: rutas, reglas, atardeceres y paseos.", lead: "Rutas, reglas y consejos locales del equipo." },
};

export async function generateMetadata({ params }: PageProps<"/[lang]/guides">): Promise<Metadata> {
  const lang = await resolveLang(params);
  return pageMetadata({ lang, path: "/guides", title: COPY[lang].title, description: COPY[lang].description });
}

export default async function GuidesPage({ params }: PageProps<"/[lang]/guides">) {
  const lang = await resolveLang(params);
  const dict = getDictionary(lang);
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Breadcrumbs lang={lang} crumbs={[{ name: dict.common.home, path: "/" }, { name: dict.footer.guides, path: "/guides" }]} />
      <div className="mt-8">
        <SectionHeading as="h1" title={dict.footer.guides} lead={COPY[lang].lead} />
      </div>
      <ul className="grid gap-6 md:grid-cols-2">
        {GUIDES.map((g) => {
          const c = g.content[lang];
          return (
            <li key={g.slug} className="panel relative p-6 transition-transform hover:-translate-y-1">
              <h2 className="text-3xl">
                <Link href={localePath(lang, `/guides/${g.slug}`)} className="after:absolute after:inset-0 hover:text-pink">
                  {c.title}
                </Link>
              </h2>
              <p className="mt-3 text-muted">{c.description}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
