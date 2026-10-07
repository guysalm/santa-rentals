import { NextResponse, type NextRequest } from "next/server";
import { connection } from "next/server";
import { runDailyCommissionJob } from "@/lib/commissions";
import { isAuthorizedCron } from "@/lib/cron";
import { db } from "@/lib/supabase/admin";

// Daily: expire stale holds, complete finished bookings, release earned fees.
export async function GET(request: NextRequest) {
  await connection();
  if (!isAuthorizedCron(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { data: expired } = await db().rpc("expire_stale_holds");
  const result = await runDailyCommissionJob();
  return NextResponse.json({ ok: true, expired, ...result });
}
