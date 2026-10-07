import "server-only";
import { env } from "../env";
import { MockProvider } from "./mock";
import { StripeProvider } from "./stripe";
import type { PaymentProvider } from "./types";

let provider: PaymentProvider | null = null;

/** Mock checkout for local dev / e2e tests. Hard-disabled in production builds. */
export const isMockPayments = () => process.env.NODE_ENV !== "production" && process.env.PAYMENTS_PROVIDER === "mock";

export const hasPayments = () => isMockPayments() || Boolean(env.stripeSecretKey);

/** The active payment provider. Swap here to move to ONVO/Tilopay. */
export function payments(): PaymentProvider {
  if (!provider) {
    if (isMockPayments()) provider = new MockProvider();
    else if (env.stripeSecretKey) provider = new StripeProvider(env.stripeSecretKey);
    else throw new Error("Payments are not configured (STRIPE_SECRET_KEY).");
  }
  return provider;
}

export type { PaymentProvider, PaymentEvent, CheckoutLine } from "./types";
