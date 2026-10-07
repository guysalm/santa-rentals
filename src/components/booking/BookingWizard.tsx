"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { BOOKING_COPY } from "@/dictionaries/booking";
import { localePath } from "@/lib/i18n";
import { formatUSD } from "@/lib/money";
import { quoteRental, quoteTour, type RentalMode } from "@/lib/pricing";
import type { Locale, Season, Tour, VehicleModel, VehicleType } from "@/lib/types";
import { Stars } from "../Stars";
import { VehicleArt } from "../VehicleArt";

export interface WizardProps {
  lang: Locale;
  today: string;
  models: VehicleModel[];
  tours: Tour[];
  seasons: Season[];
  pickupWindow: { earliest: string; latest: string };
  affiliate: { name: string; discount: number } | null;
  initial: { kind: "rental" | "tour"; model?: string; tour?: string; type?: VehicleType; date?: string };
  released: string | null;
}

const addDays = (d: string, n: number) => new Date(new Date(`${d}T12:00:00Z`).getTime() + n * 86_400_000).toISOString().slice(0, 10);

function timeSlots(from: string, to: string) {
  const out: string[] = [];
  const [fh, fm] = from.split(":").map(Number);
  const [th, tm] = to.split(":").map(Number);
  for (let m = fh * 60 + fm; m <= th * 60 + tm; m += 30) out.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
  return out;
}

/** Downscale phone photos so uploads stay small (max 1600px JPEG). */
async function shrinkImage(file: File): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    return await new Promise((resolve) => canvas.toBlob((b) => resolve(b ?? file), "image/jpeg", 0.85));
  } catch {
    return file; // e.g. HEIC on browsers without decoder — server accepts it as-is
  }
}

function Stepper({ value, min, max, onChange, label }: { value: number; min: number; max: number; onChange: (n: number) => void; label: string }) {
  return (
    <div className="inline-flex items-center border-2 border-white/30" role="group" aria-label={label}>
      <button type="button" className="h-10 w-10 text-xl hover:bg-pink disabled:opacity-30" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`− ${label}`}>
        −
      </button>
      <span className="hud-money w-10 text-center text-2xl" aria-live="polite">
        {value}
      </span>
      <button type="button" className="h-10 w-10 text-xl hover:bg-pink disabled:opacity-30" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`+ ${label}`}>
        +
      </button>
    </div>
  );
}

export function BookingWizard(props: WizardProps) {
  const { lang, models, tours, seasons, affiliate, initial } = props;
  const t = BOOKING_COPY[lang];
  const slots = useMemo(() => timeSlots(props.pickupWindow.earliest, props.pickupWindow.latest), [props.pickupWindow]);

  const [kind, setKind] = useState<"rental" | "tour">(initial.kind);
  const [date, setDate] = useState(initial.date && initial.date >= props.today ? initial.date : addDays(props.today, 1));
  // Rental
  const [time, setTime] = useState(slots.includes("09:00") ? "09:00" : slots[0]);
  const [mode, setMode] = useState<RentalMode>("days");
  const [days, setDays] = useState(1);
  const [filter, setFilter] = useState<VehicleType | "all">(initial.type ?? (initial.model ? (models.find((m) => m.slug === initial.model)?.type ?? "all") : "all"));
  const [qty, setQty] = useState<Record<string, number>>(initial.model ? { [initial.model]: 1 } : {});
  const [units, setUnits] = useState<Record<string, number> | null>(null);
  const [delivery, setDelivery] = useState("");
  // Tour
  const [tourSlug, setTourSlug] = useState(initial.tour ?? tours[0]?.slug ?? "");
  const tour = tours.find((x) => x.slug === tourSlug) ?? null;
  const [pax, setPax] = useState(tour?.minPax ?? 2);
  const [seats, setSeats] = useState<{ left: number; running: boolean } | null>(null);
  // Details
  const [customer, setCustomer] = useState({ fullName: "", email: "", phone: "", country: "" });
  const [notes, setNotes] = useState("");
  const [license, setLicense] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [waiverAccepted, setWaiverAccepted] = useState(false);
  const [waiverName, setWaiverName] = useState("");
  const honeypot = useRef<HTMLInputElement>(null);
  // Status
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [notice, setNotice] = useState<string | null>(props.released ? t.released : null);

  // Abandoned checkout → free the hold right away.
  useEffect(() => {
    if (!props.released) return;
    fetch("/api/bookings/release", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: props.released }) }).catch(() => {});
    window.history.replaceState(null, "", window.location.pathname);
  }, [props.released]);

  // Live vehicle availability.
  useEffect(() => {
    if (kind !== "rental") return;
    const ctrl = new AbortController();
    const q = new URLSearchParams({ date, time, mode, days: String(days) });
    fetch(`/api/availability?${q}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d) => setUnits(d.units ?? null))
      .catch(() => {});
    return () => ctrl.abort();
  }, [kind, date, time, mode, days]);

  // Live tour seats.
  useEffect(() => {
    if (kind !== "tour" || !tourSlug) return;
    const ctrl = new AbortController();
    fetch(`/api/availability?${new URLSearchParams({ tour: tourSlug, date })}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d) => setSeats({ left: d.seatsLeft ?? 0, running: d.running ?? false }))
      .catch(() => {});
    return () => ctrl.abort();
  }, [kind, tourSlug, date]);

  const chosen = models.filter((m) => (qty[m.slug] ?? 0) > 0).map((m) => ({ model: m, qty: qty[m.slug] }));
  const discount = affiliate?.discount ?? 0;
  const quote =
    kind === "rental"
      ? chosen.length
        ? quoteRental(chosen, { date, time, mode, days }, seasons, discount)
        : null
      : tour
        ? quoteTour(tour, pax, discount)
        : null;

  const visibleModels = models.filter((m) => filter === "all" || m.type === filter);
  const types = [...new Set(models.map((m) => m.type))];
  const overbooked = chosen.some((c) => units && c.qty > (units[c.model.slug] ?? 0));
  const tourBlocked = kind === "tour" && seats !== null && (!seats.running || seats.left < pax);

  const missing = {
    vehicles: kind === "rental" && chosen.length === 0,
    delivery: kind === "rental" && delivery.trim().length < 3,
    fullName: customer.fullName.trim().length < 2,
    email: !/^\S+@\S+\.\S+$/.test(customer.email),
    phone: customer.phone.trim().length < 6,
    license: kind === "rental" && !license,
    waiver: !waiverAccepted,
    waiverName: waiverName.trim().length < 2,
  };
  const invalid = Object.values(missing).some(Boolean);
  const bad = (k: keyof typeof missing) => touched && missing[k];
  const fieldCls = (k: keyof typeof missing) => `field ${bad(k) ? "!border-pink" : ""}`;

  async function onLicense(file: File | undefined) {
    if (!file) return;
    const small = await shrinkImage(file);
    const out = new File([small], file.name.replace(/\.\w+$/, "") + (small.type === "image/jpeg" ? ".jpg" : ""), { type: small.type || file.type });
    setLicense(out);
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return URL.createObjectURL(out);
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    setError(null);
    if (invalid || overbooked || tourBlocked) {
      setError(t.required);
      return;
    }
    setSubmitting(true);
    const payload =
      kind === "rental"
        ? { kind, locale: lang, date, time, mode, days, items: chosen.map((c) => ({ slug: c.model.slug, qty: c.qty })), delivery, customer, notes, waiverName, waiverAccepted }
        : { kind, locale: lang, tour: tourSlug, date, pax, customer, notes, waiverName, waiverAccepted };
    const form = new FormData();
    form.set("payload", JSON.stringify(payload));
    form.set("website", honeypot.current?.value ?? "");
    if (license) form.set("license", license);
    try {
      const res = await fetch("/api/bookings", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) {
        window.location.assign(data.url);
        return;
      }
      setError((t.errors as Record<string, string>)[data.error] ?? data.message ?? t.errors.generic);
    } catch {
      setError(t.errors.generic);
    }
    setSubmitting(false);
  }

  const dayNames = lang === "es" ? ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <form onSubmit={submit} noValidate className="grid gap-10 lg:grid-cols-3">
      <div className="space-y-10 lg:col-span-2">
        {notice && (
          <p role="status" className="panel panel-cyan flex items-start justify-between gap-4 p-4">
            {notice}
            <button type="button" onClick={() => setNotice(null)} aria-label="Close" className="text-cyan">
              ✕
            </button>
          </p>
        )}

        {/* ── 1 · Choose ───────────────────────── */}
        <section aria-labelledby="step1">
          <h2 id="step1" className="mb-4 text-4xl text-cyan">
            {t.step1}
          </h2>
          <div className="mb-6 flex gap-3" role="tablist">
            {(["rental", "tour"] as const).map((k) => (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={kind === k}
                onClick={() => setKind(k)}
                className={`btn !text-lg ${kind === k ? "btn-primary" : "btn-ghost"}`}
              >
                {k === "rental" ? t.tabRental : t.tabTour}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="label">{t.date}</span>
              <input type="date" className="field" value={date} min={props.today} max={addDays(props.today, 365)} onChange={(e) => e.target.value && setDate(e.target.value)} required />
            </label>
            {kind === "rental" && (
              <>
                <label className="block">
                  <span className="label">{t.pickup}</span>
                  <select className="field" value={time} onChange={(e) => setTime(e.target.value)}>
                    {slots.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <fieldset>
                  <legend className="label">{t.duration}</legend>
                  <div className="flex flex-wrap items-center gap-3">
                    <select className="field !w-auto" value={mode} onChange={(e) => setMode(e.target.value as RentalMode)} aria-label={t.duration}>
                      <option value="8h">{t.eightHours}</option>
                      <option value="days">{t.fullDays}</option>
                    </select>
                    {mode === "days" && <Stepper value={days} min={1} max={30} onChange={setDays} label={t.days} />}
                  </div>
                  {mode === "days" && days >= 7 && <p className="mt-1 text-xs text-mint">★ {t.weekDeal}</p>}
                </fieldset>
              </>
            )}
          </div>

          {kind === "rental" ? (
            <>
              <div className="mb-4 mt-8 flex flex-wrap gap-2">
                {(["all", ...types] as const).map((ty) => (
                  <button key={ty} type="button" onClick={() => setFilter(ty)} className={`chip text-base ${filter === ty ? "bg-sun text-night" : "text-sun"}`}>
                    {ty === "all" ? t.all : ty === "atv" ? "ATV" : ty === "dirtbike" ? "Dirt bike" : ty === "scooter" ? "Scooter" : "UTV"}
                  </button>
                ))}
              </div>
              <ul className={`grid gap-4 sm:grid-cols-2 ${bad("vehicles") ? "outline outline-2 outline-pink" : ""}`}>
                {visibleModels.map((m) => {
                  const left = units?.[m.slug];
                  const n = qty[m.slug] ?? 0;
                  return (
                    <li key={m.id} className={`panel flex gap-3 p-3 ${n > 0 ? "!border-pink" : ""}`}>
                      <VehicleArt type={m.type} className="h-20 w-24 shrink-0" title={m.name} />
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <p className="font-display text-2xl leading-none tracking-wide">
                          {m.brand} {m.name}
                        </p>
                        <p className="text-sm text-muted">
                          <span className="hud-money text-lg">{formatUSD(mode === "8h" ? m.price8hCents : m.priceDayCents)}</span> / {mode === "8h" ? "8h" : t.day}
                          {m.engineCc ? ` · ${m.engineCc}cc` : ""}
                        </p>
                        <div className="mt-auto flex items-center justify-between gap-2">
                          <span className={`text-xs ${left === 0 ? "text-pink" : "text-mint"}`}>{left === undefined ? t.checking : t.left(left)}</span>
                          <Stepper value={n} min={0} max={Math.max(n, left ?? 10)} onChange={(v) => setQty((q) => ({ ...q, [m.slug]: v }))} label={`${m.brand} ${m.name}`} />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <label className="mt-6 block">
                <span className="label">{t.delivery}</span>
                <input className={fieldCls("delivery")} value={delivery} onChange={(e) => setDelivery(e.target.value)} placeholder={t.deliveryPh} autoComplete="street-address" />
              </label>
            </>
          ) : (
            <>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {tours.map((x) => (
                  <li key={x.id}>
                    <label className={`panel flex cursor-pointer gap-3 p-3 ${x.slug === tourSlug ? "!border-pink" : ""}`}>
                      <input
                        type="radio"
                        name="tour"
                        className="mt-1 accent-pink"
                        checked={x.slug === tourSlug}
                        onChange={() => {
                          setTourSlug(x.slug);
                          setPax((p) => Math.min(Math.max(p, x.minPax), x.maxPax));
                        }}
                      />
                      <span className="flex-1">
                        <span className="block font-display text-xl leading-tight tracking-wide">{x.content[lang].title}</span>
                        <span className="mt-1 flex items-center justify-between text-sm text-muted">
                          <span>
                            <span className="hud-money text-lg">{formatUSD(x.priceCents)}</span> pp ·{" "}
                            {x.daysOfWeek.length === 7 ? (lang === "es" ? "diario" : "daily") : x.daysOfWeek.map((d) => dayNames[d]).join(" ")}
                          </span>
                          <Stars level={x.difficulty} label="Difficulty" />
                        </span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
              {tour && (
                <div className="mt-6 flex flex-wrap items-center gap-6">
                  <div>
                    <span className="label">{t.pax}</span>
                    <Stepper value={pax} min={tour.minPax} max={tour.maxPax} onChange={setPax} label={t.pax} />
                  </div>
                  <p className={`text-sm ${tourBlocked ? "text-pink" : "text-mint"}`}>
                    {seats === null ? t.checking : !seats.running ? t.notRunning : t.seatsLeft(seats.left)} · {tour.startTime}
                  </p>
                </div>
              )}
            </>
          )}
        </section>

        {/* ── 2 · Details ───────────────────────── */}
        <section aria-labelledby="step2">
          <h2 id="step2" className="mb-4 text-4xl text-cyan">
            {t.step2}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="label">{t.name}</span>
              <input className={fieldCls("fullName")} value={customer.fullName} onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })} autoComplete="name" />
            </label>
            <label className="block">
              <span className="label">{t.email}</span>
              <input type="email" className={fieldCls("email")} value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} autoComplete="email" />
            </label>
            <label className="block">
              <span className="label">{t.phone}</span>
              <input type="tel" className={fieldCls("phone")} value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} autoComplete="tel" placeholder="+1 555 123 4567" />
            </label>
            <label className="block">
              <span className="label">{t.country}</span>
              <input className="field" value={customer.country} onChange={(e) => setCustomer({ ...customer, country: e.target.value })} autoComplete="country-name" />
            </label>
          </div>
          <label className="mt-4 block">
            <span className="label">{t.notes}</span>
            <textarea className="field min-h-20" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={1000} />
          </label>
          <div className="mt-4">
            <span className="label">{t.license}</span>
            <div className={`panel flex flex-wrap items-center gap-4 p-4 ${bad("license") ? "!border-pink" : ""}`}>
              {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
              {preview && <img src={preview} alt="" className="h-20 w-32 border-2 border-white object-cover" />}
              <input type="file" accept="image/*" onChange={(e) => onLicense(e.target.files?.[0])} className="text-sm file:btn file:btn-ghost file:mr-4 file:!text-base" />
              <p className="w-full text-xs text-muted">{kind === "rental" ? t.licenseHelp : t.licenseOptional}</p>
            </div>
          </div>
          <input ref={honeypot} name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
        </section>

        {/* ── 3 · Sign & pay ───────────────────────── */}
        <section aria-labelledby="step3">
          <h2 id="step3" className="mb-4 text-4xl text-cyan">
            {t.step3}
          </h2>
          <label className={`flex items-start gap-3 ${bad("waiver") ? "text-pink" : ""}`}>
            <input type="checkbox" className="mt-1 h-5 w-5 accent-pink" checked={waiverAccepted} onChange={(e) => setWaiverAccepted(e.target.checked)} />
            <span>
              {t.waiverRead}{" "}
              <Link href={localePath(lang, "/rental-agreement")} target="_blank" className="text-cyan underline">
                {t.waiverLink}
              </Link>{" "}
              {t.waiverAnd}{" "}
              <Link href={localePath(lang, "/terms")} target="_blank" className="text-cyan underline">
                {t.termsLink}
              </Link>
              .
            </span>
          </label>
          <label className="mt-4 block max-w-md">
            <span className="label">{t.signName}</span>
            <input className={`${fieldCls("waiverName")} font-script !text-2xl`} value={waiverName} onChange={(e) => setWaiverName(e.target.value)} />
          </label>
        </section>
      </div>

      {/* ── Summary ───────────────────────── */}
      <aside className="lg:col-span-1">
        <div className="panel sticky top-24 p-6">
          <h2 className="mb-4 text-3xl text-sun">{t.summary}</h2>
          {quote ? (
            <dl className="space-y-2 text-sm">
              {quote.lines.map((l) => (
                <div key={l.label} className="flex justify-between gap-3">
                  <dt className="text-muted">{kind === "tour" && tour ? `${pax} × ${tour.content[lang].title}` : l.label}</dt>
                  <dd>{formatUSD(l.cents, { decimals: true })}</dd>
                </div>
              ))}
              {kind === "rental" && (
                <p className="text-xs text-muted">
                  {date} · {time} · {mode === "8h" ? t.eightHours : `${days} ${days === 1 ? t.day : t.days}`}
                </p>
              )}
              <div className="flex justify-between border-t border-white/15 pt-2">
                <dt className="text-muted">{t.subtotal}</dt>
                <dd>{formatUSD(quote.subtotalCents, { decimals: true })}</dd>
              </div>
              {quote.discountCents > 0 && affiliate && (
                <div className="flex justify-between text-mint">
                  <dt>{t.discount(quote.discountPct, affiliate.name)}</dt>
                  <dd>−{formatUSD(quote.discountCents, { decimals: true })}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted">{t.tax}</dt>
                <dd>{formatUSD(quote.taxCents, { decimals: true })}</dd>
              </div>
              <div className="flex items-end justify-between border-t-2 border-white pt-3">
                <dt className="font-display text-2xl">{t.total}</dt>
                <dd className="hud-money text-4xl">{formatUSD(quote.totalCents, { decimals: true })}</dd>
              </div>
              {quote.depositCents > 0 && (
                <p className="pt-2 text-xs text-muted">
                  {t.deposit}: <span className="text-ink">{formatUSD(quote.depositCents)}</span>
                </p>
              )}
            </dl>
          ) : (
            <p className="text-muted">{t.nothingYet}</p>
          )}

          {error && (
            <p role="alert" className="mt-4 border-2 border-pink bg-pink/10 p-3 text-sm">
              {error}
            </p>
          )}
          <button type="submit" className="btn btn-primary mt-6 w-full" disabled={submitting || !quote || overbooked || tourBlocked}>
            {submitting ? t.paying : quote ? t.pay(formatUSD(quote.totalCents, { decimals: true })) : t.pay("")}
          </button>
          <p className="mt-3 text-center text-xs text-muted">🔒 {t.secure}</p>
        </div>
      </aside>
    </form>
  );
}
