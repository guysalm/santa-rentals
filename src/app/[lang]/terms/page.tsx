import type { Metadata } from "next";
import { resolveLang } from "@/dictionaries";
import { StaticPage, staticPageMetadata } from "@/components/StaticPage";

export async function generateMetadata({ params }: PageProps<"/[lang]/terms">): Promise<Metadata> {
  return staticPageMetadata(await resolveLang(params), "terms");
}

export default async function TermsPage({ params }: PageProps<"/[lang]/terms">) {
  return <StaticPage lang={await resolveLang(params)} page="terms" />;
}
