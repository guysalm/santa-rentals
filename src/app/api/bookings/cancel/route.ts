import { NextResponse, type NextRequest } from "next/server";
import { cancelReservation } from "@/lib/fulfillment";
import { getReservation } from "@/lib/reservations";

// Customer self-service cancellation via the secret manage link token.
export async function POST(request: NextRequest) {
  const { token } = (await request.json().catch(() => ({}))) as { token?: string };
  if (typeof token !== "string" || !/^[0-9a-f]{36}$/.test(token)) return NextResponse.json({ error: "invalid token" }, { status: 400 });
  const r = await getReservation({ token });
  if (!r) return NextResponse.json({ error: "not found" }, { status: 404 });
  try {
    const result = await cancelReservation(r, { by: "customer" });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 409 });
  }
}
