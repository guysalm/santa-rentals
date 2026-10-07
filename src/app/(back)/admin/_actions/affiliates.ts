"use server";

import { refresh } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { markPayoutPaid, runWeeklyPayoutJob } from "@/lib/commissions";
import { sendEmail } from "@/lib/email/send";
import { affiliateApprovedEmail } from "@/lib/email/templates";
import { SITE } from "@/lib/site";
import { db } from "@/lib/supabase/admin";
import type { Locale } from "@/lib/types";

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30);

/**
 * Approve an applicant: assign their keychain URL slug, create their login,
 * and email them their link + rates.
 */
export async function approveAffiliate(form: FormData) {
  await requireStaff();
  const id = str(form, "id");
  const { data: aff } = await db().from("affiliates").select("*").eq("id", id).single();
  if (!aff) throw new Error("Agent not found");

  const slug = slugify(str(form, "slug") || aff.full_name.split(" ")[0]);
  if (slug.length < 2) throw new Error("Slug too short");
  const { data: taken } = await db().from("affiliates").select("id").eq("slug", slug).neq("id", id).maybeSingle();
  if (taken) throw new Error(`The link santa.rentals/a/${slug} is already taken — choose another`);

  // Login account (magic link) for the agent dashboard.
  let userId = aff.user_id;
  if (!userId) {
    const { data: created, error } = await db().auth.admin.createUser({ email: aff.email, email_confirm: true, user_metadata: { full_name: aff.full_name } });
    if (error && !/already/i.test(error.message)) throw error;
    userId = created?.user?.id ?? null;
    if (!userId) {
      const { data: list } = await db().auth.admin.listUsers({ perPage: 1000 });
      userId = list?.users.find((u) => u.email?.toLowerCase() === aff.email.toLowerCase())?.id ?? null;
    }
  }

  const rate = Number(str(form, "commission_rate")) || Number(aff.commission_rate);
  const discount = Number(str(form, "customer_discount")) || Number(aff.customer_discount);
  const { error } = await db()
    .from("affiliates")
    .update({
      slug,
      user_id: userId,
      status: "approved",
      approved_at: aff.approved_at ?? new Date().toISOString(),
      commission_rate: rate,
      customer_discount: discount,
      nfc_serial: str(form, "nfc_serial") || aff.nfc_serial,
    })
    .eq("id", id);
  if (error) throw error;

  if (aff.status !== "approved") {
    const { subject, html } = affiliateApprovedEmail({
      lang: aff.locale as Locale,
      name: aff.full_name,
      link: `${SITE.url}/a/${slug}`,
      discount,
      rate,
      loginUrl: `${SITE.url}/login?next=/agent`,
    });
    await sendEmail({ to: aff.email, subject, html });
  }
  refresh();
}

export async function updateAffiliate(form: FormData) {
  await requireStaff();
  const status = str(form, "status") as "pending" | "approved" | "suspended";
  const { error } = await db()
    .from("affiliates")
    .update({
      commission_rate: Number(str(form, "commission_rate")),
      customer_discount: Number(str(form, "customer_discount")),
      nfc_serial: str(form, "nfc_serial") || null,
      payout_details: str(form, "payout_details") || null,
      notes: str(form, "notes") || null,
      ...(status ? { status } : {}),
    })
    .eq("id", str(form, "id"));
  if (error) throw error;
  refresh();
}

/** Keychain paid in cash at handover. */
export async function markTagFeePaid(form: FormData) {
  await requireStaff();
  await db().from("affiliates").update({ tag_fee_paid_at: new Date().toISOString(), tag_fee_session_id: "cash" }).eq("id", str(form, "id"));
  refresh();
}

export async function payPayout(form: FormData) {
  await requireStaff();
  const reference = str(form, "reference");
  if (!reference) throw new Error("Enter the SINPE / transfer reference");
  await markPayoutPaid(str(form, "id"), reference);
  refresh();
}

/** Manually (re)build this week's balance sheet and send statements. */
export async function runWeeklyNow() {
  await requireStaff({ adminOnly: true });
  await runWeeklyPayoutJob();
  refresh();
}
