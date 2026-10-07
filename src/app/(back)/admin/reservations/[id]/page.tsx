import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { requireStaff } from "@/lib/auth";
import { getSettings } from "@/lib/catalog";
import { cancellationOutcome } from "@/lib/policy";
import { crTime, getReservation, reservationTitle } from "@/lib/reservations";
import { waTo } from "@/lib/site";
import { formatUSD } from "@/lib/money";
import { db } from "@/lib/supabase/admin";
import { ActionButton, Badge, Money, Skeleton } from "@/components/admin/ui";
import { cancelAsStaff, captureDeposit, licenseUrl, placeDeposit, releaseDeposit, saveNotes, setStatus } from "../../_actions/reservations";

export const metadata: Metadata = { title: "Reservation" };

export default function ReservationPage({ params }: PageProps<"/admin/reservations/[id]">) {
  return (
    <Suspense fallback={<Skeleton />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const r = await getReservation({ id });
  if (!r) notFound();
  await connection();
  const settings = await getSettings();
  const [license, commission] = await Promise.all([
    r.licensePath ? licenseUrl(r.licensePath) : null,
    db().from("commissions").select("amount_cents, rate, status").eq("reservation_id", r.id).maybeSingle(),
  ]);
  const policy = r.status === "paid" && r.startAt ? cancellationOutcome(r.totalCents, new Date(r.startAt), new Date(), settings.cancellation) : null;
  const hidden = <input type="hidden" name="id" value={r.id} />;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/admin/reservations" className="text-sm text-muted hover:text-cyan">
          ← Reservations
        </Link>
        <h1 className="hud-money text-5xl">{r.code}</h1>
        <Badge value={r.status} />
        <span className="text-sm text-muted">
          {r.kind} · booked {crTime(r.createdAt)} · {r.locale.toUpperCase()}
        </span>
      </div>

      {r.adminNotes?.includes("⚠") && <p className="border-2 border-pink bg-pink/10 p-4">{r.adminNotes}</p>}

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="panel p-6 xl:col-span-2">
          <h2 className="mb-4 text-3xl text-cyan">{reservationTitle(r, "en")}</h2>
          <dl className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
            {[
              ["Start", crTime(r.startAt)],
              ["End", crTime(r.endAt)],
              ["Delivery", r.deliveryLocation ?? "—"],
              ["Units", r.items.map((i) => i.vehicleLabel).join(", ") || "—"],
              ["Waiver signed", r.waiverSignedName ?? "—"],
              ["Agent", r.affiliate ? `${r.affiliate.fullName}${commission.data ? ` · ${formatUSD(commission.data.amount_cents, { decimals: true })} (${commission.data.rate}%, ${commission.data.status})` : ""}` : "—"],
              ["Customer notes", r.notes ?? "—"],
            ].map(([k, v]) => (
              <div key={k} className="border-b border-white/10 pb-1">
                <dt className="text-xs uppercase tracking-widest text-muted">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="panel p-6">
          <h2 className="mb-3 text-2xl text-sun">Customer</h2>
          <p className="font-semibold">{r.customer.fullName}</p>
          <p className="text-sm">
            <a href={`mailto:${r.customer.email}`} className="text-cyan">
              {r.customer.email}
            </a>
          </p>
          {r.customer.phone && (
            <p className="text-sm">
              <a href={waTo(r.customer.phone, `Hi ${r.customer.fullName.split(" ")[0]}! Santa Rentals here about booking ${r.code}.`)} className="text-mint">
                WhatsApp {r.customer.phone}
              </a>
            </p>
          )}
          {r.customer.country && <p className="text-sm text-muted">{r.customer.country}</p>}
          {license ? (
            <a href={license} target="_blank" rel="noopener" className="mt-4 block">
              {/* eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL */}
              <img src={license} alt="Driver's license" className="max-h-48 border-2 border-white object-contain" />
              <span className="text-xs text-cyan">Open license (link valid 5 min)</span>
            </a>
          ) : (
            <p className="mt-4 text-xs text-muted">No license uploaded</p>
          )}
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="panel p-6">
          <h2 className="mb-3 text-2xl text-sun">Money</h2>
          <dl className="space-y-1 text-sm">
            {[
              ["Subtotal", r.subtotalCents],
              ["Agent discount", -r.discountCents],
              ["IVA", r.taxCents],
              ["Total paid", r.totalCents],
              ["Refunded", -r.refundedCents],
              ["Cancellation fee kept", r.cancellationFeeCents],
            ].map(([k, v]) => (
              <div key={k as string} className="flex justify-between">
                <dt className="text-muted">{k}</dt>
                <dd>
                  <Money cents={v as number} />
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs text-muted">
            Provider: {r.paymentIntentId ? `${r.paymentIntentId.slice(0, 18)}…` : "offline / cash"}
          </p>
        </section>

        <section className="panel p-6">
          <h2 className="mb-3 text-2xl text-sun">Security deposit</h2>
          <p className="text-sm text-muted">
            Amount: <Money cents={r.depositCents} /> · {r.depositHoldId ? <span className="text-mint">hold active</span> : "no hold"}
          </p>
          {!r.depositHoldId && ["paid", "active"].includes(r.status) && r.depositCents > 0 && (
            <form action={placeDeposit} className="mt-3">
              {hidden}
              <ActionButton variant="sun" disabled={!r.paymentMethodId} confirm={`Authorize ${formatUSD(r.depositCents)} on the customer's card?`}>
                Place card hold
              </ActionButton>
              {!r.paymentMethodId && <p className="mt-2 text-xs text-muted">No saved card (walk-in) — take the deposit in cash.</p>}
              <p className="mt-2 text-xs text-muted">Card holds expire after ~7 days; for longer rentals re-place weekly.</p>
            </form>
          )}
          {r.depositHoldId && (
            <div className="mt-3 space-y-3">
              <form action={releaseDeposit}>
                {hidden}
                <ActionButton variant="ghost">Release hold (no damage)</ActionButton>
              </form>
              <form action={captureDeposit} className="flex flex-wrap items-end gap-2">
                {hidden}
                <input name="amount" type="number" step="0.01" min="1" max={r.depositCents / 100} placeholder="USD" className="field !w-24" required />
                <input name="reason" placeholder="damage / fuel / fine" className="field !w-40" />
                <ActionButton confirm="Capture this amount from the deposit?">Capture</ActionButton>
              </form>
            </div>
          )}
        </section>

        <section className="panel p-6">
          <h2 className="mb-3 text-2xl text-sun">Actions</h2>
          <div className="flex flex-wrap gap-2">
            {r.status === "paid" && (
              <>
                <form action={setStatus}>
                  {hidden}
                  <input type="hidden" name="status" value="active" />
                  <ActionButton>✓ Delivered / started</ActionButton>
                </form>
                <form action={setStatus}>
                  {hidden}
                  <input type="hidden" name="status" value="no_show" />
                  <ActionButton variant="ghost" confirm="Mark as no-show? No refund is issued.">
                    No-show
                  </ActionButton>
                </form>
              </>
            )}
            {r.status === "active" && (
              <form action={setStatus}>
                {hidden}
                <input type="hidden" name="status" value="completed" />
                <ActionButton>✓ Returned / completed</ActionButton>
              </form>
            )}
          </div>
          {["paid", "pending_payment", "active"].includes(r.status) && (
            <form action={cancelAsStaff} className="mt-5 space-y-2 border-t border-white/15 pt-4">
              {hidden}
              <p className="text-sm text-muted">
                Cancel booking{policy ? ` — policy now: fee ${formatUSD(policy.feeCents, { decimals: true })}, refund ${formatUSD(policy.refundCents, { decimals: true })}` : ""}
              </p>
              <select name="mode" className="field">
                <option value="policy">Apply cancellation policy (customer request)</option>
                <option value="full">Full refund (weather / our fault)</option>
              </select>
              <input name="reason" placeholder="Reason (internal)" className="field" />
              <ActionButton confirm="Cancel this booking and issue the refund?">Cancel booking</ActionButton>
            </form>
          )}
        </section>
      </div>

      <section className="panel p-6">
        <h2 className="mb-3 text-2xl text-sun">Internal notes</h2>
        <form action={saveNotes} className="space-y-3">
          {hidden}
          <textarea name="notes" defaultValue={r.adminNotes ?? ""} className="field min-h-28 font-mono text-sm" />
          <ActionButton variant="ghost">Save notes</ActionButton>
        </form>
      </section>
    </div>
  );
}
