// Payment provider abstraction. Stripe is the default; a Costa Rican provider
// (ONVO Pay, Tilopay) can be added by implementing this interface.

export interface CheckoutLine {
  name: string;
  description?: string;
  amountCents: number; // unit amount
  quantity: number;
}

export interface CheckoutRequest {
  kind: "reservation" | "tag_fee";
  referenceId: string; // reservation id or affiliate id
  customerEmail: string;
  lines: CheckoutLine[];
  successUrl: string; // may contain {SESSION_ID}
  cancelUrl: string;
  expiresAt: Date;
  locale: "en" | "es";
  saveCardForDeposit: boolean;
}

export interface CheckoutResult {
  sessionId: string;
  url: string;
}

/** Normalized webhook events the app reacts to. */
export type PaymentEvent =
  | {
      type: "checkout.completed";
      kind: CheckoutRequest["kind"];
      referenceId: string;
      sessionId: string;
      paymentIntentId: string | null;
      paymentMethodId: string | null;
      providerCustomerId: string | null;
      amountCents: number;
    }
  | { type: "checkout.expired"; kind: CheckoutRequest["kind"]; referenceId: string; sessionId: string }
  | { type: "ignored"; raw: string };

export interface PaymentProvider {
  readonly name: string;
  createCheckout(req: CheckoutRequest): Promise<CheckoutResult>;
  /** Partial or full refund of a captured payment. */
  refund(paymentIntentId: string, amountCents: number, reason?: string): Promise<{ refundId: string }>;
  /** Authorize (not capture) the security deposit on the saved card. */
  placeHold(opts: { customerId: string; paymentMethodId: string; amountCents: number; description: string }): Promise<{ holdId: string }>;
  captureHold(holdId: string, amountCents?: number): Promise<void>;
  releaseHold(holdId: string): Promise<void>;
  parseWebhook(rawBody: string, signature: string | null): Promise<PaymentEvent>;
}
