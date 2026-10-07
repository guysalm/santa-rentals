import "server-only";
import { db } from "./supabase/admin";
import { payments, type PaymentEvent } from "./payments";
import { getReservation, manageUrl, reservationTitle, type ReservationDetail } from "./reservations";
import { recordCommission, voidCommission } from "./commissions";
import { cancellationOutcome } from "./policy";
import { getSettings } from "./catalog";
import { adminRecipients } from "./notify";
import { sendEmail } from "./email/send";
import { adminNewBookingEmail, bookingCancelledEmail, bookingConfirmationEmail } from "./email/templates";
import { buildIcs } from "./ics";
import { SITE } from "./site";

/** Single entry point for normalized payment-provider webhooks. Idempotent. */
export async function handlePaymentEvent(event: PaymentEvent) {
  if (event.type === "ignored") return { ok: true, ignored: event.raw };

  if (event.kind === "tag_fee") {
    if (event.type === "checkout.completed") {
      await db().from("affiliates").update({ tag_fee_paid_at: new Date().toISOString(), tag_fee_session_id: event.sessionId }).eq("id", event.referenceId).is("tag_fee_paid_at", null);
    }
    return { ok: true };
  }

  if (event.type === "checkout.expired") {
    await db().from("reservations").update({ status: "expired" }).eq("id", event.referenceId).eq("status", "pending_payment");
    return { ok: true };
  }

  // checkout.completed for a reservation
  const { data: current } = await db().from("reservations").select("id, status").eq("id", event.referenceId).maybeSingle();
  if (!current) throw new Error(`Reservation ${event.referenceId} not found`);
  if (["paid", "active", "completed"].includes(current.status)) return { ok: true, duplicate: true };

  const paidFields = {
    status: "paid" as const,
    paid_at: new Date().toISOString(),
    payment_intent_id: event.paymentIntentId,
    payment_method_id: event.paymentMethodId,
    provider_customer_id: event.providerCustomerId,
    checkout_session_id: event.sessionId,
  };
  const { error } = await db().from("reservations").update(paidFields).eq("id", event.referenceId);
  if (error) {
    // Hold expired and its unit was re-booked before payment landed (exclusion
    // violation). Keep the money recorded and alert staff to reassign a unit.
    await db()
      .from("reservations")
      // Status stays as-is (expired) so the items don't re-block inventory.
      .update({ ...paidFields, status: current.status, admin_notes: `⚠ PAID AFTER HOLD EXPIRED — reassign unit manually (${error.message})` })
      .eq("id", event.referenceId);
    await sendEmail({
      to: await adminRecipients(),
      subject: `⚠ Payment received for expired hold ${event.referenceId}`,
      html: `<p>Payment ${event.paymentIntentId} landed after the inventory hold expired and the unit was re-booked. Open the reservation in admin and assign another unit or refund.</p>`,
    });
    return { ok: true, conflict: true };
  }

  const r = await getReservation({ id: event.referenceId });
  if (!r) return { ok: true };
  await Promise.all([sendConfirmation(r), notifyAdmins(r), recordCommission(r).catch((e) => console.error("[commission]", e))]);
  return { ok: true };
}

async function sendConfirmation(r: ReservationDetail) {
  const { subject, html } = bookingConfirmationEmail(r);
  const attachments =
    r.startAt && r.endAt
      ? [
          {
            filename: `santa-${r.code}.ics`,
            content: Buffer.from(
              buildIcs({
                uid: r.id,
                start: new Date(r.startAt),
                end: new Date(r.endAt),
                summary: `Santa Rentals — ${reservationTitle(r)}`,
                description: `Booking ${r.code}. Manage: ${manageUrl(r)}`,
                location: r.deliveryLocation ?? `${SITE.address.locality}, Costa Rica`,
                url: manageUrl(r),
              }),
            ),
            contentType: "text/calendar",
          },
        ]
      : undefined;
  await sendEmail({ to: r.customer.email, subject, html, attachments, replyTo: SITE.email });
}

async function notifyAdmins(r: ReservationDetail) {
  const { subject, html } = adminNewBookingEmail(r, `${SITE.url}/admin/reservations/${r.id}`);
  await sendEmail({ to: await adminRecipients(), subject, html, replyTo: r.customer.email });
}

/**
 * Cancel a paid booking. Customer cancellations apply the fee tiers; staff can
 * waive the fee (weather/operator cancellation) with `fullRefund`.
 */
export async function cancelReservation(r: ReservationDetail, opts: { by: "customer" | "staff"; fullRefund?: boolean; reason?: string }) {
  if (!["paid", "active", "pending_payment"].includes(r.status)) throw new Error(`Cannot cancel a ${r.status} booking`);
  if (r.status === "active" && opts.by === "customer") throw new Error("Rental already started");

  let feeCents = 0;
  let refundCents = 0;
  if (r.status !== "pending_payment") {
    const settings = await getSettings();
    const outcome = opts.fullRefund
      ? { feeCents: 0, refundCents: r.totalCents }
      : cancellationOutcome(r.totalCents, new Date(r.startAt ?? Date.now()), new Date(), settings.cancellation);
    feeCents = outcome.feeCents;
    refundCents = outcome.refundCents;
    if (refundCents > 0 && r.paymentIntentId) {
      await payments().refund(r.paymentIntentId, refundCents, `${r.code} cancelled by ${opts.by}${opts.reason ? `: ${opts.reason}` : ""}`);
    }
    if (r.depositHoldId) await payments().releaseHold(r.depositHoldId).catch(() => {});
  }

  await db()
    .from("reservations")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      cancel_reason: `${opts.by}${opts.reason ? `: ${opts.reason}` : ""}`,
      cancellation_fee_cents: feeCents,
      refunded_cents: r.refundedCents + refundCents,
    })
    .eq("id", r.id);
  await voidCommission(r.id);

  if (r.status !== "pending_payment") {
    const { subject, html } = bookingCancelledEmail(r, feeCents, refundCents);
    await sendEmail({ to: r.customer.email, subject, html });
    await sendEmail({
      to: await adminRecipients(),
      subject: `Booking ${r.code} cancelled by ${opts.by} — refund ${(refundCents / 100).toFixed(2)}, fee kept ${(feeCents / 100).toFixed(2)}`,
      html: `<p>${reservationTitle(r, "en")} · ${r.customer.fullName}</p>`,
    });
  }
  return { feeCents, refundCents };
}
