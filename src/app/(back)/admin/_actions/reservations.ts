"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { cancelReservation } from "@/lib/fulfillment";
import { payments } from "@/lib/payments";
import { getReservation } from "@/lib/reservations";
import { db } from "@/lib/supabase/admin";
import { getModels, getSeasons, getSettings } from "@/lib/catalog";
import { quoteRental, rentalPeriod, unitPriceCents } from "@/lib/pricing";
import { WAIVER_VERSION } from "@/content/pages";

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

async function load(form: FormData) {
  await requireStaff();
  const r = await getReservation({ id: str(form, "id") });
  if (!r) throw new Error("Reservation not found");
  return r;
}

/** Check-in at delivery (active), return (completed) or no-show. */
export async function setStatus(form: FormData) {
  const r = await load(form);
  const status = str(form, "status");
  const allowed: Record<string, string[]> = { paid: ["active", "no_show"], active: ["completed"], pending_payment: [], completed: [], cancelled: [] };
  if (!allowed[r.status]?.includes(status)) throw new Error(`Can't move ${r.status} → ${status}`);
  await db().from("reservations").update({ status: status as "active" | "completed" | "no_show" }).eq("id", r.id);
  refresh();
}

/** Authorize the security deposit on the card saved at checkout. */
export async function placeDeposit(form: FormData) {
  const r = await load(form);
  if (r.depositHoldId) throw new Error("A deposit hold already exists");
  if (!r.providerCustomerId || !r.paymentMethodId) throw new Error("No saved card on this booking — take the deposit another way");
  const { holdId } = await payments().placeHold({
    customerId: r.providerCustomerId,
    paymentMethodId: r.paymentMethodId,
    amountCents: r.depositCents,
    description: `Santa Rentals deposit ${r.code}`,
  });
  await db().from("reservations").update({ deposit_hold_id: holdId }).eq("id", r.id);
  refresh();
}

export async function releaseDeposit(form: FormData) {
  const r = await load(form);
  if (!r.depositHoldId) return;
  await payments().releaseHold(r.depositHoldId);
  await db().from("reservations").update({ deposit_hold_id: null, admin_notes: appendNote(r.adminNotes, "Deposit released") }).eq("id", r.id);
  refresh();
}

/** Capture part or all of the deposit for damage / fuel / fines. */
export async function captureDeposit(form: FormData) {
  const r = await load(form);
  if (!r.depositHoldId) throw new Error("No deposit hold");
  const cents = Math.round(Number(str(form, "amount")) * 100);
  if (!(cents > 0 && cents <= r.depositCents)) throw new Error("Amount must be between 0 and the deposit");
  const reason = str(form, "reason") || "damage";
  await payments().captureHold(r.depositHoldId, cents);
  await db()
    .from("reservations")
    .update({ deposit_hold_id: null, admin_notes: appendNote(r.adminNotes, `Captured $${(cents / 100).toFixed(2)} from deposit: ${reason}`) })
    .eq("id", r.id);
  refresh();
}

export async function cancelAsStaff(form: FormData) {
  const r = await load(form);
  await cancelReservation(r, { by: "staff", fullRefund: str(form, "mode") === "full", reason: str(form, "reason") || undefined });
  refresh();
}

export async function saveNotes(form: FormData) {
  const r = await load(form);
  await db().from("reservations").update({ admin_notes: str(form, "notes") || null }).eq("id", r.id);
  refresh();
}

/** Signed, short-lived URL to view the uploaded license. */
export async function licenseUrl(path: string) {
  await requireStaff();
  const { data } = await db().storage.from("licenses").createSignedUrl(path, 300);
  return data?.signedUrl ?? null;
}

/** Walk-in / phone booking paid in cash or SINPE — no online payment. */
export async function createManualBooking(form: FormData) {
  await requireStaff();
  const [models, seasons, settings] = await Promise.all([getModels(), getSeasons(), getSettings()]);
  const model = models.find((m) => m.slug === str(form, "model"));
  if (!model) throw new Error("Pick a vehicle");
  const qty = Math.max(1, Number(str(form, "qty")) || 1);
  const sel = { date: str(form, "date"), time: str(form, "time") || "09:00", mode: str(form, "mode") === "8h" ? ("8h" as const) : ("days" as const), days: Math.max(1, Number(str(form, "days")) || 1) };
  const { start, end } = rentalPeriod(sel);
  const quote = quoteRental([{ model, qty }], sel, seasons, 0);

  const email = str(form, "email").toLowerCase() || `walkin+${Date.now()}@santa.rentals`;
  const { data: customer, error: cErr } = await db()
    .from("customers")
    .upsert({ email, full_name: str(form, "name") || "Walk-in", phone: str(form, "phone") || null }, { onConflict: "email" })
    .select("id")
    .single();
  if (cErr) throw cErr;

  const { data, error } = await db().rpc("create_rental_hold", {
    p_customer: customer.id,
    p_affiliate: null as unknown as string,
    p_locale: "en",
    p_start: start.toISOString(),
    p_end: end.toISOString(),
    p_buffer_hours: settings.bufferHours,
    p_items: [{ model_id: model.id, qty, unit_price_cents: unitPriceCents(model, sel, seasons) }],
    p_subtotal: quote.subtotalCents,
    p_discount: 0,
    p_tax: quote.taxCents,
    p_total: quote.totalCents,
    p_deposit: quote.depositCents,
    p_delivery: str(form, "delivery") || "Pickup at shop",
    p_notes: str(form, "notes") || (null as unknown as string),
    p_waiver_version: WAIVER_VERSION,
    p_waiver_name: "Signed on paper at shop",
    p_license_path: null as unknown as string,
    p_expires_at: new Date(Date.now() + 3_600_000).toISOString(),
  });
  if (error) throw new Error(/SOLD_OUT/.test(error.message) ? "Not enough units free for those dates" : error.message);
  const id = data[0].reservation_id;
  await db()
    .from("reservations")
    .update({ status: "paid", paid_at: new Date().toISOString(), payment_provider: str(form, "method") || "cash" })
    .eq("id", id);
  redirect(`/admin/reservations/${id}`);
}

function appendNote(existing: string | null, note: string) {
  const line = `[${new Date().toISOString().slice(0, 16).replace("T", " ")}] ${note}`;
  return existing ? `${existing}\n${line}` : line;
}
