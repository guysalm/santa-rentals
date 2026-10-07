import type { Metadata } from "next";
import { resolveLang } from "@/dictionaries";
import { StaticPage, staticPageMetadata } from "@/components/StaticPage";

export async function generateMetadata({ params }: PageProps<"/[lang]/rental-agreement">): Promise<Metadata> {
  return staticPageMetadata(await resolveLang(params), "rental-agreement");
}

export default async function RentalAgreementPage({ params }: PageProps<"/[lang]/rental-agreement">) {
  return <StaticPage lang={await resolveLang(params)} page="rental-agreement" />;
}
