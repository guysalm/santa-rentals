import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { SEASONS, TOURS, VEHICLE_MODELS } from "@/content/catalog";
import { db } from "./supabase/admin";
import { hasSupabaseAdmin } from "./env";
import { DEFAULT_SETTINGS, type BusinessSettings } from "./policy";
import type { Season, Tour, TourCategory, VehicleModel, VehicleType } from "./types";

/** Invalidate with revalidateTag(CATALOG_TAG, "max") or updateTag after admin edits. */
export const CATALOG_TAG = "catalog";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const toModel = (r: any): VehicleModel => ({
  id: r.id,
  slug: r.slug,
  type: r.type,
  brand: r.brand,
  name: r.name,
  engineCc: r.engine_cc,
  seats: r.seats,
  transmission: r.transmission,
  minAge: r.min_age,
  price8hCents: r.price_8h_cents,
  priceDayCents: r.price_day_cents,
  priceWeekCents: r.price_week_cents,
  depositCents: r.deposit_cents,
  images: r.images ?? [],
  content: r.content,
  sort: r.sort,
});

export const toTour = (r: any): Tour => ({
  id: r.id,
  slug: r.slug,
  category: r.category,
  durationHours: Number(r.duration_hours),
  overnight: r.overnight,
  startTime: String(r.start_time).slice(0, 5),
  daysOfWeek: r.days_of_week,
  priceCents: r.price_cents,
  minPax: r.min_pax,
  maxPax: r.max_pax,
  difficulty: r.difficulty,
  images: r.images ?? [],
  content: r.content,
  sort: r.sort,
});
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function getModels(type?: VehicleType): Promise<VehicleModel[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);
  let models: VehicleModel[];
  if (!hasSupabaseAdmin()) {
    models = VEHICLE_MODELS;
  } else {
    const { data, error } = await db().from("vehicle_models").select("*").eq("active", true).order("sort");
    if (error) throw error;
    models = data.map(toModel);
  }
  return type ? models.filter((m) => m.type === type) : [...models].sort((a, b) => a.sort - b.sort);
}

export async function getModel(slug: string) {
  return (await getModels()).find((m) => m.slug === slug) ?? null;
}

export async function getTours(category?: TourCategory): Promise<Tour[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);
  let tours: Tour[];
  if (!hasSupabaseAdmin()) {
    tours = TOURS;
  } else {
    const { data, error } = await db().from("tours").select("*").eq("active", true).order("sort");
    if (error) throw error;
    tours = data.map(toTour);
  }
  return category ? tours.filter((t) => t.category === category) : [...tours].sort((a, b) => a.sort - b.sort);
}

export async function getTour(slug: string) {
  return (await getTours()).find((t) => t.slug === slug) ?? null;
}

export async function getSeasons(): Promise<Season[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);
  if (!hasSupabaseAdmin()) return SEASONS;
  const { data, error } = await db().from("seasons").select("*");
  if (error) throw error;
  return data.map((s) => ({ name: s.name, startDate: s.start_date, endDate: s.end_date, multiplier: Number(s.multiplier) }));
}

export async function getSettings(): Promise<BusinessSettings> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);
  if (!hasSupabaseAdmin()) return DEFAULT_SETTINGS;
  const { data } = await db().from("settings").select("value").eq("key", "business").maybeSingle();
  return { ...DEFAULT_SETTINGS, ...((data?.value as Partial<BusinessSettings>) ?? {}) };
}

export const fromPrice = (m: VehicleModel) => m.price8hCents;
