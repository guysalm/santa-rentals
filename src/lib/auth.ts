import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "./supabase/server";
import { db } from "./supabase/admin";
import { hasSupabase } from "./env";

export type Role = "admin" | "staff" | "agent";
export interface SessionUser {
  id: string;
  email: string;
  role: Role;
}

/** Verified user from the auth cookie (JWT checked via getClaims), or null. */
export async function getSessionUser(): Promise<SessionUser | null> {
  await connection(); // per-request: reads cookies and checks JWT expiry against the clock
  if (!hasSupabase()) return null;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;
  const { data: profile } = await db().from("profiles").select("role").eq("id", claims.sub).maybeSingle();
  return { id: claims.sub, email: String(claims.email ?? ""), role: (profile?.role as Role) ?? "agent" };
}

/** Admin/staff gate for pages and server actions. */
export async function requireStaff(opts: { adminOnly?: boolean } = {}) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role === "agent" || (opts.adminOnly && user.role !== "admin")) redirect("/agent");
  return user;
}

/** Agent gate: returns the session user and their affiliate row. */
export async function requireAgent() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/agent");
  const { data: affiliate } = await db().from("affiliates").select("*").eq("user_id", user.id).maybeSingle();
  if (!affiliate) {
    if (user.role !== "agent") redirect("/admin");
    redirect("/login?error=no-agent");
  }
  return { user, affiliate };
}
