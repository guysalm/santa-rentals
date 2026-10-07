import "server-only";
import { formatUSD } from "../money";
import { SITE, waLink } from "../site";
import { crTime, manageUrl, reservationTitle, type ReservationDetail } from "../reservations";
import type { Locale } from "../types";

// Email-safe HTML (tables + inline styles) in the Vice City palette.

export const esc = (s: string | null | undefined) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const C = { night: "#12061f", plum: "#2b1149", pink: "#ff2e88", cyan: "#22e4ff", sun: "#ffd23f", mint: "#3cf2a6", ink: "#f8f1ff", muted: "#cdb9ea" };

function layout(title: string, body: string, preheader = "") {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(title)}</title></head>
<body style="margin:0;background:${C.night};font-family:Helvetica,Arial,sans-serif;color:${C.ink}">
<span style="display:none;max-height:0;overflow:hidden">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.night}"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${C.plum};border:3px solid #fff;box-shadow:6px 6px 0 ${C.pink}">
<tr><td style="padding:20px 28px;background:linear-gradient(90deg,${C.pink},#ff8a3d,${C.sun})">
<span style="font-family:Georgia,serif;font-style:italic;font-weight:bold;font-size:30px;color:#fff;text-shadow:2px 2px 0 #000">Santa</span>
<span style="font-size:13px;letter-spacing:6px;color:${C.night};font-weight:bold"> RENTALS</span></td></tr>
<tr><td style="padding:28px">${body}</td></tr>
<tr><td style="padding:16px 28px;border-top:1px solid #ffffff22;font-size:12px;color:${C.muted}">
${esc(SITE.name)} · ${esc(SITE.address.locality)}, Costa Rica · <a href="${waLink()}" style="color:${C.cyan}">WhatsApp ${esc(SITE.phone)}</a> · <a href="mailto:${SITE.email}" style="color:${C.cyan}">${SITE.email}</a>
</td></tr></table></td></tr></table></body></html>`;
}

const h1 = (t: string) => `<h1 style="margin:0 0 12px;font-size:28px;color:${C.sun};letter-spacing:1px">${esc(t)}</h1>`;
const p = (t: string) => `<p style="margin:0 0 14px;line-height:1.6;color:${C.ink}">${t}</p>`;
const btn = (href: string, label: string) =>
  `<a href="${href}" style="display:inline-block;margin:8px 0 16px;padding:12px 22px;background:${C.pink};color:#fff;font-weight:bold;text-decoration:none;border:3px solid #000;box-shadow:4px 4px 0 #000">${esc(label)}</a>`;
const rows = (pairs: [string, string][]) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 18px;border-collapse:collapse">${pairs
    .map(
      ([k, v]) =>
        `<tr><td style="padding:7px 0;border-bottom:1px solid #ffffff1f;color:${C.muted};font-size:14px">${esc(k)}</td><td style="padding:7px 0;border-bottom:1px solid #ffffff1f;text-align:right;font-weight:bold">${v}</td></tr>`,
    )
    .join("")}</table>`;
const money = (cents: number) => `<span style="color:${C.mint}">${formatUSD(cents, { decimals: true })}</span>`;

const T = {
  en: {
    confirmed: "Mission accepted ✓",
    hi: (n: string) => `Hi ${n},`,
    thanks: "Your booking is confirmed and paid. Here are the details:",
    code: "Booking code",
    what: "What",
    when: "Start",
    until: "Return",
    where: "Delivery",
    subtotal: "Subtotal",
    discount: "Agent discount",
    tax: "IVA 13%",
    total: "Paid",
    deposit: "Security deposit (card hold at delivery)",
    manage: "Manage or cancel booking",
    bring: "Please have your driver's license and passport ready at delivery. We'll message you on WhatsApp before we arrive.",
    cancelled: "Booking cancelled",
    cancelledBody: "Your booking has been cancelled.",
    fee: "Cancellation fee",
    refund: "Refund",
    refundNote: "Refunds appear on your card statement within 5–10 business days.",
  },
  es: {
    confirmed: "Misión aceptada ✓",
    hi: (n: string) => `Hola ${n},`,
    thanks: "Tu reserva está confirmada y pagada. Estos son los detalles:",
    code: "Código de reserva",
    what: "Qué",
    when: "Inicio",
    until: "Devolución",
    where: "Entrega",
    subtotal: "Subtotal",
    discount: "Descuento de agente",
    tax: "IVA 13%",
    total: "Pagado",
    deposit: "Depósito de garantía (retención en tarjeta al entregar)",
    manage: "Gestionar o cancelar reserva",
    bring: "Ten listos tu licencia de conducir y pasaporte al recibir el vehículo. Te escribiremos por WhatsApp antes de llegar.",
    cancelled: "Reserva cancelada",
    cancelledBody: "Tu reserva ha sido cancelada.",
    fee: "Cargo por cancelación",
    refund: "Reembolso",
    refundNote: "El reembolso aparecerá en tu tarjeta en 5–10 días hábiles.",
  },
};

function bookingRows(r: ReservationDetail, lang: Locale) {
  const t = T[lang];
  const pairs: [string, string][] = [
    [t.code, `<span style="color:${C.cyan};font-size:18px">${esc(r.code)}</span>`],
    [t.what, esc(reservationTitle(r, lang))],
    [t.when, esc(crTime(r.startAt, lang))],
  ];
  if (r.kind === "rental") pairs.push([t.until, esc(crTime(r.endAt, lang))]);
  if (r.deliveryLocation) pairs.push([t.where, esc(r.deliveryLocation)]);
  pairs.push([t.subtotal, money(r.subtotalCents)]);
  if (r.discountCents) pairs.push([t.discount, `−${money(r.discountCents)}`]);
  pairs.push([t.tax, money(r.taxCents)], [t.total, money(r.totalCents)]);
  if (r.depositCents) pairs.push([t.deposit, money(r.depositCents)]);
  return rows(pairs);
}

export function bookingConfirmationEmail(r: ReservationDetail) {
  const lang = r.locale;
  const t = T[lang];
  const subject = `${t.confirmed} — ${r.code} · Santa Rentals`;
  const html = layout(
    subject,
    h1(t.confirmed) + p(esc(t.hi(r.customer.fullName.split(" ")[0]))) + p(t.thanks) + bookingRows(r, lang) + p(esc(t.bring)) + btn(manageUrl(r), t.manage),
    `${r.code} · ${reservationTitle(r, lang)}`,
  );
  return { subject, html };
}

export function bookingCancelledEmail(r: ReservationDetail, feeCents: number, refundCents: number) {
  const lang = r.locale;
  const t = T[lang];
  const subject = `${t.cancelled} — ${r.code} · Santa Rentals`;
  const html = layout(
    subject,
    h1(t.cancelled) +
      p(esc(t.hi(r.customer.fullName.split(" ")[0]))) +
      p(t.cancelledBody) +
      rows([
        [t.code, esc(r.code)],
        [t.what, esc(reservationTitle(r, lang))],
        [t.total, money(r.totalCents)],
        [t.fee, money(feeCents)],
        [t.refund, money(refundCents)],
      ]) +
      (refundCents > 0 ? p(t.refundNote) : ""),
  );
  return { subject, html };
}

export function adminNewBookingEmail(r: ReservationDetail, adminUrl: string) {
  const subject = `💰 New booking ${r.code} — ${formatUSD(r.totalCents)} — ${reservationTitle(r, "en")}`;
  const html = layout(
    subject,
    h1("New paid booking") +
      bookingRows(r, "en") +
      rows([
        ["Customer", esc(r.customer.fullName)],
        ["Email", esc(r.customer.email)],
        ["Phone", esc(r.customer.phone)],
        ["Agent", r.affiliate ? esc(r.affiliate.fullName) : "—"],
        ["Units", esc(r.items.map((i) => i.vehicleLabel).join(", ") || "—")],
        ["Notes", esc(r.notes) || "—"],
      ]) +
      btn(adminUrl, "Open in admin"),
  );
  return { subject, html };
}

// ───────────── affiliate emails ─────────────

const A = {
  en: {
    dealSubject: (amt: string) => `🌴 New deal! You earned ${amt}`,
    dealTitle: "Mission passed — new deal",
    dealBody: (name: string) => `Nice work ${name}! A booking made with your link has been paid.`,
    booking: "Booking",
    customer: "Customer",
    dates: "Date",
    value: "Booking value (excl. tax)",
    rate: "Your rate",
    earned: "Your finder's fee",
    balanceTitle: "Your balance",
    pending: "Pending (rental not finished yet)",
    payable: "Ready for Monday payout",
    paid: "Paid to date",
    note: "Fees become payable once the rental or tour is completed. Payouts are sent every Monday by SINPE Móvil.",
    dashboard: "Open agent dashboard",
    weeklySubject: (amt: string) => `Santa weekly statement — ${amt} payout`,
    weeklyTitle: "Weekly statement",
    weeklyBody: "Here are the completed bookings included in this Monday's payout:",
    weeklyNone: "No completed bookings this week — keep sharing that keychain! 🌴",
    total: "Payout total",
    paidSubject: (amt: string) => `✅ Payout sent — ${amt}`,
    paidTitle: "Payout sent",
    paidBody: "We've sent your weekly payout.",
    reference: "Reference",
    method: "Method",
  },
  es: {
    dealSubject: (amt: string) => `🌴 ¡Nueva venta! Ganaste ${amt}`,
    dealTitle: "Misión cumplida — nueva venta",
    dealBody: (name: string) => `¡Buen trabajo ${name}! Se pagó una reserva hecha con tu enlace.`,
    booking: "Reserva",
    customer: "Cliente",
    dates: "Fecha",
    value: "Valor de la reserva (sin IVA)",
    rate: "Tu porcentaje",
    earned: "Tu comisión",
    balanceTitle: "Tu saldo",
    pending: "Pendiente (alquiler aún no termina)",
    payable: "Listo para el pago del lunes",
    paid: "Pagado a la fecha",
    note: "Las comisiones se liberan cuando el alquiler o tour termina. Los pagos se envían cada lunes por SINPE Móvil.",
    dashboard: "Abrir panel de agente",
    weeklySubject: (amt: string) => `Estado semanal Santa — pago de ${amt}`,
    weeklyTitle: "Estado semanal",
    weeklyBody: "Estas son las reservas completadas incluidas en el pago de este lunes:",
    weeklyNone: "No hubo reservas completadas esta semana — ¡sigue compartiendo tu llavero! 🌴",
    total: "Total a pagar",
    paidSubject: (amt: string) => `✅ Pago enviado — ${amt}`,
    paidTitle: "Pago enviado",
    paidBody: "Te enviamos tu pago semanal.",
    reference: "Referencia",
    method: "Método",
  },
};

export interface Balance {
  pendingCents: number;
  earnedCents: number;
  paidCents: number;
}

const balanceBlock = (b: Balance, lang: Locale) =>
  `<h2 style="margin:18px 0 4px;font-size:20px;color:${C.cyan}">${esc(A[lang].balanceTitle)}</h2>` +
  rows([
    [A[lang].pending, money(b.pendingCents)],
    [A[lang].payable, money(b.earnedCents)],
    [A[lang].paid, money(b.paidCents)],
  ]);

export function agentDealEmail(opts: {
  lang: Locale;
  agentName: string;
  r: ReservationDetail;
  baseCents: number;
  rate: number;
  amountCents: number;
  balance: Balance;
  dashboardUrl: string;
}) {
  const t = A[opts.lang];
  const subject = t.dealSubject(formatUSD(opts.amountCents, { decimals: true }));
  const html = layout(
    subject,
    h1(t.dealTitle) +
      p(esc(t.dealBody(opts.agentName.split(" ")[0]))) +
      rows([
        [t.booking, `${esc(opts.r.code)} · ${esc(reservationTitle(opts.r, opts.lang))}`],
        // Agents only see the customer's first name (privacy policy).
        [t.customer, esc(opts.r.customer.fullName.split(" ")[0])],
        [t.dates, esc(crTime(opts.r.startAt, opts.lang))],
        [t.value, money(opts.baseCents)],
        [t.rate, `${opts.rate}%`],
        [t.earned, `<span style="color:${C.mint};font-size:20px">${formatUSD(opts.amountCents, { decimals: true })}</span>`],
      ]) +
      balanceBlock(opts.balance, opts.lang) +
      p(`<span style="color:${C.muted};font-size:13px">${esc(t.note)}</span>`) +
      btn(opts.dashboardUrl, t.dashboard),
    t.dealTitle,
  );
  return { subject, html };
}

export interface StatementLine {
  code: string;
  title: string;
  date: string;
  amountCents: number;
}

export function agentWeeklyStatementEmail(opts: { lang: Locale; agentName: string; periodLabel: string; lines: StatementLine[]; totalCents: number; balance: Balance; dashboardUrl: string }) {
  const t = A[opts.lang];
  const subject = t.weeklySubject(formatUSD(opts.totalCents, { decimals: true }));
  const body = opts.lines.length
    ? p(t.weeklyBody) + rows(opts.lines.map((l) => [`${l.code} · ${l.title} · ${l.date}`, money(l.amountCents)] as [string, string])) + rows([[t.total, money(opts.totalCents)]])
    : p(t.weeklyNone);
  const html = layout(subject, h1(`${t.weeklyTitle} · ${opts.periodLabel}`) + p(esc(opts.agentName)) + body + balanceBlock(opts.balance, opts.lang) + btn(opts.dashboardUrl, t.dashboard));
  return { subject, html };
}

export function agentPayoutPaidEmail(opts: { lang: Locale; agentName: string; amountCents: number; reference: string; method: string; periodLabel: string }) {
  const t = A[opts.lang];
  const subject = t.paidSubject(formatUSD(opts.amountCents, { decimals: true }));
  const html = layout(
    subject,
    h1(t.paidTitle) +
      p(`${esc(opts.agentName.split(" ")[0])} — ${esc(t.paidBody)}`) +
      rows([
        [t.total, money(opts.amountCents)],
        [t.method, esc(opts.method)],
        [t.reference, esc(opts.reference)],
        ["", esc(opts.periodLabel)],
      ]),
  );
  return { subject, html };
}

export interface PayoutSummaryRow {
  name: string;
  email: string;
  phone: string;
  method: string;
  details: string;
  bookings: number;
  amountCents: number;
}

export function adminWeeklyPayoutsEmail(opts: { periodLabel: string; rows: PayoutSummaryRow[]; adminUrl: string }) {
  const total = opts.rows.reduce((s, r) => s + r.amountCents, 0);
  const subject = `Weekly agent payouts — ${formatUSD(total, { decimals: true })} to ${opts.rows.length} agent(s) · ${opts.periodLabel}`;
  const table = opts.rows.length
    ? `<table role="presentation" width="100%" cellpadding="6" cellspacing="0" style="border-collapse:collapse;font-size:13px;margin:10px 0 18px">
<tr style="color:${C.cyan};text-align:left"><th>Agent</th><th>SINPE / payout</th><th>Deals</th><th style="text-align:right">Amount</th></tr>
${opts.rows
  .map(
    (r) =>
      `<tr style="border-top:1px solid #ffffff22"><td>${esc(r.name)}<br><span style="color:${C.muted}">${esc(r.phone)}</span></td><td>${esc(r.method)}: ${esc(r.details)}</td><td>${r.bookings}</td><td style="text-align:right">${money(r.amountCents)}</td></tr>`,
  )
  .join("")}
<tr style="border-top:2px solid #fff"><td colspan="3"><b>Total</b></td><td style="text-align:right"><b>${money(total)}</b></td></tr></table>`
    : p("No payouts due this week.");
  const html = layout(
    subject,
    h1("Monday balance sheet") + p(`Earned, unpaid finder's fees for completed bookings — ${esc(opts.periodLabel)}. A CSV is attached.`) + table + btn(opts.adminUrl, "Mark payouts as paid"),
  );
  return { subject, html };
}

export function affiliateApplicationEmail(lang: Locale, name: string) {
  const subject = lang === "es" ? "Recibimos tu solicitud de agente Santa 🌴" : "We got your Santa agent application 🌴";
  const body =
    lang === "es"
      ? p(`Hola ${esc(name.split(" ")[0])}, gracias por postularte. Revisaremos tu solicitud y te contactaremos por WhatsApp para entregarte tu llavero NFC.`)
      : p(`Hi ${esc(name.split(" ")[0])}, thanks for applying. We'll review your application and reach out on WhatsApp to hand over your NFC keychain.`);
  return { subject, html: layout(subject, h1(subject) + body) };
}

export function affiliateApprovedEmail(opts: { lang: Locale; name: string; link: string; discount: number; rate: number; loginUrl: string }) {
  const es = opts.lang === "es";
  const subject = es ? "¡Bienvenido al equipo Santa! 🌴" : "Welcome to the Santa crew! 🌴";
  const html = layout(
    subject,
    h1(subject) +
      p(
        es
          ? `Hola ${esc(opts.name.split(" ")[0])}, ya eres agente Santa. Tu llavero NFC y tu enlace llevan a:`
          : `Hi ${esc(opts.name.split(" ")[0])}, you're officially a Santa agent. Your NFC keychain and personal link point to:`,
      ) +
      p(`<a href="${opts.link}" style="color:${C.cyan};font-size:18px">${esc(opts.link)}</a>`) +
      rows([
        [es ? "Descuento para tus clientes" : "Your customers' discount", `${opts.discount}%`],
        [es ? "Tu comisión" : "Your finder's fee", `${opts.rate}%`],
      ]) +
      p(
        es
          ? "Inicia sesión en tu panel con este correo para ver tus ventas y saldo. Recibirás un correo por cada venta y un estado de cuenta cada lunes."
          : "Log in to your dashboard with this email to track deals and balance. You'll get an email for every deal and a statement every Monday.",
      ) +
      btn(opts.loginUrl, es ? "Abrir mi panel" : "Open my dashboard"),
  );
  return { subject, html };
}
