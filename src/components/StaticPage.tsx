import type { Metadata } from "next";
import { getDictionary } from "@/dictionaries";
import { pageMetadata } from "@/lib/seo";
import { SITE, waLink } from "@/lib/site";
import type { Locale } from "@/lib/types";
import { PAGES, WAIVER_VERSION, type StaticPageKey } from "@/content/pages";
import { Breadcrumbs } from "./Breadcrumbs";
import { SectionHeading } from "./SectionHeading";

export const staticPageMetadata = (lang: Locale, key: StaticPageKey): Metadata => {
  const p = PAGES[key][lang];
  return pageMetadata({ lang, path: `/${key}`, title: p.seoTitle, description: p.seoDescription });
};

export function StaticPage({ lang, page }: { lang: Locale; page: StaticPageKey }) {
  const dict = getDictionary(lang);
  const p = PAGES[page][lang];
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumbs lang={lang} crumbs={[{ name: dict.common.home, path: "/" }, { name: p.h1, path: `/${page}` }]} />
      <div className="mt-8">
        <SectionHeading as="h1" title={p.h1} />
      </div>
      <div className="prose-vice">
        {p.sections.map((s, i) => (
          <section key={s.h ?? i}>
            {s.h && <h2>{s.h}</h2>}
            {s.p.map((t) => (
              <p key={t.slice(0, 24)}>{t}</p>
            ))}
          </section>
        ))}
        {page === "contact" && (
          <ul>
            <li>
              WhatsApp: <a href={waLink()} rel="noopener">{SITE.phone}</a>
            </li>
            <li>
              Email: <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </li>
            <li>
              {SITE.address.street}, {SITE.address.locality}, {SITE.address.region}, Costa Rica
            </li>
          </ul>
        )}
        {page === "rental-agreement" && <p className="text-xs">Version {WAIVER_VERSION}</p>}
      </div>
    </div>
  );
}
