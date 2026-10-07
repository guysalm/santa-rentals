import type { Metadata } from "next";
import { Suspense } from "react";
import { requireStaff } from "@/lib/auth";
import { getSettings } from "@/lib/catalog";
import { db } from "@/lib/supabase/admin";
import { ActionButton, PageTitle, Skeleton } from "@/components/admin/ui";
import { addSeason, deleteSeason, saveSettings } from "../_actions/catalog";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <PageTitle title="Settings" />
      <Suspense fallback={<Skeleton />}>
        <Content />
      </Suspense>
    </>
  );
}

async function Content() {
  const user = await requireStaff();
  const [s, { data: seasons }] = await Promise.all([getSettings(), db().from("seasons").select("*").order("start_date")]);
  const tiers = [...s.cancellation].sort((a, b) => b.minHoursBefore - a.minHoursBefore);
  const disabled = user.role !== "admin";
  const num = (name: string, label: string, value: number | string, step = "1") => (
    <label className="block">
      <span className="label !text-sm">{label}</span>
      <input name={name} type="number" step={step} defaultValue={value} className="field" disabled={disabled} />
    </label>
  );

  return (
    <div className="space-y-10">
      <form action={saveSettings} className="space-y-6">
        <section className="panel grid gap-4 p-5 sm:grid-cols-3">
          <h2 className="text-2xl text-sun sm:col-span-3">Operations</h2>
          {num("bufferHours", "Turnaround buffer between rentals (hours)", s.bufferHours)}
          <label className="block">
            <span className="label !text-sm">Earliest pickup</span>
            <input name="earliestPickup" type="time" defaultValue={s.earliestPickup} className="field" disabled={disabled} />
          </label>
          <label className="block">
            <span className="label !text-sm">Latest pickup</span>
            <input name="latestPickup" type="time" defaultValue={s.latestPickup} className="field" disabled={disabled} />
          </label>
          <label className="block sm:col-span-3">
            <span className="label !text-sm">Admin notification emails (comma separated) — new bookings, cancellations, Monday balance sheet</span>
            <input name="adminEmails" defaultValue={s.adminEmails.join(", ")} className="field" disabled={disabled} />
          </label>
        </section>

        <section className="panel grid gap-4 p-5 sm:grid-cols-3">
          <h2 className="text-2xl text-sun sm:col-span-3">Cancellation policy</h2>
          <p className="text-sm text-muted sm:col-span-3">Fee kept = % of the paid total, by how many hours before the start the customer cancels. Also update the Terms page text if you change this.</p>
          {[0, 1, 2].map((i) => (
            <div key={i} className="grid grid-cols-2 gap-2">
              {num(`tier${i}.hours`, `Tier ${i + 1}: ≥ hours before`, tiers[i]?.minHoursBefore ?? "")}
              {num(`tier${i}.fee`, "Fee %", tiers[i]?.feePct ?? "")}
            </div>
          ))}
        </section>

        <section className="panel grid gap-4 p-5 sm:grid-cols-4">
          <h2 className="text-2xl text-sun sm:col-span-4">Agent program defaults</h2>
          {num("commissionRate", "Finder's fee % (new agents)", s.affiliateDefaults.commissionRate, "0.5")}
          {num("customerDiscount", "Customer discount % (new agents)", s.affiliateDefaults.customerDiscount, "0.5")}
          {num("tagFee", "NFC keychain price (USD)", (s.affiliateDefaults.tagFeeCents / 100).toFixed(2), "0.01")}
          {num("cookieDays", "Attribution window (days)", s.cookieDays)}
        </section>
        {disabled ? <p className="text-sm text-muted">Only admins can change settings.</p> : <ActionButton variant="sun">Save settings</ActionButton>}
      </form>

      <section className="panel p-5">
        <h2 className="mb-2 text-2xl text-sun">Seasonal pricing</h2>
        <p className="mb-4 text-sm text-muted">Rental prices are multiplied on these dates (e.g. 1.20 = +20%). Tours are not affected.</p>
        <ul className="mb-4 space-y-2 text-sm">
          {(seasons ?? []).map((x) => (
            <li key={x.id} className="flex items-center gap-3">
              <span className="w-40">{x.name}</span>
              <span className="text-muted">
                {x.start_date} → {x.end_date}
              </span>
              <span className="hud-money">×{Number(x.multiplier).toFixed(2)}</span>
              <form action={deleteSeason}>
                <input type="hidden" name="id" value={x.id} />
                <ActionButton variant="ghost" confirm="Delete this season?">
                  ✕
                </ActionButton>
              </form>
            </li>
          ))}
        </ul>
        <form action={addSeason} className="flex flex-wrap items-end gap-2">
          <input name="name" required placeholder="Easter week" className="field !w-40" />
          <input name="start" type="date" required className="field !w-44" />
          <input name="end" type="date" required className="field !w-44" />
          <input name="multiplier" type="number" step="0.05" min="0.5" max="3" defaultValue="1.15" className="field !w-24" />
          <ActionButton variant="ghost">+ Add season</ActionButton>
        </form>
      </section>
    </div>
  );
}
