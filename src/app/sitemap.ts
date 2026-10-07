import type { MetadataRoute } from "next";
import { getModels, getTours } from "@/lib/catalog";
import { absoluteUrl, localePath } from "@/lib/i18n";
import { AREAS } from "@/content/areas";
import { GUIDES } from "@/content/guides";
import en from "@/dictionaries/en";

// Every public page in both languages, each with hreflang alternates.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [models, tours] = await Promise.all([getModels(), getTours()]);
  const paths: { path: string; priority: number }[] = [
    { path: "/", priority: 1 },
    { path: "/atv-rental-santa-teresa", priority: 0.95 },
    { path: "/dirt-bike-rental-santa-teresa", priority: 0.9 },
    { path: "/tours", priority: 0.9 },
    { path: "/fleet", priority: 0.8 },
    { path: "/gallery", priority: 0.5 },
    { path: "/book", priority: 0.8 },
    ...models.map((m) => ({ path: `/fleet/${m.slug}`, priority: 0.8 })),
    ...Object.values(en.categories).map((c) => ({ path: `/tours/${c.slug}`, priority: 0.8 })),
    ...tours.map((t) => ({ path: `/tours/${t.slug}`, priority: 0.8 })),
    ...AREAS.map((a) => ({ path: `/areas/${a.slug}`, priority: 0.7 })),
    { path: "/guides", priority: 0.6 },
    ...GUIDES.map((g) => ({ path: `/guides/${g.slug}`, priority: 0.6 })),
    { path: "/faq", priority: 0.6 },
    { path: "/become-an-affiliate", priority: 0.5 },
    { path: "/about", priority: 0.4 },
    { path: "/contact", priority: 0.4 },
    { path: "/rental-agreement", priority: 0.2 },
    { path: "/terms", priority: 0.2 },
    { path: "/privacy", priority: 0.2 },
  ];

  return paths.flatMap(({ path, priority }) => {
    const languages = { en: absoluteUrl(localePath("en", path)), es: absoluteUrl(localePath("es", path)) };
    return (["en", "es"] as const).map((lang) => ({
      url: languages[lang],
      changeFrequency: "weekly" as const,
      priority: lang === "en" ? priority : Math.round(priority * 90) / 100,
      alternates: { languages },
    }));
  });
}
