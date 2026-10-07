import { NextResponse, type NextRequest } from "next/server";
import { releaseHold } from "@/lib/booking";

// Called when the customer returns from an abandoned checkout.
export async function POST(request: NextRequest) {
  const { token } = (await request.json().catch(() => ({}))) as { token?: string };
  if (typeof token === "string" && /^[0-9a-f]{36}$/.test(token)) await releaseHold(token);
  return NextResponse.json({ ok: true });
}
