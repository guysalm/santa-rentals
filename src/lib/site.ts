// Business facts used across pages, JSON-LD and emails. Placeholders marked TODO
// must be filled before launch (they must match the Google Business Profile).
export const SITE = {
  name: "Santa Rentals",
  legalName: "Santa Rentals",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://santa.rentals",
  email: "hola@santa.rentals",
  phone: "+506 0000 0000", // TODO real number
  whatsapp: "50600000000", // TODO digits only, used in wa.me links
  instagram: "https://instagram.com/santa.rentals", // TODO confirm handle
  address: {
    street: "Main road, Santa Teresa", // TODO exact location
    locality: "Santa Teresa",
    region: "Puntarenas",
    postalCode: "60111",
    country: "CR",
  },
  geo: { lat: 9.6436, lng: -85.1676 },
  hours: { opens: "07:30", closes: "18:00" },
  timeZone: "America/Costa_Rica",
  tzOffset: "-06:00", // Costa Rica has no DST
  currency: "USD",
} as const;

export const waLink = (text?: string) =>
  `https://wa.me/${SITE.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
