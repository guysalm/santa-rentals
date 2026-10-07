import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

// Load .env.local without dotenv.
const env: Record<string, string> = {};
for (const line of readFileSync(".env.local", "utf8").replace(/^﻿/, "").split(/\r?\n/)) {
  const m = /^([A-Z0-9_]+)=(.*)$/.exec(line);
  if (m) env[m[1]] = m[2];
}

export const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
export const CRON_SECRET = env.CRON_SECRET;

/** A 1×1 PNG standing in for a driver's license photo. */
export const LICENSE_PNG = {
  name: "license.png",
  mimeType: "image/png",
  buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64"),
};

/** A date N days from today in Costa Rica (YYYY-MM-DD). */
export const crDate = (offsetDays: number) => new Date(Date.now() - 6 * 3_600_000 + offsetDays * 86_400_000).toISOString().slice(0, 10);

export const uniqueEmail = (tag: string) => `e2e+${tag}-${Date.now()}@example.com`;
