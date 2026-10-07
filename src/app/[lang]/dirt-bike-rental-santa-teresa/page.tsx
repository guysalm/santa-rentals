import type { Metadata } from "next";
import { getDictionary, resolveLang } from "@/dictionaries";
import { pageMetadata } from "@/lib/seo";
import { RentalLanding } from "@/components/RentalLanding";

const PATH = "/dirt-bike-rental-santa-teresa";

export async function generateMetadata({ params }: PageProps<"/[lang]/dirt-bike-rental-santa-teresa">): Promise<Metadata> {
  const lang = await resolveLang(params);
  const p = getDictionary(lang).rentalPage.dirtbike;
  return pageMetadata({ lang, path: PATH, title: p.seoTitle, description: p.seoDescription });
}

export default async function Page({ params }: PageProps<"/[lang]/dirt-bike-rental-santa-teresa">) {
  const lang = await resolveLang(params);
  return <RentalLanding lang={lang} dict={getDictionary(lang)} type="dirtbike" path={PATH} />;
}
