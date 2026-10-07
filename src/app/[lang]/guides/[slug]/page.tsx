import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, resolveLang } from "@/dictionaries";
import { absoluteUrl, LOCALES, localePath } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { GUIDES } from "@/content/guides";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";

export function generateStaticParams() {
  return LOCALES.flatMap((lang) => GUIDES.map((g) => ({ lang, slug: g.slug })));
}

const findGuide = (slug: string) => GUIDES.find((g) => g.slug === slug);

export async function generateMetadata({ params }: PageProps<"/[lang]/guides/[slug]">): Promise<Metadata> {
  const lang = await resolveLang(params);
  const g = findGuide((await params).slug);
  if (!g) return {};
  return pageMetadata({ lang, path: `/guides/${g.slug}`, title: `${g.content[lang].title} | Santa Rentals`, description: g.content[lang].description });
}

export default async function GuidePage({ params }: PageProps<"/[lang]/guides/[slug]">) {
  const lang = await resolveLang(params);
  const g = findGuide((await params).slug);
  if (!g) notFound();
  const dict = getDictionary(lang);
  const c = g.content[lang];
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumbs
        lang={lang}
        crumbs={[
          { name: dict.common.home, path: "/" },
          { name: dict.footer.guides, path: "/guides" },
          { name: c.title, path: `/guides/${g.slug}` },
        ]}
      />
      <h1 className="mt-8 text-5xl md:text-6xl">
        <span className="sunset-text">{c.title}</span>
      </h1>
      <p className="mt-2 text-sm text-muted">
        <time dateTime={g.published}>{g.published}</time>
      </p>
      <div className="prose-retro mt-8">
        <p className="!text-lg !text-ink">{c.intro}</p>
        {c.sections.map((s) => (
          <section key={s.h}>
            <h2>{s.h}</h2>
            {s.p.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </section>
        ))}
      </div>
      <div className="mt-12 flex flex-wrap gap-4">
        <Link href={localePath(lang, "/book")} className="btn btn-primary">
          {dict.nav.book} ▸
        </Link>
        <Link href={localePath(lang, "/tours")} className="btn btn-ghost">
          {dict.home.ctaTours}
        </Link>
      </div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: c.title,
          description: c.description,
          datePublished: g.published,
          inLanguage: lang,
          mainEntityOfPage: absoluteUrl(localePath(lang, `/guides/${g.slug}`)),
          author: { "@type": "Organization", name: SITE.name, url: SITE.url },
          publisher: { "@type": "Organization", name: SITE.name, logo: { "@type": "ImageObject", url: `${SITE.url}/icon.svg` } },
        }}
      />
    </article>
  );
}
