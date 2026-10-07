import "server-only";
import { z } from "zod";
import { getModels, getSeasons, getSettings, getTour } from "./catalog";
import { getAffiliateById } from "./affiliate";
import { localePath } from "./i18n";
import { payments, type CheckoutLine } from "./payments";
import { quoteRental, quoteTour, rentalPeriod, unitPriceCents, type Quote } from "./pricing";
import { SITE } from "./site";
import { db } from "./supabase/admin";
import { WAIVER_VERSION } from "@/content/pages";

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

const customerSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.email().max(200),
  phone: z.string().trim().min(6).max(40),
  country: z.string().trim().max(60).optional().default(""),
});

export const bookingSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("rental"),
    locale: z.enum(["en", "es"]),
    date: z.string().regex(DATE),
    time: z.string().regex(HHMM),
    mode: z.enum(["8h", "days"]),
    days: z.coerce.number().int().min(1).max(30),
    items: z.array(z.object({ slug: z.string().max(80), qty: z.coerce.number().int().min(0).max(10) })).max(20),
    delivery: z.string().trim().min(3).max(300),
    customer: customerSchema,
    notes: z.string().trim().max(1000).optional().default(""),
    waiverName: z.string().trim().min(2).max(120),
    waiverAccepted: z.literal(true),
  }),
  z.object({
    kind: z.literal("tour"),
    locale: z.enum(["en", "es"]),
    tour: z.string().max(80),
    date: z.string().regex(DATE),
    pax: z.coerce.number().int().min(1).max(20),
    customer: customerSchema,
    notes: z.string().trim().max(1000).optional().default(""),
    waiverName: z.string().trim().min(2).max(120),
    waiverAccepted: z.literal(true),
  }),
]);
export type BookingInput = z.infer<typeof bookingSchema>;

export class BookingError extends Error {
  constructor(
    public code: "INVALID" | "SOLD_OUT" | "TOUR_FULL" | "TOUR_NOT_RUNNING" | "TOUR_CLOSED" | "PAST" | "LICENSE_REQUIRED" | "UNAVAILABLE",
    message: string,
  ) {
    super(message);
  }
}

/** Today's date in Costa Rica as YYYY-MM-DD. */
export const crToday = () => new Date(Date.now() - 6 * 3_600_000).toISOString().slice(0, 10);

// supabase gen types marks every SQL function argument non-null; these are nullable.
const nullable = <T>(v: T | null) => v as T;

const CHECKOUT_MINUTES = 30; // Stripe minimum session lifetime

export async function createBooking(input: BookingInput, opts: { affiliateId?: string | null; license?: File | null }) {
  const [settings, seasons, models] = await Promise.all([getSettings(), getSeasons(), getModels()]);
  if (input.date < crToday()) throw new BookingError("PAST", "Date is in the past");

  const affiliate = await getAffiliateById(opts.affiliateId);
  const discountPct = affiliate?.customerDiscount ?? 0;

  let quote: Quote;
  let lineName: string;
  let rentalPayload: { start: Date; end: Date; items: { model_id: string; qty: number; unit_price_cents: number }[] } | null = null;
  let tourId: string | null = null;

  if (input.kind === "rental") {
    if (input.time < settings.earliestPickup || input.time > settings.latestPickup) throw new BookingError("INVALID", "Pickup time outside opening hours");
    const chosen = input.items
      .filter((i) => i.qty > 0)
      .map((i) => ({ model: models.find((m) => m.slug === i.slug), qty: i.qty }))
      .filter((i): i is { model: (typeof models)[number]; qty: number } => Boolean(i.model));
    if (!chosen.length) throw new BookingError("INVALID", "Choose at least one vehicle");
    const sel = { date: input.date, time: input.time, mode: input.mode, days: input.days };
    const { start, end } = rentalPeriod(sel);
    if (start.getTime() < Date.now()) throw new BookingError("PAST", "Pickup time has passed");
    quote = quoteRental(chosen, sel, seasons, discountPct);
    rentalPayload = {
      start,
      end,
      items: chosen.map((c) => ({ model_id: c.model.id, qty: c.qty, unit_price_cents: unitPriceCents(c.model, sel, seasons) })),
    };
    lineName = quote.lines.map((l) => l.label).join(", ");
    if (!opts.license) throw new BookingError("LICENSE_REQUIRED", "Driver's license photo is required");
  } else {
    const tour = await getTour(input.tour);
    if (!tour) throw new BookingError("INVALID", "Unknown tour");
    if (input.pax < tour.minPax || input.pax > tour.maxPax) throw new BookingError("INVALID", `Group size must be ${tour.minPax}–${tour.maxPax}`);
    quote = quoteTour(tour, input.pax, discountPct);
    tourId = tour.id;
    lineName = `${tour.content[input.locale].title} — ${input.pax} pax`;
  }

  // Customer (email is the identity; latest details win).
  const { data: customer, error: custErr } = await db()
    .from("customers")
    .upsert(
      { email: input.customer.email.toLowerCase(), full_name: input.customer.fullName, phone: input.customer.phone, country: input.customer.country || null },
      { onConflict: "email" },
    )
    .select("id")
    .single();
  if (custErr) throw custErr;

  const licensePath = opts.license ? await uploadLicense(opts.license) : null;
  const expiresAt = new Date(Date.now() + (CHECKOUT_MINUTES + 5) * 60_000);

  const common = {
    p_customer: customer.id,
    p_affiliate: nullable(affiliate?.id ?? null),
    p_locale: input.locale,
    p_subtotal: quote.subtotalCents,
    p_discount: quote.discountCents,
    p_tax: quote.taxCents,
    p_total: quote.totalCents,
    p_notes: nullable(input.notes || null),
    p_waiver_version: WAIVER_VERSION,
    p_waiver_name: input.waiverName,
    p_license_path: nullable(licensePath),
    p_expires_at: expiresAt.toISOString(),
  };

  const { data, error } =
    input.kind === "rental" && rentalPayload
      ? await db().rpc("create_rental_hold", {
          ...common,
          p_start: rentalPayload.start.toISOString(),
          p_end: rentalPayload.end.toISOString(),
          p_buffer_hours: settings.bufferHours,
          p_items: rentalPayload.items,
          p_deposit: quote.depositCents,
          p_delivery: input.delivery,
        })
      : await db().rpc("create_tour_hold", {
          ...common,
          p_tour: tourId!,
          p_date: input.date,
          p_pax: input.kind === "tour" ? input.pax : 0,
        });

  if (error) {
    const m = /(SOLD_OUT|TOUR_FULL|TOUR_NOT_RUNNING|TOUR_CLOSED|TOUR_NOT_FOUND)/.exec(error.message);
    if (m) throw new BookingError(m[1] === "TOUR_NOT_FOUND" ? "INVALID" : (m[1] as BookingError["code"]), error.message);
    throw error;
  }
  const hold = data[0];

  const lines: CheckoutLine[] = [
    {
      name: `Santa Rentals ${hold.code}`,
      description: `${lineName}${quote.discountCents ? ` (−${quote.discountPct}% agent discount)` : ""}`,
      amountCents: quote.subtotalCents - quote.discountCents,
      quantity: 1,
    },
    { name: "IVA 13%", amountCents: quote.taxCents, quantity: 1 },
  ].filter((l) => l.amountCents > 0);

  try {
    const checkout = await payments().createCheckout({
      kind: "reservation",
      referenceId: hold.reservation_id,
      customerEmail: input.customer.email,
      lines,
      successUrl: `${SITE.url}${localePath(input.locale, "/book/success")}?session_id={SESSION_ID}`,
      cancelUrl: `${SITE.url}${localePath(input.locale, "/book")}?released=${hold.manage_token}`,
      expiresAt: new Date(Date.now() + CHECKOUT_MINUTES * 60_000 + 30_000),
      locale: input.locale,
      saveCardForDeposit: input.kind === "rental",
    });
    await db().from("reservations").update({ checkout_session_id: checkout.sessionId, payment_provider: payments().name }).eq("id", hold.reservation_id);
    return { url: checkout.url, code: hold.code };
  } catch (err) {
    // Release the hold so inventory isn't blocked by a failed checkout.
    await db().from("reservations").update({ status: "expired" }).eq("id", hold.reservation_id);
    throw err;
  }
}

async function uploadLicense(file: File) {
  if (file.size > 6 * 1024 * 1024) throw new BookingError("INVALID", "License image is too large (max 6 MB)");
  if (!/^image\/(jpeg|png|webp|heic|heif)$/.test(file.type)) throw new BookingError("INVALID", "License must be an image");
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID()}.${ext}`;
  const { error } = await db().storage.from("licenses").upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  return path;
}

/** Customer abandoned checkout — free the inventory now instead of waiting for expiry. */
export async function releaseHold(token: string) {
  await db().from("reservations").update({ status: "expired" }).eq("manage_token", token).eq("status", "pending_payment");
}
