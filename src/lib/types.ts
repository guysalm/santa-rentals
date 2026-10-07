export type Locale = "en" | "es";

export type VehicleType = "atv" | "dirtbike" | "scooter" | "utv";
export type TourCategory = "atv-tour" | "dirt-bike-tour" | "camping" | "day-tour";

export type Localized<T> = Record<Locale, T>;

export interface VehicleContent {
  tagline: string;
  description: string;
  highlights: string[];
  seoTitle: string;
  seoDescription: string;
}

export interface VehicleModel {
  id: string;
  slug: string;
  type: VehicleType;
  brand: string;
  name: string;
  engineCc: number | null;
  seats: number;
  transmission: "automatic" | "semi-automatic" | "manual";
  minAge: number;
  price8hCents: number;
  priceDayCents: number;
  priceWeekCents: number | null;
  depositCents: number;
  images: string[];
  content: Localized<VehicleContent>;
  sort: number;
}

export interface TourContent {
  title: string;
  summary: string;
  description: string;
  itinerary: string[];
  includes: string[];
  bring: string[];
  seoTitle: string;
  seoDescription: string;
}

export interface Tour {
  id: string;
  slug: string;
  category: TourCategory;
  durationHours: number;
  overnight: boolean;
  startTime: string; // "HH:MM"
  daysOfWeek: number[]; // 0 = Sunday
  priceCents: number; // per person
  minPax: number;
  maxPax: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  images: string[];
  content: Localized<TourContent>;
  sort: number;
}

export interface Season {
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  multiplier: number;
}
