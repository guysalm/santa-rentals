import "server-only";
import { db } from "./supabase/admin";
import { SITE } from "./site";

/** Start of a Costa Rica calendar day as an ISO timestamp. */
export const crDayStart = (date: string) => new Date(`${date}T00:00:00${SITE.tzOffset}`).toISOString();
export const addDaysStr = (date: string, n: number) => new Date(new Date(`${date}T12:00:00Z`).getTime() + n * 86_400_000).toISOString().slice(0, 10);

export const LIST_SELECT =
  "id, code, kind, status, start_at, end_at, total_cents, refunded_cents, delivery_location, pax, payment_provider, customer:customers(full_name, email, phone), affiliate:affiliates(full_name), tour:tours(content), items:reservation_items(model:vehicle_models(brand, name), vehicle:vehicles(label))";

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ReservationRow {
  id: string;
  code: string;
  kind: "rental" | "tour";
  status: string;
  startAt: string | null;
  endAt: string | null;
  totalCents: number;
  refundedCents: number;
  delivery: string | null;
  customer: string;
  email: string;
  phone: string | null;
  agent: string | null;
  what: string;
  units: string;
  provider: string;
}

export function toRow(r: any): ReservationRow {
  const models = new Map<string, number>();
  (r.items ?? []).forEach((i: any) => {
    const n = `${i.model.brand} ${i.model.name}`;
    models.set(n, (models.get(n) ?? 0) + 1);
  });
  return {
    id: r.id,
    code: r.code,
    kind: r.kind,
    status: r.status,
    startAt: r.start_at,
    endAt: r.end_at,
    totalCents: r.total_cents,
    refundedCents: r.refunded_cents,
    delivery: r.delivery_location,
    customer: r.customer?.full_name ?? "—",
    email: r.customer?.email ?? "",
    phone: r.customer?.phone ?? null,
    agent: r.affiliate?.full_name ?? null,
    what: r.kind === "tour" ? `${r.tour?.content?.en?.title ?? "Tour"} · ${r.pax} pax` : [...models].map(([n, q]) => `${q}× ${n}`).join(", "),
    units: (r.items ?? []).map((i: any) => i.vehicle.label).join(", "),
    provider: r.payment_provider,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function listReservations(filter: { status?: string; from?: string; to?: string; q?: string; limit?: number }) {
  let query = db().from("reservations").select(LIST_SELECT).order("start_at", { ascending: true }).limit(filter.limit ?? 200);
  if (filter.status === "upcoming") query = query.in("status", ["paid", "active"]);
  else if (filter.status && filter.status !== "all") query = query.eq("status", filter.status as never);
  else query = query.neq("status", "expired");
  if (filter.from) query = query.gte("start_at", crDayStart(filter.from));
  if (filter.to) query = query.lt("start_at", crDayStart(addDaysStr(filter.to, 1)));
  if (filter.q) {
    const q = filter.q.replace(/[%,()]/g, "");
    const { data: custs } = await db().from("customers").select("id").or(`email.ilike.%${q}%,full_name.ilike.%${q}%,phone.ilike.%${q}%`).limit(50);
    const ids = (custs ?? []).map((c) => c.id);
    query = ids.length ? query.or(`code.ilike.%${q}%,customer_id.in.(${ids.join(",")})`) : query.ilike("code", `%${q}%`);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(toRow);
}

/** ISO timestamp N days ago (request-time helper for server components). */
export const daysAgoIso = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();
