// Pure pricing engine — shared by the booking UI (live preview) and the server
// (authoritative charge). Never trust a client-sent price.
import { SITE } from "./site";
import type { Season, Tour, VehicleModel } from "./types";

export type RentalMode = "8h" | "days";

export interface RentalSelection {
  date: string; // YYYY-MM-DD (Costa Rica local)
  time: string; // HH:MM pickup
  mode: RentalMode;
  days: number; // ignored for 8h
}

export const TAX_RATE = 0.13; // Costa Rica IVA

const HOUR = 3_600_000;

export function rentalPeriod(sel: RentalSelection): { start: Date; end: Date } {
  const start = new Date(`${sel.date}T${sel.time}:00${SITE.tzOffset}`);
  const hours = sel.mode === "8h" ? 8 : Math.max(1, Math.floor(sel.days)) * 24;
  return { start, end: new Date(start.getTime() + hours * HOUR) };
}

export const weekPrice = (m: Pick<VehicleModel, "priceDayCents" | "priceWeekCents">) =>
  m.priceWeekCents ?? m.priceDayCents * 6;

/** Base price for one unit, before seasons/discount/tax. */
export function baseRentalCents(model: VehicleModel, sel: RentalSelection): number {
  if (sel.mode === "8h") return model.price8hCents;
  const days = Math.max(1, Math.floor(sel.days));
  const weeks = Math.floor(days / 7);
  const rest = days % 7;
  const wk = weekPrice(model);
  return weeks * wk + Math.min(rest * model.priceDayCents, wk);
}

/** Average season multiplier over the calendar days the rental touches. */
export function seasonMultiplier(seasons: Season[], sel: RentalSelection): number {
  const n = sel.mode === "8h" ? 1 : Math.max(1, Math.floor(sel.days));
  let sum = 0;
  const d0 = new Date(`${sel.date}T12:00:00Z`);
  for (let i = 0; i < n; i++) {
    const day = new Date(d0.getTime() + i * 24 * HOUR).toISOString().slice(0, 10);
    const s = seasons.find((s) => day >= s.startDate && day <= s.endDate);
    sum += s ? s.multiplier : 1;
  }
  return sum / n;
}

export interface Quote {
  lines: { label: string; cents: number }[];
  subtotalCents: number;
  discountCents: number;
  discountPct: number;
  taxCents: number;
  totalCents: number;
  depositCents: number;
}

function finish(lines: Quote["lines"], subtotal: number, discountPct: number, deposit: number): Quote {
  const discountCents = Math.round((subtotal * discountPct) / 100);
  const taxCents = Math.round((subtotal - discountCents) * TAX_RATE);
  return {
    lines,
    subtotalCents: subtotal,
    discountCents,
    discountPct,
    taxCents,
    totalCents: subtotal - discountCents + taxCents,
    depositCents: deposit,
  };
}

/** Round to whole dollars so seasonal prices stay clean. */
const dollars = (cents: number) => Math.round(cents / 100) * 100;

export function quoteRental(
  items: { model: VehicleModel; qty: number }[],
  sel: RentalSelection,
  seasons: Season[],
  discountPct = 0,
): Quote {
  const mult = seasonMultiplier(seasons, sel);
  const lines = items
    .filter((i) => i.qty > 0)
    .map(({ model, qty }) => ({
      label: `${qty} × ${model.brand} ${model.name}`,
      cents: dollars(baseRentalCents(model, sel) * mult) * qty,
    }));
  const subtotal = lines.reduce((s, l) => s + l.cents, 0);
  const deposit = items.reduce((s, i) => s + (i.qty > 0 ? i.model.depositCents * i.qty : 0), 0);
  return finish(lines, subtotal, discountPct, deposit);
}

export function quoteTour(tour: Tour, pax: number, discountPct = 0): Quote {
  const subtotal = tour.priceCents * pax;
  return finish([{ label: `${pax} × ${tour.content.en.title}`, cents: subtotal }], subtotal, discountPct, 0);
}

/** Per-unit price for reservation_items, consistent with quoteRental. */
export function unitPriceCents(model: VehicleModel, sel: RentalSelection, seasons: Season[]) {
  return dollars(baseRentalCents(model, sel) * seasonMultiplier(seasons, sel));
}
