import type { Metadata } from "next";
import { getDictionary, resolveLang } from "@/dictionaries";
import { pageMetadata } from "@/lib/seo";
import { RentalLanding } from "@/components/RentalLanding";

const PATH = "/atv-rental-santa-teresa";

export async function generateMetadata({ params }: PageProps<"/[lang]/atv-rental-santa-teresa">): Promise<Metadata> {
  const lang = await resolveLang(params);
  const p = getDictionary(lang).rentalPage.atv;
  return pageMetadata({ lang, path: PATH, title: p.seoTitle, description: p.seoDescription });
}

export default async function Page({ params }: PageProps<"/[lang]/atv-rental-santa-teresa">) {
  const lang = await resolveLang(params);
  return <RentalLanding lang={lang} dict={getDictionary(lang)} type="atv" path={PATH} />;
}
