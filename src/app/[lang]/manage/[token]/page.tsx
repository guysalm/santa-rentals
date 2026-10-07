import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { getSettings } from "@/lib/catalog";
import { isLocale } from "@/lib/i18n";
import { formatUSD } from "@/lib/money";
import { cancellationOutcome } from "@/lib/policy";
import { crTime, getReservation, reservationTitle } from "@/lib/reservations";
import { waLink } from "@/lib/site";
import type { Locale } from "@/lib/types";
import { CancelBooking } from "@/components/booking/CancelBooking";

export const metadata: Metadata = { title: "Your booking | Santa Rentals", robots: { index: false, follow: false } };

const COPY = {
  en: {
    title: "Your booking",
    status: { paid: "Confirmed", active: "In progress", completed: "Completed", cancelled: "Cancelled", pending_payment: "Awaiting payment", expired: "Expired", no_show: "No-show" } as Record<string, string>,
    code: "Code",
    start: "Start",
    end: "Return",
    delivery: "Delivery",
    total: "Paid",
    refunded: "Refunded",
    fee: "Cancellation fee",
    cancelTitle: "Need to cancel?",
    cancelPreview: (fee: string, refund: string) => `If you cancel now, a ${fee} cancellation fee applies and ${refund} will be refunded to your card.`,
    cancelFree: (refund: string) => `If you cancel now, ${refund} will be refunded to your card.`,
    change: "Want to change dates or vehicles instead? Message us on WhatsApp — changes are free subject to availability.",
    whatsapp: "WhatsApp us",
  },
  es: {
    title: "Tu reserva",
    status: { paid: "Confirmada", active: "En curso", completed: "Completada", cancelled: "Cancelada", pending_payment: "Pago pendiente", expired: "Expirada", no_show: "No se presentó" } as Record<string, string>,
    code: "Código",
    start: "Inicio",
    end: "Devolución",
    delivery: "Entrega",
    total: "Pagado",
    refunded: "Reembolsado",
    fee: "Cargo por cancelación",
    cancelTitle: "¿Necesitas cancelar?",
    cancelPreview: (fee: string, refund: string) => `Si cancelas ahora, se aplica un cargo de ${fee} y se reembolsarán ${refund} a tu tarjeta.`,
    cancelFree: (refund: string) => `Si cancelas ahora, se reembolsarán ${refund} a tu tarjeta.`,
    change: "¿Prefieres cambiar fechas o vehículos? Escríbenos por WhatsApp — los cambios son gratis según disponibilidad.",
    whatsapp: "Escríbenos",
  },
};

export default function ManagePage({ params }: PageProps<"/[lang]/manage/[token]">) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Suspense fallback={<div className="panel h-64 animate-pulse" />}>
        <Manage params={params} />
      </Suspense>
    </div>
  );
}

async function Manage({ params }: { params: Promise<{ lang: string; token: string }> }) {
  const { lang: raw, token } = await params;
  if (!isLocale(raw) || !/^[0-9a-f]{36}$/.test(token)) notFound();
  const lang: Locale = raw;
  const r = await getReservation({ token });
  if (!r) notFound();
  const c = COPY[lang];
  const settings = await getSettings();
  await connection(); // cancellation preview depends on the current time
  const cancellable = r.status === "paid";
  const outcome = cancellable && r.startAt ? cancellationOutcome(r.totalCents, new Date(r.startAt), new Date(), settings.cancellation) : null;
  const money = (n: number) => formatUSD(n, { decimals: true });

  return (
    <>
      <h1 className="text-6xl">
        <span className="sunset-text">{c.title}</span>
      </h1>
      <div className="panel mt-8 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="hud-money text-4xl">{r.code}</p>
          <span className={`chip ${r.status === "cancelled" ? "text-pink" : "text-mint"}`}>{c.status[r.status] ?? r.status}</span>
        </div>
        <p className="mt-4 font-display text-3xl tracking-wide">{reservationTitle(r, lang)}</p>
        <dl className="mt-4 space-y-2 text-sm">
          {[
            [c.start, crTime(r.startAt, lang)],
            ...(r.kind === "rental" ? [[c.end, crTime(r.endAt, lang)]] : []),
            ...(r.deliveryLocation ? [[c.delivery, r.deliveryLocation]] : []),
            [c.total, money(r.totalCents)],
            ...(r.refundedCents ? [[c.refunded, money(r.refundedCents)]] : []),
            ...(r.cancellationFeeCents ? [[c.fee, money(r.cancellationFeeCents)]] : []),
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 border-b border-white/10 pb-2">
              <dt className="text-muted">{k}</dt>
              <dd className="text-right">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      {outcome && (
        <section className="panel panel-cyan mt-8 p-6">
          <h2 className="text-3xl text-cyan">{c.cancelTitle}</h2>
          <p className="mt-3 text-muted">{outcome.feeCents > 0 ? c.cancelPreview(money(outcome.feeCents), money(outcome.refundCents)) : c.cancelFree(money(outcome.refundCents))}</p>
          <p className="mt-3 text-sm text-muted">{c.change}</p>
          <div className="mt-6 flex flex-wrap gap-4">
            <CancelBooking token={token} lang={lang} />
            <a href={waLink(`Booking ${r.code}`)} rel="noopener" className="btn btn-ghost">
              {c.whatsapp}
            </a>
          </div>
        </section>
      )}
    </>
  );
}
