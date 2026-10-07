import type { Metadata } from "next";
import Link from "next/link";
import QRCode from "qrcode";
import { Suspense } from "react";
import { requireAgent } from "@/lib/auth";
import { getBalance } from "@/lib/commissions";
import { formatUSD } from "@/lib/money";
import { crTime } from "@/lib/reservations";
import { SITE } from "@/lib/site";
import { db } from "@/lib/supabase/admin";
import { Logo } from "@/components/Logo";
import { Badge, Money, Skeleton, Stat, Table } from "@/components/admin/ui";
import { CopyLink } from "@/components/agent/CopyLink";

export const metadata: Metadata = { title: "Agent dashboard" };

const COPY = {
  en: {
    hi: (n: string) => `Hey ${n} 🌴`,
    link: "Your link (NFC keychain & QR)",
    qr: "QR code — print it or show it on your phone",
    pending: "Pending",
    pendingHint: "Paid bookings not finished yet",
    payable: "Next Monday",
    payableHint: "Earned, paid out by SINPE Móvil",
    paid: "Paid to date",
    scans: "Scans / clicks",
    deals: "Deals",
    rate: (r: number, d: number) => `You earn ${r}% · your guests save ${d}%`,
    bookings: "Your deals",
    payouts: "Payouts",
    head: ["Booking", "Date", "Guest", "Booking value", "Your fee", "Status"],
    payHead: ["Week", "Amount", "Reference", "Status"],
    signout: "Sign out",
    unapproved: "Your application is being reviewed — we'll WhatsApp you soon.",
  },
  es: {
    hi: (n: string) => `Hola ${n} 🌴`,
    link: "Tu enlace (llavero NFC y QR)",
    qr: "Código QR — imprímelo o muéstralo en tu celular",
    pending: "Pendiente",
    pendingHint: "Reservas pagadas que aún no terminan",
    payable: "Próximo lunes",
    payableHint: "Ganado, se paga por SINPE Móvil",
    paid: "Pagado a la fecha",
    scans: "Escaneos / clics",
    deals: "Ventas",
    rate: (r: number, d: number) => `Ganas ${r}% · tus clientes ahorran ${d}%`,
    bookings: "Tus ventas",
    payouts: "Pagos",
    head: ["Reserva", "Fecha", "Cliente", "Valor", "Tu comisión", "Estado"],
    payHead: ["Semana", "Monto", "Referencia", "Estado"],
    signout: "Salir",
    unapproved: "Tu solicitud está en revisión — te escribiremos pronto por WhatsApp.",
  },
};

export default function AgentPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <Link href="/">
          <Logo />
        </Link>
        <form action="/auth/signout" method="post">
          <button className="text-sm text-muted hover:text-pink">⏻</button>
        </form>
      </header>
      <Suspense fallback={<Skeleton />}>
        <Content />
      </Suspense>
    </main>
  );
}

async function Content() {
  const { affiliate: a } = await requireAgent();
  const lang = a.locale === "en" ? "en" : "es";
  const c = COPY[lang];
  if (a.status !== "approved" || !a.slug) return <p className="panel p-6">{c.unapproved}</p>;

  const link = `${SITE.url}/a/${a.slug}`;
  const [balance, { data: comms }, { data: payouts }, { count: scans }] = await Promise.all([
    getBalance(a.id),
    db()
      .from("commissions")
      .select("id, base_cents, amount_cents, status, created_at, reservation:reservations(code, start_at, customer:customers(full_name))")
      .eq("affiliate_id", a.id)
      .order("created_at", { ascending: false })
      .limit(100),
    db().from("payouts").select("*").eq("affiliate_id", a.id).order("period_end", { ascending: false }).limit(26),
    db().from("affiliate_clicks").select("id", { count: "exact", head: true }).eq("affiliate_id", a.id),
  ]);
  const deals = (comms ?? []).filter((x) => x.status !== "void").length;
  const qr = await QRCode.toDataURL(`${link}?s=qr`, { margin: 1, width: 320, color: { dark: "#12061f", light: "#ffffff" } });

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-script text-6xl normal-case neon-pink">{c.hi(a.full_name.split(" ")[0])}</h1>
        <p className="mt-2 text-muted">{c.rate(Number(a.commission_rate), Number(a.customer_discount))}</p>
      </div>

      <section className="grid gap-6 md:grid-cols-[1fr_auto]">
        <div className="panel panel-cyan p-6">
          <p className="label">{c.link}</p>
          <CopyLink url={link} />
        </div>
        <figure className="panel p-4 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- inline data-URL QR */}
          <img src={qr} alt={`QR ${link}`} width={160} height={160} className="mx-auto bg-white" />
          <figcaption className="mt-2 max-w-40 text-xs text-muted">{c.qr}</figcaption>
        </figure>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label={c.payable} value={formatUSD(balance.earnedCents, { decimals: true })} hint={c.payableHint} />
        <Stat label={c.pending} value={formatUSD(balance.pendingCents, { decimals: true })} hint={c.pendingHint} />
        <Stat label={c.paid} value={formatUSD(balance.paidCents, { decimals: true })} />
        <Stat label={c.deals} value={deals} />
        <Stat label={c.scans} value={scans ?? 0} />
      </section>

      <section>
        <h2 className="mb-3 text-3xl text-cyan">{c.bookings}</h2>
        <Table head={c.head} empty={!comms?.length}>
          {(comms ?? []).map((x) => {
            const r = x.reservation as { code: string; start_at: string | null; customer: { full_name: string } | null } | null;
            return (
              <tr key={x.id}>
                <td className="font-mono">{r?.code}</td>
                <td>{crTime(r?.start_at ?? null, lang)}</td>
                <td>{r?.customer?.full_name.split(" ")[0]}</td>
                <td>
                  <Money cents={x.base_cents} />
                </td>
                <td className="text-mint">
                  <Money cents={x.amount_cents} />
                </td>
                <td>
                  <Badge value={x.status} />
                </td>
              </tr>
            );
          })}
        </Table>
      </section>

      <section>
        <h2 className="mb-3 text-3xl text-cyan">{c.payouts}</h2>
        <Table head={c.payHead} empty={!payouts?.length}>
          {(payouts ?? []).map((p) => (
            <tr key={p.id}>
              <td>
                {p.period_start} → {p.period_end}
              </td>
              <td>
                <Money cents={p.amount_cents} />
              </td>
              <td className="font-mono text-xs">{p.reference ?? "—"}</td>
              <td>
                <Badge value={p.status} />
              </td>
            </tr>
          ))}
        </Table>
      </section>
    </div>
  );
}
