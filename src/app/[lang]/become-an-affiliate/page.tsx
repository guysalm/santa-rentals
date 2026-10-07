import type { Metadata } from "next";
import { getDictionary, resolveLang } from "@/dictionaries";
import { getModels, getSettings } from "@/lib/catalog";
import { formatUSD } from "@/lib/money";
import { faqJsonLd, pageMetadata } from "@/lib/seo";
import type { Locale } from "@/lib/types";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { SectionHeading } from "@/components/SectionHeading";
import { ApplyForm } from "./ApplyForm";

const COPY = {
  en: {
    seoTitle: "Become a Santa Rentals Agent — Earn With Your NFC Keychain | Santa Teresa",
    seoDescription: "Live or work in Santa Teresa? Become a Santa Rentals agent: share your NFC keychain, give travellers a discount and earn a finder's fee on every paid ATV and tour booking.",
    kicker: "Agent program · Santa Teresa",
    h1: "Become a Santa agent",
    lead: "Work at a hotel, surf school, café or just know everyone in town? Get your own Santa NFC keychain. Every traveller who taps it gets a discount — and you earn a finder's fee on every paid booking.",
    steps: [
      { t: "Apply", d: "Fill in the form below. We'll message you on WhatsApp within a day." },
      { t: "Get your keychain", d: "Pick up your personal NFC keychain (one-time fee) — it opens your unique link when tapped with any phone. You also get a QR code and shareable link." },
      { t: "Share it", d: "Guests tap the keychain, book online and automatically get their discount." },
      { t: "Get paid every Monday", d: "You get an email for every deal with your balance, a statement every Monday, and your money by SINPE Móvil." },
    ],
    exampleTitle: "What can you earn?",
    example: (a: string, b: string, rate: number, disc: number) =>
      `A couple rents two ${a} for 3 days through your keychain. They save ${disc}% and you earn ${rate}% of the booking: about ${b}. Refer 5 groups a week and that adds up fast.`,
    faq: [
      { q: "How much does the keychain cost?", a: "A one-time fee (shown in the form) covers the programmed NFC keychain. Pay online or in cash when you pick it up." },
      { q: "When do I get paid?", a: "Your fee is earned once the customer's rental or tour is completed. Every Monday we add up everything earned and send it by SINPE Móvil." },
      { q: "What if the customer cancels?", a: "Finder's fees are only paid on completed, paid bookings. If a booking is cancelled, there's no fee for that booking." },
      { q: "Do I need to sell anything?", a: "No. Just recommend us and share your keychain or link. Customers book and pay online themselves." },
    ],
    apply: "Apply now",
  },
  es: {
    seoTitle: "Hazte Agente de Santa Rentals — Gana con tu Llavero NFC | Santa Teresa",
    seoDescription: "¿Vives o trabajas en Santa Teresa? Hazte agente de Santa Rentals: comparte tu llavero NFC, da descuento a los viajeros y gana comisión por cada reserva pagada.",
    kicker: "Programa de agentes · Santa Teresa",
    h1: "Hazte agente Santa",
    lead: "¿Trabajas en un hotel, escuela de surf, café o conoces a todo el pueblo? Recibe tu propio llavero NFC Santa. Cada viajero que lo toque recibe un descuento — y tú ganas una comisión por cada reserva pagada.",
    steps: [
      { t: "Postúlate", d: "Llena el formulario. Te escribimos por WhatsApp en menos de un día." },
      { t: "Recibe tu llavero", d: "Recoge tu llavero NFC personal (pago único) — abre tu enlace único al tocarlo con cualquier celular. También recibes un código QR y un enlace para compartir." },
      { t: "Compártelo", d: "Los clientes tocan el llavero, reservan en línea y reciben su descuento automáticamente." },
      { t: "Cobra cada lunes", d: "Recibes un correo por cada venta con tu saldo, un estado cada lunes y tu dinero por SINPE Móvil." },
    ],
    exampleTitle: "¿Cuánto puedes ganar?",
    example: (a: string, b: string, rate: number, disc: number) =>
      `Una pareja alquila dos ${a} por 3 días con tu llavero. Ahorran ${disc}% y tú ganas ${rate}% de la reserva: unos ${b}. Refiere 5 grupos por semana y suma rápido.`,
    faq: [
      { q: "¿Cuánto cuesta el llavero?", a: "Un pago único (indicado en el formulario) cubre el llavero NFC programado. Paga en línea o en efectivo al recogerlo." },
      { q: "¿Cuándo me pagan?", a: "La comisión se gana cuando el alquiler o tour del cliente termina. Cada lunes sumamos todo lo ganado y lo enviamos por SINPE Móvil." },
      { q: "¿Y si el cliente cancela?", a: "Las comisiones solo se pagan por reservas pagadas y completadas. Si se cancela, no hay comisión por esa reserva." },
      { q: "¿Tengo que vender algo?", a: "No. Solo recomiéndanos y comparte tu llavero o enlace. Los clientes reservan y pagan en línea." },
    ],
    apply: "Postúlate ahora",
  },
};

export async function generateMetadata({ params }: PageProps<"/[lang]/become-an-affiliate">): Promise<Metadata> {
  const lang = await resolveLang(params);
  return pageMetadata({ lang, path: "/become-an-affiliate", title: COPY[lang].seoTitle, description: COPY[lang].seoDescription });
}

export default async function BecomeAffiliatePage({ params }: PageProps<"/[lang]/become-an-affiliate">) {
  const lang: Locale = await resolveLang(params);
  const dict = getDictionary(lang);
  const c = COPY[lang];
  const [settings, models] = await Promise.all([getSettings(), getModels("atv")]);
  const { commissionRate: rate, customerDiscount: disc, tagFeeCents } = settings.affiliateDefaults;
  const atv = models.find((m) => m.slug === "honda-trx420") ?? models[0];
  const net = atv ? Math.round(atv.priceDayCents * 3 * 2 * (1 - disc / 100)) : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Breadcrumbs lang={lang} crumbs={[{ name: dict.common.home, path: "/" }, { name: dict.nav.affiliate, path: "/become-an-affiliate" }]} />
      <div className="mt-8">
        <SectionHeading as="h1" kicker={c.kicker} title={c.h1} lead={c.lead} />
      </div>
      <a href="#apply" className="btn btn-sun">
        {c.apply} ▸
      </a>

      <ol className="mt-14 grid gap-6 md:grid-cols-4">
        {c.steps.map((s, i) => (
          <li key={s.t} className="panel p-5">
            <span className="hud-money text-5xl">0{i + 1}</span>
            <h2 className="mt-2 text-3xl text-cyan">{s.t}</h2>
            <p className="mt-2 text-sm text-muted">{s.d}</p>
          </li>
        ))}
      </ol>

      {atv && (
        <section className="panel panel-cyan mt-14 p-8">
          <h2 className="text-4xl text-sun">{c.exampleTitle}</h2>
          <p className="mt-3 max-w-3xl text-lg">{c.example(`${atv.brand} ${atv.name}`, formatUSD(Math.round((net * rate) / 100)), rate, disc)}</p>
          <div className="mt-6 flex flex-wrap gap-8">
            <p>
              <span className="hud-money text-5xl">{rate}%</span>
              <span className="ml-2 text-muted">{lang === "es" ? "tu comisión" : "your fee"}</span>
            </p>
            <p>
              <span className="hud-money text-5xl">−{disc}%</span>
              <span className="ml-2 text-muted">{lang === "es" ? "para tus clientes" : "for your guests"}</span>
            </p>
          </div>
        </section>
      )}

      <section id="apply" className="mt-14 scroll-mt-24">
        <h2 className="mb-6 text-5xl">
          <span className="sunset-text">{c.apply}</span>
        </h2>
        <ApplyForm lang={lang} fee={formatUSD(tagFeeCents)} />
      </section>

      <section className="mt-14 grid gap-4 md:grid-cols-2">
        {c.faq.map((f) => (
          <div key={f.q} className="panel p-5">
            <h3 className="text-2xl text-cyan">{f.q}</h3>
            <p className="mt-2 text-sm text-muted">{f.a}</p>
          </div>
        ))}
      </section>
      <JsonLd data={faqJsonLd(c.faq)} />
    </div>
  );
}
