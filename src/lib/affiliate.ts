import "server-only";
import { cookies } from "next/headers";
import { db } from "./supabase/admin";
import { hasSupabaseAdmin } from "./env";

/** httpOnly cookie holding the affiliate id — the only value the server trusts. */
export const AFF_COOKIE = "sr_aff";
/** Readable cookie for the banner: "Name|discount". Display only. */
export const AFF_INFO_COOKIE = "sr_aff_info";

export interface ActiveAffiliate {
  id: string;
  fullName: string;
  customerDiscount: number;
  commissionRate: number;
}

export async function getAffiliateById(id: string | undefined | null): Promise<ActiveAffiliate | null> {
  if (!id || !hasSupabaseAdmin() || !/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data } = await db()
    .from("affiliates")
    .select("id, full_name, customer_discount, commission_rate, status")
    .eq("id", id)
    .eq("status", "approved")
    .maybeSingle();
  if (!data) return null;
  return {
    id: data.id,
    fullName: data.full_name,
    customerDiscount: Number(data.customer_discount),
    commissionRate: Number(data.commission_rate),
  };
}

/** Affiliate attributed to the current visitor (runtime API — call inside Suspense). */
export async function currentAffiliate() {
  const id = (await cookies()).get(AFF_COOKIE)?.value;
  return getAffiliateById(id);
}
