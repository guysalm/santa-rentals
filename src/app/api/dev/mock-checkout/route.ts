import { NextResponse, type NextRequest } from "next/server";
import { handlePaymentEvent } from "@/lib/fulfillment";
import { isMockPayments } from "@/lib/payments";

// Dev-only stand-in for a hosted checkout page: completes payment, then
// redirects to the success URL. 404 unless PAYMENTS_PROVIDER=mock outside prod.
export async function GET(request: NextRequest) {
  if (!isMockPayments()) return new NextResponse("Not found", { status: 404 });
  const q = request.nextUrl.searchParams;
  const sessionId = q.get("session") ?? "";
  const kind = q.get("kind") === "tag_fee" ? "tag_fee" : "reservation";
  const referenceId = q.get("ref") ?? "";
  if (q.get("abandon") === "1") return NextResponse.redirect(q.get("cancel") ?? "/");

  await handlePaymentEvent({
    type: "checkout.completed",
    kind,
    referenceId,
    sessionId,
    paymentIntentId: `mock_pi_${sessionId.slice(5, 17)}`,
    paymentMethodId: "mock_pm_card_visa",
    providerCustomerId: "mock_cus_1",
    amountCents: Number(q.get("amount") ?? 0),
  });
  return NextResponse.redirect(q.get("success") ?? "/");
}
