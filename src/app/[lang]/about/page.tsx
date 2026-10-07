import type { Metadata } from "next";
import { resolveLang } from "@/dictionaries";
import { StaticPage, staticPageMetadata } from "@/components/StaticPage";

export async function generateMetadata({ params }: PageProps<"/[lang]/about">): Promise<Metadata> {
  return staticPageMetadata(await resolveLang(params), "about");
}

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  return <StaticPage lang={await resolveLang(params)} page="about" />;
}
