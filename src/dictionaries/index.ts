import "server-only";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import en from "./en";
import es from "./es";

const dictionaries = { en, es };
export const getDictionary = (lang: Locale) => dictionaries[lang];
export type { Dictionary } from "./en";

/** Resolve and validate the [lang] param; unknown locales 404. */
export async function resolveLang(params: Promise<{ lang: string }>): Promise<Locale> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return lang;
}
