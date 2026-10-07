import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getDictionary, resolveLang } from "@/dictionaries";
import { localePath } from "@/lib/i18n";
import { formatUSD } from "@/lib/money";
import { crTime, getReservation, reservationTitle } from "@/lib/reservations";
import { waLink } from "@/lib/site";
import type { Locale } from "@/lib/types";
import { AutoRefresh } from "@/components/booking/AutoRefresh";

export const metadata: Metadata = { title: "Mission passed | Santa Rentals", robots: { index: false, follow: false } };

const COPY = {
  en: {
    passed: "Mission passed!",
    respect: "Respect +",
    confirmed: "Your booking is confirmed. A confirmation email with all the details is on its way.",
    processing: "Finalizing your payment…",
    processingText: "This usually takes a few seconds. Don't close this page.",
    notFound: "We couldn't find that booking. If you were charged, message us on WhatsApp with your email address.",
    code: "Booking code",
    manage: "Manage booking",
    more: "Explore tours",
  },
  es: {
    passed: "¡Misión cumplida!",
    respect: "Respeto +",
    confirmed: "Tu reserva está confirmada. Te enviamos un correo con todos los detalles.",
    processing: "Finalizando tu pago…",
    processingText: "Normalmente toma unos segundos. No cierres esta página.",
    notFound: "No encontramos esa reserva. Si se hizo el cobro, escríbenos por WhatsApp con tu correo.",
    code: "Código de reserva",
    manage: "Gestionar reserva",
    more: "Ver tours",
  },
};

export default async function SuccessPage({ params, searchParams }: PageProps<"/[lang]/book/success">) {
  const lang = await resolveLang(params);
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <Suspense fallback={<p className="text-muted">…</p>}>
        <Result lang={lang} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Result({ lang, searchParams }: { lang: Locale; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const c = COPY[lang];
  const dict = getDictionary(lang);
  const sessionId = (await searchParams).session_id;
  const r = typeof sessionId === "string" && sessionId.length < 200 ? await getReservation({ sessionId }) : null;

  if (!r) {
    return (
      <div className="panel p-8">
        <p>{c.notFound}</p>
        <a href={waLink()} className="btn btn-ghost mt-6">
          {dict.common.whatsapp}
        </a>
      </div>
    );
  }

  if (r.status === "pending_payment") {
    return (
      <div className="panel p-10">
        <AutoRefresh />
        <h1 className="text-5xl neon-cyan">{c.processing}</h1>
        <p className="mt-4 text-muted">{c.processingText}</p>
      </div>
    );
  }

  return (
    <>
      <p className="font-display text-2xl tracking-[0.3em] text-mint">{c.respect}</p>
      <h1 className="mt-2 font-script text-7xl normal-case neon-pink md:text-8xl">{c.passed}</h1>
      <div className="panel mt-10 p-8 text-left">
        <p className="text-muted">{c.confirmed}</p>
        <dl className="mt-6 space-y-3">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">{c.code}</dt>
            <dd className="hud-money text-3xl">{r.code}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">{reservationTitle(r, lang)}</dt>
            <dd>{crTime(r.startAt, lang)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-white/15 pt-3">
            <dt className="font-display text-2xl">Total</dt>
            <dd className="hud-money text-3xl">{formatUSD(r.totalCents, { decimals: true })}</dd>
          </div>
        </dl>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href={localePath(lang, `/manage/${r.manageToken}`)} className="btn btn-primary">
            {c.manage}
          </Link>
          <Link href={localePath(lang, "/tours")} className="btn btn-ghost">
            {c.more}
          </Link>
        </div>
      </div>
    </>
  );
}
