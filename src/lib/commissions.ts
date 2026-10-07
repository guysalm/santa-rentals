import "server-only";
import { db } from "./supabase/admin";
import { commissionCents } from "./policy";
import { SITE } from "./site";
import { sendEmail } from "./email/send";
import {
  adminWeeklyPayoutsEmail,
  agentDealEmail,
  agentPayoutPaidEmail,
  agentWeeklyStatementEmail,
  type Balance,
  type PayoutSummaryRow,
} from "./email/templates";
import { crTime, reservationTitle, type ReservationDetail } from "./reservations";
import { adminRecipients } from "./notify";
import type { Locale } from "./types";

const dashboardUrl = () => `${SITE.url}/agent`;

export async function getBalance(affiliateId: string): Promise<Balance> {
  const { data, error } = await db().rpc("affiliate_balance", { p_affiliate: affiliateId });
  if (error) throw error;
  const b = data[0];
  return { pendingCents: b?.pending_cents ?? 0, earnedCents: b?.earned_cents ?? 0, paidCents: b?.paid_cents ?? 0 };
}

/**
 * Records the finder's fee for a paid booking and emails the agent the deal
 * plus their running balance. Idempotent (one commission per reservation).
 */
export async function recordCommission(r: ReservationDetail) {
  if (!r.affiliate) return;
  const { data: aff } = await db().from("affiliates").select("id, full_name, email, commission_rate, locale").eq("id", r.affiliate.id).single();
  if (!aff) return;
  const base = r.subtotalCents - r.discountCents; // pre-tax amount actually paid
  const rate = Number(aff.commission_rate);
  const amount = commissionCents(base, rate);

  const { data: inserted, error } = await db()
    .from("commissions")
    .upsert({ reservation_id: r.id, affiliate_id: aff.id, base_cents: base, rate, amount_cents: amount }, { onConflict: "reservation_id", ignoreDuplicates: true })
    .select("id");
  if (error) throw error;
  if (!inserted?.length) return; // already recorded (webhook retry)

  const balance = await getBalance(aff.id);
  const { subject, html } = agentDealEmail({
    lang: aff.locale as Locale,
    agentName: aff.full_name,
    r,
    baseCents: base,
    rate,
    amountCents: amount,
    balance,
    dashboardUrl: dashboardUrl(),
  });
  await sendEmail({ to: aff.email, subject, html });
}

/** Cancelled booking → the agent earns nothing. Paid commissions are never clawed back automatically. */
export async function voidCommission(reservationId: string) {
  await db().from("commissions").update({ status: "void" }).eq("reservation_id", reservationId).in("status", ["pending", "earned"]).is("payout_id", null);
}

/** Daily: complete finished bookings and release their commissions. */
export async function runDailyCommissionJob() {
  const { data: completed } = await db().rpc("complete_finished_reservations");
  const { data: earned } = await db().rpc("mark_commissions_earned");
  return { completed: completed ?? 0, earned: earned ?? 0 };
}

const fmtDay = (d: Date, lang: Locale) =>
  new Intl.DateTimeFormat(lang === "es" ? "es-CR" : "en-US", { day: "numeric", month: "short", timeZone: SITE.timeZone }).format(d);

/**
 * Monday job: batch earned commissions into payouts, email every active agent a
 * statement with their balance, and email admins the balance sheet + CSV.
 */
export async function runWeeklyPayoutJob(now = new Date()) {
  await runDailyCommissionJob();
  const periodEnd = new Date(now.getTime() - 6 * 3_600_000).toISOString().slice(0, 10); // CR date
  const periodStart = new Date(new Date(`${periodEnd}T12:00:00Z`).getTime() - 7 * 86_400_000);
  const label = (lang: Locale) => `${fmtDay(periodStart, lang)} – ${fmtDay(new Date(`${periodEnd}T12:00:00Z`), lang)}`;

  const { data: batches, error } = await db().rpc("build_weekly_payouts", { p_period_end: periodEnd });
  if (error) throw error;

  const { data: agents } = await db()
    .from("affiliates")
    .select("id, full_name, email, phone, locale, payout_method, payout_details")
    .eq("status", "approved");

  const summary: PayoutSummaryRow[] = [];
  for (const agent of agents ?? []) {
    const batch = batches.find((b) => b.affiliate_id === agent.id);
    const lang = agent.locale as Locale;
    let lines: { code: string; title: string; date: string; amountCents: number }[] = [];
    if (batch) {
      const { data: comms } = await db()
        .from("commissions")
        .select("amount_cents, reservation:reservations(id, code, kind, start_at, pax, tour:tours(content), items:reservation_items(model:vehicle_models(brand, name)))")
        .eq("payout_id", batch.payout_id);
      lines = (comms ?? []).map((c) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const r = c.reservation as any;
        const title =
          r.kind === "tour"
            ? `${r.tour?.content?.[lang]?.title ?? "Tour"} (${r.pax})`
            : // eslint-disable-next-line @typescript-eslint/no-explicit-any
              [...new Set((r.items ?? []).map((i: any) => `${i.model.brand} ${i.model.name}`))].join(", ");
        return { code: r.code, title, date: crTime(r.start_at, lang), amountCents: c.amount_cents };
      });
      summary.push({
        name: agent.full_name,
        email: agent.email,
        phone: agent.phone,
        method: agent.payout_method,
        details: agent.payout_details ?? "",
        bookings: batch.commission_count,
        amountCents: batch.amount_cents,
      });
    }
    const balance = await getBalance(agent.id);
    const { subject, html } = agentWeeklyStatementEmail({
      lang,
      agentName: agent.full_name,
      periodLabel: label(lang),
      lines,
      totalCents: batch?.amount_cents ?? 0,
      balance,
      dashboardUrl: dashboardUrl(),
    });
    await sendEmail({ to: agent.email, subject, html });
  }

  const csv = toCsv([
    ["Agent", "Email", "Phone", "Method", "Payout details", "Bookings", "Amount USD"],
    ...summary.map((r) => [r.name, r.email, r.phone, r.method, r.details, String(r.bookings), (r.amountCents / 100).toFixed(2)]),
  ]);
  const { subject, html } = adminWeeklyPayoutsEmail({ periodLabel: label("en"), rows: summary, adminUrl: `${SITE.url}/admin/payouts` });
  await sendEmail({
    to: await adminRecipients(),
    subject,
    html,
    attachments: [{ filename: `santa-payouts-${periodEnd}.csv`, content: Buffer.from(csv, "utf8") }],
  });

  return { periodEnd, payouts: summary.length, totalCents: summary.reduce((s, r) => s + r.amountCents, 0), agentsEmailed: agents?.length ?? 0 };
}

export async function markPayoutPaid(payoutId: string, reference: string) {
  const { error } = await db().rpc("mark_payout_paid", { p_payout: payoutId, p_reference: reference });
  if (error) throw error;
  const { data: p } = await db()
    .from("payouts")
    .select("amount_cents, period_start, period_end, affiliate:affiliates(full_name, email, locale, payout_method)")
    .eq("id", payoutId)
    .single();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = p?.affiliate as any;
  if (!p || !a) return;
  const lang = a.locale as Locale;
  const { subject, html } = agentPayoutPaidEmail({
    lang,
    agentName: a.full_name,
    amountCents: p.amount_cents,
    reference,
    method: a.payout_method === "sinpe" ? "SINPE Móvil" : a.payout_method,
    periodLabel: `${p.period_start} → ${p.period_end}`,
  });
  await sendEmail({ to: a.email, subject, html });
}

export function toCsv(rows: string[][]) {
  return rows.map((r) => r.map((c) => (/[",\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)).join(",")).join("\r\n");
}

export { reservationTitle };
