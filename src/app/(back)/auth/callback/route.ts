import { NextResponse, type NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

// Magic-link landing: exchange the PKCE code for a session, then route by role.
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = request.nextUrl.searchParams.get("next") ?? "";
  if (!code) return NextResponse.redirect(new URL("/login?error=link", request.url));

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/login?error=link", request.url));

  const user = await getSessionUser();
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "";
  const home = user?.role === "agent" ? "/agent" : "/admin";
  const target = safeNext && (user?.role !== "agent" || safeNext.startsWith("/agent")) ? safeNext : home;
  return NextResponse.redirect(new URL(target, request.url));
}
