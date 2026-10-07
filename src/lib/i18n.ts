import type { Locale } from "./types";
import { SITE } from "./site";

export const LOCALES: Locale[] = ["en", "es"];
export const DEFAULT_LOCALE: Locale = "en";

export const isLocale = (v: string): v is Locale => (LOCALES as string[]).includes(v);

/** Public path for a locale: English is unprefixed, Spanish lives under /es. */
export function localePath(lang: Locale, path = "/"): string {
  const clean = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  if (lang === DEFAULT_LOCALE) return clean || "/";
  return `/${lang}${clean}`;
}

export const absoluteUrl = (path: string) => `${SITE.url}${path === "/" ? "" : path}`;

/** canonical + hreflang alternates for generateMetadata. */
export function alternates(lang: Locale, path: string) {
  return {
    canonical: absoluteUrl(localePath(lang, path)),
    languages: {
      en: absoluteUrl(localePath("en", path)),
      es: absoluteUrl(localePath("es", path)),
      "x-default": absoluteUrl(localePath("en", path)),
    },
  };
}
