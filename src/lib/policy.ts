// Business rules that admins can tune (stored in the `settings` table under the
// key "business"; these are the defaults when the row is missing).

export interface CancellationTier {
  /** Applies when the cancellation happens at least this many hours before start. */
  minHoursBefore: number;
  /** Share of the paid total that is kept as the cancellation fee (0–100). */
  feePct: number;
}

export interface BusinessSettings {
  bufferHours: number; // turnaround between rentals of the same unit
  holdMinutes: number; // inventory hold while checkout is open
  cancellation: CancellationTier[];
  affiliateDefaults: { commissionRate: number; customerDiscount: number; tagFeeCents: number };
  cookieDays: number; // affiliate attribution window
  earliestPickup: string; // HH:MM
  latestPickup: string;
  adminEmails: string[]; // receive booking + weekly payout summaries
}

export const DEFAULT_SETTINGS: BusinessSettings = {
  bufferHours: 2,
  holdMinutes: 15,
  cancellation: [
    { minHoursBefore: 72, feePct: 15 },
    { minHoursBefore: 24, feePct: 50 },
    { minHoursBefore: 0, feePct: 100 },
  ],
  affiliateDefaults: { commissionRate: 7, customerDiscount: 10, tagFeeCents: 4000 },
  cookieDays: 30,
  earliestPickup: "07:30",
  latestPickup: "17:00",
  adminEmails: [],
};

export interface CancellationOutcome {
  feeCents: number;
  refundCents: number;
  feePct: number;
}

/**
 * Fee for a customer-initiated cancellation. Tiers are evaluated from the most
 * generous (largest minHoursBefore) down. Operator/weather cancellations should
 * bypass this and refund in full.
 */
export function cancellationOutcome(
  paidCents: number,
  startAt: Date,
  now: Date,
  tiers: CancellationTier[],
): CancellationOutcome {
  const hoursBefore = (startAt.getTime() - now.getTime()) / 3_600_000;
  const sorted = [...tiers].sort((a, b) => b.minHoursBefore - a.minHoursBefore);
  const tier = sorted.find((t) => hoursBefore >= t.minHoursBefore) ?? { feePct: 100 };
  const feeCents = Math.min(paidCents, Math.round((paidCents * tier.feePct) / 100));
  return { feeCents, refundCents: paidCents - feeCents, feePct: tier.feePct };
}

/** Commission is computed on the pre-tax amount the customer actually paid. */
export const commissionCents = (netCents: number, rate: number) => Math.round((netCents * rate) / 100);
