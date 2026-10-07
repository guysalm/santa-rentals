import { NextResponse, type NextRequest } from "next/server";
import { connection } from "next/server";
import { runWeeklyPayoutJob } from "@/lib/commissions";
import { isAuthorizedCron } from "@/lib/cron";

// Mondays 08:00 Costa Rica (14:00 UTC) — see vercel.json.
export async function GET(request: NextRequest) {
  await connection();
  if (!isAuthorizedCron(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const result = await runWeeklyPayoutJob();
  return NextResponse.json({ ok: true, ...result });
}
