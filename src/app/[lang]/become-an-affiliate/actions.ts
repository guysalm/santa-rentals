"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getSettings } from "@/lib/catalog";
import { sendEmail } from "@/lib/email/send";
import { affiliateApplicationEmail, esc } from "@/lib/email/templates";
import { hasSupabaseAdmin } from "@/lib/env";
import { localePath } from "@/lib/i18n";
import { adminRecipients } from "@/lib/notify";
import { hasPayments, payments } from "@/lib/payments";
import { SITE } from "@/lib/site";
import { db } from "@/lib/supabase/admin";

const schema = z.object({
  locale: z.enum(["en", "es"]),
  fullName: z.string().trim().min(2).max(120),
  email: z.email().max(200),
  phone: z.string().trim().min(6).max(40),
  idNumber: z.string().trim().max(40).optional().default(""),
  area: z.string().trim().max(120).optional().default(""),
  sinpe: z.string().trim().min(6).max(40),
  about: z.string().trim().max(1000).optional().default(""),
  payNow: z.enum(["online", "cash"]),
  terms: z.literal("on"),
});

export type ApplyState = { error?: string; fields?: Record<string, string> } | null;

export async function applyAsAgent(_prev: ApplyState, form: FormData): Promise<ApplyState> {
  const raw = Object.fromEntries([...form.entries()].map(([k, v]) => [k, String(v)]));
  if (raw.website) return { error: "Bad request" }; // honeypot
  const lang = raw.locale === "es" ? "es" : "en";
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { error: lang === "es" ? "Revisa los campos marcados." : "Please check the highlighted fields.", fields: raw };
  }
  if (!hasSupabaseAdmin()) return { error: "Applications are not open yet — message us on WhatsApp.", fields: raw };
  const d = parsed.data;
  const email = d.email.toLowerCase();

  const { data: existing } = await db().from("affiliates").select("id, status").eq("email", email).maybeSingle();
  if (existing) {
    return {
      error: lang === "es" ? "Ya existe una solicitud con este correo. Te contactaremos pronto." : "There's already an application with this email — we'll be in touch soon.",
      fields: raw,
    };
  }

  const settings = await getSettings();
  const { data: aff, error } = await db()
    .from("affiliates")
    .insert({
      full_name: d.fullName,
      email,
      phone: d.phone,
      id_number: d.idNumber || null,
      area: d.area || null,
      payout_method: "sinpe",
      payout_details: d.sinpe,
      commission_rate: settings.affiliateDefaults.commissionRate,
      customer_discount: settings.affiliateDefaults.customerDiscount,
      tag_fee_cents: settings.affiliateDefaults.tagFeeCents,
      notes: d.about || null,
      locale: d.locale,
    })
    .select("id")
    .single();
  if (error) throw error;

  const { subject, html } = affiliateApplicationEmail(d.locale, d.fullName);
  await sendEmail({ to: email, subject, html });
  await sendEmail({
    to: await adminRecipients(),
    subject: `New agent application: ${d.fullName} (${d.area || "no area"})`,
    html: `<p><b>${esc(d.fullName)}</b> · ${esc(email)} · ${esc(d.phone)}<br>Area: ${esc(d.area)}<br>Keychain: ${d.payNow}<br>${esc(d.about)}</p><p><a href="${SITE.url}/admin/affiliates">Review in admin</a></p>`,
  });

  const thanks = `${SITE.url}${localePath(d.locale, "/become-an-affiliate/thanks")}`;
  if (d.payNow === "online" && hasPayments() && settings.affiliateDefaults.tagFeeCents > 0) {
    const checkout = await payments().createCheckout({
      kind: "tag_fee",
      referenceId: aff.id,
      customerEmail: email,
      lines: [{ name: d.locale === "es" ? "Llavero NFC Santa Rentals" : "Santa Rentals NFC keychain", amountCents: settings.affiliateDefaults.tagFeeCents, quantity: 1 }],
      successUrl: `${thanks}?paid=1`,
      cancelUrl: thanks,
      expiresAt: new Date(Date.now() + 31 * 60_000),
      locale: d.locale,
      saveCardForDeposit: false,
    });
    redirect(checkout.url);
  }
  redirect(thanks);
}
