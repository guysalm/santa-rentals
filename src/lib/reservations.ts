import "server-only";
import { db } from "./supabase/admin";
import { SITE } from "./site";
import { localePath } from "./i18n";
import type { Locale } from "./types";

export interface ReservationDetail {
  id: string;
  code: string;
  kind: "rental" | "tour";
  status: string;
  locale: Locale;
  startAt: string | null;
  endAt: string | null;
  deliveryLocation: string | null;
  notes: string | null;
  pax: number | null;
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  totalCents: number;
  refundedCents: number;
  cancellationFeeCents: number;
  depositCents: number;
  paymentIntentId: string | null;
  paymentMethodId: string | null;
  providerCustomerId: string | null;
  depositHoldId: string | null;
  manageToken: string;
  paidAt: string | null;
  createdAt: string;
  customer: { id: string; fullName: string; email: string; phone: string | null; country: string | null };
  affiliate: { id: string; fullName: string; email: string; commissionRate: number } | null;
  tour: { id: string; slug: string; title: string; titleEs: string } | null;
  items: { id: string; modelName: string; modelSlug: string; vehicleLabel: string; priceCents: number }[];
  licensePath: string | null;
  waiverSignedName: string | null;
  adminNotes: string | null;
}

const SELECT = `
  *,
  customer:customers(*),
  affiliate:affiliates(id, full_name, email, commission_rate),
  tour:tours(id, slug, content),
  items:reservation_items(id, price_cents, model:vehicle_models(brand, name, slug), vehicle:vehicles(label))
`;

/* eslint-disable @typescript-eslint/no-explicit-any */
function map(r: any): ReservationDetail {
  return {
    id: r.id,
    code: r.code,
    kind: r.kind,
    status: r.status,
    locale: r.locale === "es" ? "es" : "en",
    startAt: r.start_at,
    endAt: r.end_at,
    deliveryLocation: r.delivery_location,
    notes: r.notes,
    pax: r.pax,
    subtotalCents: r.subtotal_cents,
    discountCents: r.discount_cents,
    taxCents: r.tax_cents,
    totalCents: r.total_cents,
    refundedCents: r.refunded_cents,
    cancellationFeeCents: r.cancellation_fee_cents,
    depositCents: r.deposit_cents,
    paymentIntentId: r.payment_intent_id,
    paymentMethodId: r.payment_method_id,
    providerCustomerId: r.provider_customer_id,
    depositHoldId: r.deposit_hold_id,
    manageToken: r.manage_token,
    paidAt: r.paid_at,
    createdAt: r.created_at,
    customer: { id: r.customer.id, fullName: r.customer.full_name, email: r.customer.email, phone: r.customer.phone, country: r.customer.country },
    affiliate: r.affiliate
      ? { id: r.affiliate.id, fullName: r.affiliate.full_name, email: r.affiliate.email, commissionRate: Number(r.affiliate.commission_rate) }
      : null,
    tour: r.tour ? { id: r.tour.id, slug: r.tour.slug, title: r.tour.content?.en?.title ?? r.tour.slug, titleEs: r.tour.content?.es?.title ?? r.tour.slug } : null,
    items: (r.items ?? []).map((i: any) => ({
      id: i.id,
      modelName: `${i.model.brand} ${i.model.name}`,
      modelSlug: i.model.slug,
      vehicleLabel: i.vehicle.label,
      priceCents: i.price_cents,
    })),
    licensePath: r.license_path,
    waiverSignedName: r.waiver_signed_name,
    adminNotes: r.admin_notes,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function getReservation(by: { id?: string; token?: string; sessionId?: string; code?: string }) {
  let q = db().from("reservations").select(SELECT);
  if (by.id) q = q.eq("id", by.id);
  else if (by.token) q = q.eq("manage_token", by.token);
  else if (by.sessionId) q = q.eq("checkout_session_id", by.sessionId);
  else if (by.code) q = q.eq("code", by.code.toUpperCase());
  else return null;
  const { data, error } = await q.maybeSingle();
  if (error) throw error;
  return data ? map(data) : null;
}

/** Short human summary, e.g. "2 × Honda TRX420 Rancher" or the tour title. */
export function reservationTitle(r: ReservationDetail, lang: Locale = r.locale) {
  if (r.kind === "tour") return `${lang === "es" ? r.tour?.titleEs : r.tour?.title} · ${r.pax} pax`;
  const counts = new Map<string, number>();
  r.items.forEach((i) => counts.set(i.modelName, (counts.get(i.modelName) ?? 0) + 1));
  return [...counts].map(([name, n]) => `${n} × ${name}`).join(", ");
}

export const manageUrl = (r: Pick<ReservationDetail, "locale" | "manageToken">) =>
  `${SITE.url}${localePath(r.locale, `/manage/${r.manageToken}`)}`;

/** Format a timestamp in Costa Rica time. */
export function crTime(iso: string | null, lang: Locale = "en") {
  if (!iso) return "—";
  return new Intl.DateTimeFormat(lang === "es" ? "es-CR" : "en-US", {
    timeZone: SITE.timeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}
