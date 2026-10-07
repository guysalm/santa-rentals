import Link from "next/link";
import type { Dictionary } from "@/dictionaries";
import { getModels } from "@/lib/catalog";
import { localePath } from "@/lib/i18n";
import { formatUSD } from "@/lib/money";
import { weekPrice } from "@/lib/pricing";
import { vehicleJsonLd } from "@/lib/seo";
import type { Locale } from "@/lib/types";
import { LANDING } from "@/content/landing";
import { Breadcrumbs } from "./Breadcrumbs";
import { JsonLd } from "./JsonLd";
import { SectionHeading } from "./SectionHeading";
import { VehicleCard } from "./VehicleCard";

export async function RentalLanding({ lang, dict, type, path }: { lang: Locale; dict: Dictionary; type: "atv" | "dirtbike"; path: string }) {
  const page = dict.rentalPage[type];
  const models = await getModels(type);
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Breadcrumbs lang={lang} crumbs={[{ name: dict.common.home, path: "/" }, { name: page.h1, path }]} />
      <div className="mt-8">
        <SectionHeading as="h1" kicker="Santa Teresa · Mal País" title={page.h1} lead={page.lead} />
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {models.map((m) => (
          <VehicleCard key={m.id} lang={lang} dict={dict} model={m} />
        ))}
      </div>

      <section className="mt-16">
        <h2 className="mb-2 text-5xl text-sun">{dict.rentalPage.pricingTitle}</h2>
        <p className="mb-6 text-muted">{dict.rentalPage.durations}</p>
        <div className="panel overflow-x-auto">
          <table className="w-full min-w-[560px] text-left">
            <thead className="font-display text-xl tracking-wider text-cyan">
              <tr className="border-b-2 border-white/20">
                <th className="p-4" scope="col">{dict.types[type]}</th>
                <th className="p-4" scope="col">8h</th>
                <th className="p-4" scope="col">{dict.common.perDay.replace("/ ", "")}</th>
                <th className="p-4" scope="col">{dict.common.perWeek.replace("/ ", "")}</th>
                <th className="p-4" scope="col">{dict.common.deposit}</th>
              </tr>
            </thead>
            <tbody>
              {models.map((m) => (
                <tr key={m.id} className="border-b border-white/10 last:border-0">
                  <th scope="row" className="p-4 font-semibold">
                    <Link href={localePath(lang, `/fleet/${m.slug}`)} className="hover:text-pink">
                      {m.brand} {m.name}
                    </Link>
                  </th>
                  <td className="hud-money p-4 text-2xl">{formatUSD(m.price8hCents)}</td>
                  <td className="hud-money p-4 text-2xl">{formatUSD(m.priceDayCents)}</td>
                  <td className="hud-money p-4 text-2xl">{formatUSD(weekPrice(m))}</td>
                  <td className="p-4 text-muted">{formatUSD(m.depositCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-muted">{dict.common.taxNote}</p>
      </section>

      <section className="prose-vice mt-16 max-w-3xl">
        {LANDING[type][lang].map((s) => (
          <div key={s.h}>
            <h2>{s.h}</h2>
            {s.p.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
        ))}
      </section>

      <div className="mt-12 flex flex-wrap gap-4">
        <Link href={localePath(lang, `/book?type=${type}`)} className="btn btn-primary">
          {dict.nav.book} ▸
        </Link>
        <Link href={localePath(lang, "/tours")} className="btn btn-ghost">
          {dict.home.ctaTours}
        </Link>
      </div>
      <JsonLd data={models.map((m) => vehicleJsonLd(lang, m))} />
    </div>
  );
}
