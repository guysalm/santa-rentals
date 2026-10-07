import "server-only";
import { timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { env } from "./env";

/** Vercel Cron sends `Authorization: Bearer $CRON_SECRET`. */
export function isAuthorizedCron(request: NextRequest) {
  if (!env.cronSecret) return false;
  const got = Buffer.from(request.headers.get("authorization") ?? "");
  const want = Buffer.from(`Bearer ${env.cronSecret}`);
  return got.length === want.length && timingSafeEqual(got, want);
}
