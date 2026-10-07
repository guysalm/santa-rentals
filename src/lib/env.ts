// Central env access. The site runs in "demo mode" (seed catalog, no booking
// writes) until Supabase is configured, so the public pages build anywhere.
export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  emailFrom: process.env.EMAIL_FROM ?? "Santa Rentals <bookings@santa.rentals>",
  cronSecret: process.env.CRON_SECRET ?? "",
  ipHashSalt: process.env.IP_HASH_SALT ?? "santa",
  /** Comma-separated fallback recipients for admin notifications (merged with settings.adminEmails). */
  adminEmails: (process.env.ADMIN_EMAILS ?? "").split(",").map((s) => s.trim()).filter(Boolean),
};

export const hasSupabase = () => Boolean(env.supabaseUrl && env.supabaseAnonKey);
export const hasSupabaseAdmin = () => Boolean(env.supabaseUrl && env.supabaseServiceKey);
