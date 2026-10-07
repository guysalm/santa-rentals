import Link from "next/link";
import type { Metadata } from "next";
import { getDictionary, resolveLang } from "@/dictionaries";
import { getModels, getTours } from "@/lib/catalog";
import { localePath } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { AREAS } from "@/content/areas";
import { FAQ } from "@/content/faq";
import { Hero } from "@/components/Hero";
import { SectionHeading } from "@/components/SectionHeading";
import { VehicleCard } from "@/components/VehicleCard";
import { TourCard } from "@/components/TourCard";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const lang = await resolveLang(params);
  const d = getDictionary(lang);
  return pageMetadata({ lang, path: "/", title: d.meta.homeTitle, description: d.meta.homeDescription });
}

export default async function Home({ params }: PageProps<"/[lang]">) {
  const lang = await resolveLang(params);
  const dict = getDictionary(lang);
  const h = dict.home;
  const [models, tours] = await Promise.all([getModels(), getTours()]);
  const faq = FAQ[lang].slice(0, 4);

  return (
    <>
      <Hero lang={lang} dict={dict} />

      {/* USP strip */}
      <section className="border-y-[3px] border-black bg-gradient-to-r from-pink via-orange to-sun text-night">
        <ul className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:grid-cols-2 lg:grid-cols-4">
          {h.usp.map((u) => (
            <li key={u.title}>
              <p className="font-display text-2xl tracking-wide">{u.title}</p>
              <p className="text-sm font-medium">{u.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20">
        <SectionHeading kicker={dict.nav.fleet} title={h.fleetTitle} lead={h.fleetLead} />
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {models.map((m) => (
            <VehicleCard key={m.id} lang={lang} dict={dict} model={m} />
          ))}
        </div>
        <p className="mt-6 text-sm text-muted">{dict.common.taxNote}</p>
      </section>

      <section className="bg-night-2 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeading title={h.howTitle} />
          <ol className="grid gap-8 md:grid-cols-3">
            {h.how.map((s, i) => (
              <li key={s.title} className="panel p-6">
                <span className="hud-money text-6xl">0{i + 1}</span>
                <h3 className="mt-2 text-3xl text-cyan">{s.title}</h3>
                <p className="mt-2 text-muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20">
        <SectionHeading kicker={dict.nav.tours} title={h.toursTitle} lead={h.toursLead} />
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {tours.slice(0, 6).map((t) => (
            <TourCard key={t.id} lang={lang} dict={dict} tour={t} />
          ))}
        </div>
        <div className="mt-10">
          <Link href={localePath(lang, "/tours")} className="btn btn-ghost">
            {dict.tours.all} ▸
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <SectionHeading title={h.areasTitle} />
        <ul className="flex flex-wrap gap-3">
          {AREAS.map((a) => (
            <li key={a.slug}>
              <Link href={localePath(lang, `/areas/${a.slug}`)} className="chip text-xl text-cyan hover:bg-cyan hover:text-night">
                {a.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="panel relative overflow-hidden p-8 md:p-14">
          <div className="sun absolute -right-16 -top-16 h-64 w-64 opacity-60" aria-hidden />
          <h2 className="relative max-w-2xl text-5xl md:text-6xl">
            <span className="sunset-text">{h.agentTitle}</span>
          </h2>
          <p className="relative mt-4 max-w-2xl text-lg text-muted">{h.agentText}</p>
          <Link href={localePath(lang, "/become-an-affiliate")} className="btn btn-sun relative mt-8">
            {h.agentCta} ▸
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12">
        <SectionHeading title={dict.faq.title} />
        <div className="space-y-3">
          {faq.map((f) => (
            <details key={f.q} className="panel group p-5">
              <summary className="cursor-pointer list-none font-display text-2xl tracking-wide marker:hidden">
                <span className="mr-2 text-pink group-open:hidden">+</span>
                <span className="mr-2 hidden text-pink group-open:inline">−</span>
                {f.q}
              </summary>
              <p className="mt-3 text-muted">{f.a}</p>
            </details>
          ))}
        </div>
        <Link href={localePath(lang, "/faq")} className="mt-6 inline-block text-cyan underline">
          {dict.common.learnMore}
        </Link>
      </section>
    </>
  );
}
