import { NextResponse, type NextRequest } from "next/server";
import { handlePaymentEvent } from "@/lib/fulfillment";
import { payments } from "@/lib/payments";

// Stripe → checkout.session.completed / async_payment_succeeded / expired.
export async function POST(request: NextRequest) {
  const body = await request.text();
  let event;
  try {
    event = await payments().parseWebhook(body, request.headers.get("stripe-signature"));
  } catch (err) {
    console.warn("[webhook] rejected", (err as Error).message);
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }
  try {
    const result = await handlePaymentEvent(event);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[webhook] handler failed", err);
    // 500 → Stripe retries with backoff; the handler is idempotent.
    return NextResponse.json({ error: "handler failed" }, { status: 500 });
  }
}
