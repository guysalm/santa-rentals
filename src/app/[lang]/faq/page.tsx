import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary, resolveLang } from "@/dictionaries";
import { localePath } from "@/lib/i18n";
import { faqJsonLd, pageMetadata } from "@/lib/seo";
import { waLink } from "@/lib/site";
import { FAQ } from "@/content/faq";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { SectionHeading } from "@/components/SectionHeading";

export async function generateMetadata({ params }: PageProps<"/[lang]/faq">): Promise<Metadata> {
  const lang = await resolveLang(params);
  const f = getDictionary(lang).faq;
  return pageMetadata({ lang, path: "/faq", title: f.seoTitle, description: f.seoDescription });
}

export default async function FaqPage({ params }: PageProps<"/[lang]/faq">) {
  const lang = await resolveLang(params);
  const dict = getDictionary(lang);
  const items = FAQ[lang];
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Breadcrumbs lang={lang} crumbs={[{ name: dict.common.home, path: "/" }, { name: dict.nav.faq, path: "/faq" }]} />
      <div className="mt-8">
        <SectionHeading as="h1" title={dict.faq.title} />
      </div>
      <div className="space-y-4">
        {items.map((f) => (
          <section key={f.q} className="panel p-6">
            <h2 className="text-3xl text-cyan">{f.q}</h2>
            <p className="mt-3 leading-7 text-muted">{f.a}</p>
          </section>
        ))}
      </div>
      <div className="mt-12 flex flex-wrap gap-4">
        <Link href={localePath(lang, "/book")} className="btn btn-primary">
          {dict.nav.book} ▸
        </Link>
        <a href={waLink()} rel="noopener" className="btn btn-ghost">
          {dict.common.whatsapp}
        </a>
      </div>
      <JsonLd data={faqJsonLd(items)} />
    </div>
  );
}
