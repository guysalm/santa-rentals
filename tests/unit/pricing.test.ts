import { test } from "node:test";
import assert from "node:assert/strict";
import { baseRentalCents, quoteRental, quoteTour, rentalPeriod, seasonMultiplier } from "../../src/lib/pricing";
import { cancellationOutcome, commissionCents, DEFAULT_SETTINGS } from "../../src/lib/policy";
import { TOURS, VEHICLE_MODELS } from "../../src/content/catalog";

const trx420 = VEHICLE_MODELS.find((m) => m.slug === "honda-trx420")!; // $75 / 8h, $85 / day
const sel = (mode: "8h" | "days", days = 1, date = "2026-10-20") => ({ date, time: "09:00", mode, days });

test("8h and daily base prices", () => {
  assert.equal(baseRentalCents(trx420, sel("8h")), 7500);
  assert.equal(baseRentalCents(trx420, sel("days", 3)), 25500);
});

test("weekly rate: 7 days = 6 × day, extra days capped at a week", () => {
  assert.equal(baseRentalCents(trx420, sel("days", 7)), 6 * 8500);
  assert.equal(baseRentalCents(trx420, sel("days", 8)), 6 * 8500 + 8500);
  assert.equal(baseRentalCents(trx420, sel("days", 13)), 6 * 8500 + 6 * 8500); // 6 rest-days capped at 1 week price
  assert.equal(baseRentalCents(trx420, sel("days", 14)), 12 * 8500);
});

test("rental period uses Costa Rica time (UTC-6)", () => {
  const { start, end } = rentalPeriod(sel("days", 2));
  assert.equal(start.toISOString(), "2026-10-20T15:00:00.000Z");
  assert.equal(end.toISOString(), "2026-10-22T15:00:00.000Z");
  assert.equal(rentalPeriod(sel("8h")).end.toISOString(), "2026-10-20T23:00:00.000Z");
});

test("season multiplier averages across rental days", () => {
  const seasons = [{ name: "High", startDate: "2026-12-20", endDate: "2027-01-05", multiplier: 1.2 }];
  assert.equal(seasonMultiplier(seasons, sel("days", 2, "2026-12-19")), 1.1); // one normal + one high day
  assert.equal(seasonMultiplier(seasons, sel("8h", 1, "2026-12-25")), 1.2);
});

test("quote: discount before 13% IVA, deposit per unit", () => {
  const q = quoteRental([{ model: trx420, qty: 2 }], sel("days", 2), [], 10);
  assert.equal(q.subtotalCents, 34000);
  assert.equal(q.discountCents, 3400);
  assert.equal(q.taxCents, Math.round(30600 * 0.13));
  assert.equal(q.totalCents, 30600 + 3978);
  assert.equal(q.depositCents, 100000);
});

test("tour quote is per person", () => {
  const tour = TOURS.find((t) => t.slug === "montezuma-waterfall-atv-tour")!;
  const q = quoteTour(tour, 3);
  assert.equal(q.subtotalCents, 3 * 16500);
  assert.equal(q.totalCents, 49500 + 6435);
});

test("cancellation tiers", () => {
  const start = new Date("2026-11-10T15:00:00Z");
  const at = (hoursBefore: number) => new Date(start.getTime() - hoursBefore * 3_600_000);
  const t = DEFAULT_SETTINGS.cancellation;
  assert.deepEqual(cancellationOutcome(10000, start, at(100), t), { feeCents: 1500, refundCents: 8500, feePct: 15 });
  assert.deepEqual(cancellationOutcome(10000, start, at(72), t), { feeCents: 1500, refundCents: 8500, feePct: 15 });
  assert.deepEqual(cancellationOutcome(10000, start, at(48), t), { feeCents: 5000, refundCents: 5000, feePct: 50 });
  assert.deepEqual(cancellationOutcome(10000, start, at(5), t), { feeCents: 10000, refundCents: 0, feePct: 100 });
  assert.deepEqual(cancellationOutcome(10000, start, at(-2), t), { feeCents: 10000, refundCents: 0, feePct: 100 }); // after start
});

test("commission on pre-tax paid amount", () => {
  assert.equal(commissionCents(30600, 7), 2142);
  assert.equal(commissionCents(30600, 10), 3060);
});
