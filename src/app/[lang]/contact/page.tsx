import type { Metadata } from "next";
import { resolveLang } from "@/dictionaries";
import { StaticPage, staticPageMetadata } from "@/components/StaticPage";

export async function generateMetadata({ params }: PageProps<"/[lang]/contact">): Promise<Metadata> {
  return staticPageMetadata(await resolveLang(params), "contact");
}

export default async function ContactPage({ params }: PageProps<"/[lang]/contact">) {
  return <StaticPage lang={await resolveLang(params)} page="contact" />;
}
