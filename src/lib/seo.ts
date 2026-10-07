import type { Metadata } from "next";
import { SITE } from "./site";
import { absoluteUrl, alternates, localePath } from "./i18n";
import type { Faq } from "@/content/faq";
import type { Locale, Tour, VehicleModel } from "./types";

export function pageMetadata(opts: {
  lang: Locale;
  path: string;
  title: string;
  description: string;
  image?: string;
  noindex?: boolean;
}): Metadata {
  const url = absoluteUrl(localePath(opts.lang, opts.path));
  return {
    title: { absolute: opts.title },
    description: opts.description,
    alternates: alternates(opts.lang, opts.path),
    openGraph: {
      type: "website",
      siteName: SITE.name,
      url,
      title: opts.title,
      description: opts.description,
      locale: opts.lang === "es" ? "es_CR" : "en_US",
      alternateLocale: opts.lang === "es" ? ["en_US"] : ["es_CR"],
      ...(opts.image ? { images: [{ url: opts.image, width: 1200, height: 630 }] } : {}),
    },
    twitter: { card: "summary_large_image", title: opts.title, description: opts.description },
    robots: opts.noindex ? { index: false, follow: true } : undefined,
  };
}

const businessId = `${SITE.url}/#business`;

export function businessJsonLd(lang: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": ["AutoRental", "TouristInformationCenter"],
    "@id": businessId,
    name: SITE.name,
    url: absoluteUrl(localePath(lang, "/")),
    logo: `${SITE.url}/icon.svg`,
    image: `${SITE.url}/opengraph-image`,
    email: SITE.email,
    telephone: SITE.phone,
    priceRange: "$$",
    currenciesAccepted: "USD",
    paymentAccepted: "Credit Card, Debit Card",
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.locality,
      addressRegion: SITE.address.region,
      postalCode: SITE.address.postalCode,
      addressCountry: SITE.address.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: SITE.geo.lat, longitude: SITE.geo.lng },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: SITE.hours.opens,
        closes: SITE.hours.closes,
      },
    ],
    areaServed: ["Santa Teresa", "Mal País", "Playa Carmen", "Playa Hermosa", "Montezuma", "Cabuya", "Cóbano"].map((name) => ({
      "@type": "Place",
      name,
    })),
    sameAs: [SITE.instagram],
  };
}

export function vehicleJsonLd(lang: Locale, m: VehicleModel) {
  const c = m.content[lang];
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${m.brand} ${m.name} rental — Santa Teresa`,
    description: c.description,
    brand: { "@type": "Brand", name: m.brand },
    category: m.type,
    ...(m.images[0] ? { image: m.images } : {}),
    url: absoluteUrl(localePath(lang, `/fleet/${m.slug}`)),
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: (m.price8hCents / 100).toFixed(2),
      highPrice: (m.priceDayCents / 100).toFixed(2),
      offerCount: 2,
      availability: "https://schema.org/InStock",
      seller: { "@id": businessId },
    },
  };
}

export function tourJsonLd(lang: Locale, t: Tour) {
  const c = t.content[lang];
  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: c.title,
    description: c.description,
    touristType: ["Adventure", "Outdoor"],
    url: absoluteUrl(localePath(lang, `/tours/${t.slug}`)),
    ...(t.images[0] ? { image: t.images } : {}),
    itinerary: {
      "@type": "ItemList",
      itemListElement: c.itinerary.map((step, i) => ({ "@type": "ListItem", position: i + 1, name: step })),
    },
    provider: { "@id": businessId },
    offers: {
      "@type": "Offer",
      price: (t.priceCents / 100).toFixed(2),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: absoluteUrl(localePath(lang, `/book?tour=${t.slug}`)),
    },
  };
}

export function faqJsonLd(items: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

export function breadcrumbJsonLd(lang: Locale, crumbs: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(localePath(lang, c.path)),
    })),
  };
}
