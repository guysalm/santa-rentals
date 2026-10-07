import type { Metadata } from "next";
import { resolveLang } from "@/dictionaries";
import { StaticPage, staticPageMetadata } from "@/components/StaticPage";

export async function generateMetadata({ params }: PageProps<"/[lang]/privacy">): Promise<Metadata> {
  return staticPageMetadata(await resolveLang(params), "privacy");
}

export default async function PrivacyPage({ params }: PageProps<"/[lang]/privacy">) {
  return <StaticPage lang={await resolveLang(params)} page="privacy" />;
}
