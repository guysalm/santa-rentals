"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { SITE } from "@/lib/site";

export type LoginState = { ok: boolean; message: string } | null;

export async function sendMagicLink(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = z.email().safeParse(String(form.get("email") ?? "").trim().toLowerCase());
  if (!email.success) return { ok: false, message: "Enter a valid email address." };
  const next = String(form.get("next") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: email.data,
    options: {
      // Accounts are created by admins (staff) or on agent approval — no public sign-up.
      shouldCreateUser: false,
      emailRedirectTo: `${SITE.url}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ""}`,
    },
  });
  // Same response whether or not the account exists (no user enumeration).
  if (error && !/signups not allowed|not found|Signups/i.test(error.message)) {
    console.error("[login]", error.message);
    return { ok: false, message: "Couldn't send the link right now. Try again in a minute." };
  }
  return { ok: true, message: "If that email has an account, a login link is on its way. Check your inbox." };
}
