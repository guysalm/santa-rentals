import "server-only";
import Stripe from "stripe";
import { env } from "../env";
import type { CheckoutRequest, PaymentEvent, PaymentProvider } from "./types";

export class StripeProvider implements PaymentProvider {
  readonly name = "stripe";
  private stripe: Stripe;

  constructor(secretKey: string) {
    this.stripe = new Stripe(secretKey);
  }

  async createCheckout(req: CheckoutRequest) {
    const metadata = { kind: req.kind, reference_id: req.referenceId };
    const session = await this.stripe.checkout.sessions.create({
      mode: "payment",
      client_reference_id: req.referenceId,
      customer_email: req.customerEmail,
      customer_creation: "always",
      locale: req.locale,
      line_items: req.lines.map((l) => ({
        quantity: l.quantity,
        price_data: {
          currency: "usd",
          unit_amount: l.amountCents,
          product_data: { name: l.name, ...(l.description ? { description: l.description } : {}) },
        },
      })),
      payment_intent_data: {
        metadata,
        // Keeps the card on file so the deposit hold can be placed at delivery.
        ...(req.saveCardForDeposit ? { setup_future_usage: "off_session" as const } : {}),
      },
      metadata,
      success_url: req.successUrl.replace("{SESSION_ID}", "{CHECKOUT_SESSION_ID}"),
      cancel_url: req.cancelUrl,
      expires_at: Math.floor(req.expiresAt.getTime() / 1000),
    });
    if (!session.url) throw new Error("Stripe did not return a checkout URL");
    return { sessionId: session.id, url: session.url };
  }

  async refund(paymentIntentId: string, amountCents: number, reason?: string) {
    const refund = await this.stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amountCents,
      reason: "requested_by_customer",
      metadata: reason ? { note: reason.slice(0, 450) } : undefined,
    });
    return { refundId: refund.id };
  }

  async placeHold(opts: { customerId: string; paymentMethodId: string; amountCents: number; description: string }) {
    const pi = await this.stripe.paymentIntents.create({
      amount: opts.amountCents,
      currency: "usd",
      customer: opts.customerId,
      payment_method: opts.paymentMethodId,
      capture_method: "manual",
      off_session: true,
      confirm: true,
      description: opts.description,
      metadata: { kind: "deposit_hold" },
    });
    return { holdId: pi.id };
  }

  async captureHold(holdId: string, amountCents?: number) {
    await this.stripe.paymentIntents.capture(holdId, amountCents ? { amount_to_capture: amountCents } : {});
  }

  async releaseHold(holdId: string) {
    await this.stripe.paymentIntents.cancel(holdId);
  }

  async parseWebhook(rawBody: string, signature: string | null): Promise<PaymentEvent> {
    if (!signature || !env.stripeWebhookSecret) throw new Error("Missing Stripe signature or webhook secret");
    const event = await this.stripe.webhooks.constructEventAsync(rawBody, signature, env.stripeWebhookSecret);

    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      const s = event.data.object;
      if (s.payment_status !== "paid") return { type: "ignored", raw: `${event.type}:${s.payment_status}` };
      const piId = typeof s.payment_intent === "string" ? s.payment_intent : (s.payment_intent?.id ?? null);
      let paymentMethodId: string | null = null;
      if (piId) {
        const pi = await this.stripe.paymentIntents.retrieve(piId);
        paymentMethodId = typeof pi.payment_method === "string" ? pi.payment_method : (pi.payment_method?.id ?? null);
      }
      return {
        type: "checkout.completed",
        kind: (s.metadata?.kind as CheckoutRequest["kind"]) ?? "reservation",
        referenceId: s.metadata?.reference_id ?? s.client_reference_id ?? "",
        sessionId: s.id,
        paymentIntentId: piId,
        paymentMethodId,
        providerCustomerId: typeof s.customer === "string" ? s.customer : (s.customer?.id ?? null),
        amountCents: s.amount_total ?? 0,
      };
    }
    if (event.type === "checkout.session.expired") {
      const s = event.data.object;
      return {
        type: "checkout.expired",
        kind: (s.metadata?.kind as CheckoutRequest["kind"]) ?? "reservation",
        referenceId: s.metadata?.reference_id ?? s.client_reference_id ?? "",
        sessionId: s.id,
      };
    }
    return { type: "ignored", raw: event.type };
  }
}
