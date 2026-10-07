import "server-only";
import { SITE } from "../site";
import type { CheckoutRequest, PaymentEvent, PaymentProvider } from "./types";

/**
 * Development/test-only provider: "checkout" is a local route that immediately
 * completes the payment through the same fulfillment code as a real webhook.
 * Never enabled in production (see payments()).
 */
export class MockProvider implements PaymentProvider {
  readonly name = "mock";

  async createCheckout(req: CheckoutRequest) {
    const sessionId = `mock_${crypto.randomUUID()}`;
    const total = req.lines.reduce((s, l) => s + l.amountCents * l.quantity, 0);
    const q = new URLSearchParams({
      session: sessionId,
      kind: req.kind,
      ref: req.referenceId,
      amount: String(total),
      success: req.successUrl.replace("{SESSION_ID}", sessionId),
      cancel: req.cancelUrl,
    });
    return { sessionId, url: `${SITE.url}/api/dev/mock-checkout?${q}` };
  }

  async refund() {
    return { refundId: `mock_re_${crypto.randomUUID()}` };
  }

  async placeHold() {
    return { holdId: `mock_pi_${crypto.randomUUID()}` };
  }

  async captureHold() {}

  async releaseHold() {}

  async parseWebhook(): Promise<PaymentEvent> {
    return { type: "ignored", raw: "mock" };
  }
}
