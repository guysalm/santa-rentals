import { NextResponse, type NextRequest } from "next/server";
import { getModels, getSettings, getTour } from "@/lib/catalog";
import { hasSupabaseAdmin } from "@/lib/env";
import { rentalPeriod } from "@/lib/pricing";
import { db } from "@/lib/supabase/admin";
import { SEED_UNITS } from "@/content/catalog";

// GET ?date=YYYY-MM-DD&time=HH:MM&mode=8h|days&days=N  → { units: { slug: n } }
// GET ?tour=slug&date=YYYY-MM-DD                       → { seatsLeft: n }
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  const date = q.get("date") ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ error: "date required" }, { status: 400 });
  const headers = { "Cache-Control": "no-store" };

  const tourSlug = q.get("tour");
  if (tourSlug) {
    const tour = await getTour(tourSlug);
    if (!tour) return NextResponse.json({ error: "unknown tour" }, { status: 404 });
    const dow = new Date(`${date}T12:00:00Z`).getUTCDay();
    if (!tour.daysOfWeek.includes(dow)) return NextResponse.json({ seatsLeft: 0, running: false }, { headers });
    if (!hasSupabaseAdmin()) return NextResponse.json({ seatsLeft: tour.maxPax, running: true }, { headers });
    const { data, error } = await db().rpc("tour_seats_left", { p_tour: tour.id, p_date: date });
    if (error) throw error;
    return NextResponse.json({ seatsLeft: data, running: true }, { headers });
  }

  const time = q.get("time") ?? "09:00";
  const mode = q.get("mode") === "days" ? "days" : "8h";
  const days = Math.min(30, Math.max(1, Number(q.get("days") ?? 1) || 1));
  if (!/^\d{2}:\d{2}$/.test(time)) return NextResponse.json({ error: "bad time" }, { status: 400 });

  const models = await getModels();
  if (!hasSupabaseAdmin()) {
    return NextResponse.json({ units: Object.fromEntries(models.map((m) => [m.slug, SEED_UNITS[m.slug] ?? 1])) }, { headers });
  }
  const settings = await getSettings();
  const { start, end } = rentalPeriod({ date, time, mode, days });
  const { data, error } = await db().rpc("availability_for_period", {
    p_start: start.toISOString(),
    p_end: end.toISOString(),
    p_buffer_hours: settings.bufferHours,
  });
  if (error) throw error;
  const byId = new Map(data.map((d) => [d.model_id, d.available]));
  return NextResponse.json({ units: Object.fromEntries(models.map((m) => [m.slug, byId.get(m.id) ?? 0])) }, { headers });
}
