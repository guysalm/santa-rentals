import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { AFF_COOKIE, AFF_INFO_COOKIE } from "@/lib/affiliate";
import { getSettings } from "@/lib/catalog";
import { env, hasSupabaseAdmin } from "@/lib/env";
import { db } from "@/lib/supabase/admin";

// NFC keychain / QR / shared link target: santa.rentals/a/{slug}[?s=qr]
export async function GET(request: NextRequest, ctx: RouteContext<"/a/[slug]">) {
  const { slug } = await ctx.params;
  const lang = /^es\b/i.test(request.headers.get("accept-language") ?? "") ? "es" : "en";
  const home = new URL(lang === "es" ? "/es" : "/", request.url);
  if (!hasSupabaseAdmin() || !/^[a-z0-9-]{2,40}$/.test(slug)) return NextResponse.redirect(home);

  const { data: aff } = await db()
    .from("affiliates")
    .select("id, full_name, customer_discount")
    .eq("slug", slug)
    .eq("status", "approved")
    .maybeSingle();
  if (!aff) return NextResponse.redirect(home);

  const source = ["nfc", "qr", "link"].includes(request.nextUrl.searchParams.get("s") ?? "") ? request.nextUrl.searchParams.get("s")! : "nfc";
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  const visitorHash = createHash("sha256").update(`${env.ipHashSalt}:${ip}:${request.headers.get("user-agent") ?? ""}`).digest("hex").slice(0, 32);
  await db().from("affiliate_clicks").insert({ affiliate_id: aff.id, source, visitor_hash: visitorHash });

  const { cookieDays } = await getSettings();
  const maxAge = cookieDays * 86_400;
  const res = NextResponse.redirect(home);
  // Last touch wins: a new agent's tag replaces the previous attribution.
  res.cookies.set(AFF_COOKIE, aff.id, { httpOnly: true, secure: request.nextUrl.protocol === "https:", sameSite: "lax", maxAge, path: "/" });
  res.cookies.set(AFF_INFO_COOKIE, encodeURIComponent(`${aff.full_name.split(" ")[0]}|${Number(aff.customer_discount)}`), { sameSite: "lax", maxAge, path: "/" });
  return res;
}
