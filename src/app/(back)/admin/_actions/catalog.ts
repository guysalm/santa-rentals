"use server";

import { refresh, updateTag } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { CATALOG_TAG } from "@/lib/catalog";
import { db } from "@/lib/supabase/admin";
import { DEFAULT_SETTINGS, type BusinessSettings } from "@/lib/policy";
import type { Json } from "@/lib/database.types";

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const cents = (f: FormData, k: string) => Math.round(Number(str(f, k)) * 100);
const lines = (f: FormData, k: string) => str(f, k).split(/\r?\n/).map((s) => s.trim()).filter(Boolean);

/** Public pages are cached with CATALOG_TAG — expire them after every catalog edit. */
function published() {
  updateTag(CATALOG_TAG);
  refresh();
}

async function uploadImages(form: FormData, folder: string) {
  const urls: string[] = [];
  for (const file of form.getAll("upload")) {
    if (!(file instanceof File) || file.size === 0) continue;
    if (!file.type.startsWith("image/") || file.size > 8 * 1024 * 1024) throw new Error("Images only, max 8 MB");
    const path = `${folder}/${crypto.randomUUID()}.${file.type.split("/")[1] ?? "jpg"}`;
    const { error } = await db().storage.from("media").upload(path, file, { contentType: file.type });
    if (error) throw error;
    urls.push(db().storage.from("media").getPublicUrl(path).data.publicUrl);
  }
  return urls;
}

export async function saveModel(form: FormData) {
  await requireStaff();
  const id = str(form, "id");
  const { data: current } = await db().from("vehicle_models").select("content, slug").eq("id", id).single();
  if (!current) throw new Error("Model not found");
  const content = (current.content ?? {}) as Record<string, Record<string, unknown>>;
  for (const lang of ["en", "es"] as const) {
    content[lang] = {
      ...(content[lang] ?? {}),
      tagline: str(form, `${lang}.tagline`),
      description: str(form, `${lang}.description`),
      highlights: lines(form, `${lang}.highlights`),
      seoTitle: str(form, `${lang}.seoTitle`),
      seoDescription: str(form, `${lang}.seoDescription`),
    };
  }
  const uploaded = await uploadImages(form, `vehicles/${current.slug}`);
  const week = str(form, "price_week");
  const { error } = await db()
    .from("vehicle_models")
    .update({
      price_8h_cents: cents(form, "price_8h"),
      price_day_cents: cents(form, "price_day"),
      price_week_cents: week ? Math.round(Number(week) * 100) : null,
      deposit_cents: cents(form, "deposit"),
      min_age: Number(str(form, "min_age")) || 18,
      sort: Number(str(form, "sort")) || 0,
      active: form.get("active") === "on",
      images: [...lines(form, "images"), ...uploaded],
      content: content as NonNullable<Json>,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw error;
  published();
}

export async function addVehicle(form: FormData) {
  await requireStaff();
  const { error } = await db().from("vehicles").insert({
    model_id: str(form, "model_id"),
    label: str(form, "label"),
    plate: str(form, "plate") || null,
    color: str(form, "color") || null,
  });
  if (error) throw error;
  refresh();
}

export async function setVehicleStatus(form: FormData) {
  await requireStaff();
  const status = str(form, "status") as "available" | "maintenance" | "retired";
  await db().from("vehicles").update({ status, notes: str(form, "notes") || null }).eq("id", str(form, "id"));
  refresh();
}

export async function addMaintenance(form: FormData) {
  await requireStaff();
  const { error } = await db().from("maintenance_logs").insert({
    vehicle_id: str(form, "vehicle_id"),
    description: str(form, "description"),
    cost_cents: str(form, "cost") ? cents(form, "cost") : null,
    odometer_km: Number(str(form, "odometer")) || null,
  });
  if (error) throw error;
  refresh();
}

export async function saveTour(form: FormData) {
  await requireStaff();
  const id = str(form, "id");
  const { data: current } = await db().from("tours").select("content, slug").eq("id", id).single();
  if (!current) throw new Error("Tour not found");
  const content = (current.content ?? {}) as Record<string, Record<string, unknown>>;
  for (const lang of ["en", "es"] as const) {
    content[lang] = {
      ...(content[lang] ?? {}),
      title: str(form, `${lang}.title`),
      summary: str(form, `${lang}.summary`),
      description: str(form, `${lang}.description`),
      itinerary: lines(form, `${lang}.itinerary`),
      includes: lines(form, `${lang}.includes`),
      bring: lines(form, `${lang}.bring`),
      seoTitle: str(form, `${lang}.seoTitle`),
      seoDescription: str(form, `${lang}.seoDescription`),
    };
  }
  const uploaded = await uploadImages(form, `tours/${current.slug}`);
  const days = form.getAll("days").map(Number).filter((d) => d >= 0 && d <= 6);
  const { error } = await db()
    .from("tours")
    .update({
      price_cents: cents(form, "price"),
      min_pax: Number(str(form, "min_pax")) || 1,
      max_pax: Number(str(form, "max_pax")) || 8,
      duration_hours: Number(str(form, "duration")) || 4,
      start_time: str(form, "start_time") || "08:00",
      difficulty: Math.min(5, Math.max(1, Number(str(form, "difficulty")) || 2)),
      days_of_week: days.length ? days : [0, 1, 2, 3, 4, 5, 6],
      active: form.get("active") === "on",
      images: [...lines(form, "images"), ...uploaded],
      content: content as NonNullable<Json>,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw error;
  published();
}

/** Close (weather, guide off) or reopen a specific tour date. */
export async function setDeparture(form: FormData) {
  await requireStaff();
  const tourId = str(form, "tour_id");
  const date = str(form, "date");
  const { data: tour } = await db().from("tours").select("max_pax").eq("id", tourId).single();
  await db()
    .from("tour_departures")
    .upsert(
      { tour_id: tourId, departs_on: date, capacity: Number(str(form, "capacity")) || tour?.max_pax || 8, closed: str(form, "closed") === "1" },
      { onConflict: "tour_id,departs_on" },
    );
  refresh();
}

export async function addSeason(form: FormData) {
  await requireStaff();
  const { error } = await db().from("seasons").insert({
    name: str(form, "name"),
    start_date: str(form, "start"),
    end_date: str(form, "end"),
    multiplier: Number(str(form, "multiplier")) || 1,
  });
  if (error) throw error;
  published();
}

export async function deleteSeason(form: FormData) {
  await requireStaff();
  await db().from("seasons").delete().eq("id", str(form, "id"));
  published();
}

export async function saveSettings(form: FormData) {
  await requireStaff({ adminOnly: true });
  // Only rows with both fields filled ("" would coerce to 0 and create a free-cancellation tier).
  const tiers = [0, 1, 2]
    .filter((i) => str(form, `tier${i}.hours`) !== "" && str(form, `tier${i}.fee`) !== "")
    .map((i) => ({ minHoursBefore: Number(str(form, `tier${i}.hours`)), feePct: Number(str(form, `tier${i}.fee`)) }))
    .filter((t) => t.minHoursBefore >= 0 && t.feePct >= 0 && t.feePct <= 100);
  const value: BusinessSettings = {
    bufferHours: Number(str(form, "bufferHours")) || DEFAULT_SETTINGS.bufferHours,
    cancellation: tiers.length ? tiers : DEFAULT_SETTINGS.cancellation,
    affiliateDefaults: {
      commissionRate: Number(str(form, "commissionRate")) || DEFAULT_SETTINGS.affiliateDefaults.commissionRate,
      customerDiscount: Number(str(form, "customerDiscount")) || DEFAULT_SETTINGS.affiliateDefaults.customerDiscount,
      tagFeeCents: cents(form, "tagFee") || DEFAULT_SETTINGS.affiliateDefaults.tagFeeCents,
    },
    cookieDays: Number(str(form, "cookieDays")) || DEFAULT_SETTINGS.cookieDays,
    earliestPickup: str(form, "earliestPickup") || DEFAULT_SETTINGS.earliestPickup,
    latestPickup: str(form, "latestPickup") || DEFAULT_SETTINGS.latestPickup,
    adminEmails: str(form, "adminEmails").split(/[\s,]+/).filter((e) => /\S+@\S+/.test(e)),
  };
  const { error } = await db().from("settings").upsert({ key: "business", value: value as unknown as NonNullable<Json>, updated_at: new Date().toISOString() });
  if (error) throw error;
  published();
}
