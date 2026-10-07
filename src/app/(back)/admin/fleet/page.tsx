import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireStaff } from "@/lib/auth";
import { formatUSD } from "@/lib/money";
import { db } from "@/lib/supabase/admin";
import { ActionButton, Badge, PageTitle, Skeleton } from "@/components/admin/ui";
import { addMaintenance, addVehicle, setVehicleStatus } from "../_actions/catalog";

export const metadata: Metadata = { title: "Fleet" };

export default function FleetPage() {
  return (
    <>
      <PageTitle title="Fleet" />
      <Suspense fallback={<Skeleton />}>
        <Content />
      </Suspense>
    </>
  );
}

async function Content() {
  await requireStaff();
  const [{ data: models }, { data: vehicles }, { data: logs }] = await Promise.all([
    db().from("vehicle_models").select("*").order("sort"),
    db().from("vehicles").select("*").order("label"),
    db().from("maintenance_logs").select("*, vehicle:vehicles(label)").order("performed_on", { ascending: false }).limit(15),
  ]);

  return (
    <div className="space-y-8">
      {(models ?? []).map((m) => {
        const units = (vehicles ?? []).filter((v) => v.model_id === m.id);
        return (
          <section key={m.id} className="panel p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-3xl">
                  {m.brand} {m.name} {!m.active && <span className="text-base text-pink">(hidden)</span>}
                </h2>
                <p className="text-sm text-muted">
                  {m.type} · {formatUSD(m.price_8h_cents)}/8h · {formatUSD(m.price_day_cents)}/day · deposit {formatUSD(m.deposit_cents)} · {units.filter((u) => u.status === "available").length}/{units.length} in service
                </p>
              </div>
              <Link href={`/admin/fleet/${m.id}`} className="btn btn-ghost !py-1 !text-base">
                Edit prices, copy & photos
              </Link>
            </div>
            <ul className="mt-4 divide-y divide-white/10">
              {units.map((u) => (
                <li key={u.id} className="flex flex-wrap items-center gap-3 py-2 text-sm">
                  <span className="w-40 font-semibold">{u.label}</span>
                  <span className="w-24 text-muted">{u.plate ?? "no plate"}</span>
                  <Badge value={u.status} />
                  <form action={setVehicleStatus} className="ml-auto flex flex-wrap items-center gap-2">
                    <input type="hidden" name="id" value={u.id} />
                    <input name="notes" defaultValue={u.notes ?? ""} placeholder="notes" className="field !w-48 !py-1 text-xs" />
                    <select name="status" defaultValue={u.status} className="field !w-36 !py-1 text-xs">
                      <option value="available">available</option>
                      <option value="maintenance">maintenance</option>
                      <option value="retired">retired</option>
                    </select>
                    <ActionButton variant="ghost">Save</ActionButton>
                  </form>
                </li>
              ))}
            </ul>
            <form action={addVehicle} className="mt-3 flex flex-wrap items-end gap-2 border-t border-white/10 pt-3">
              <input type="hidden" name="model_id" value={m.id} />
              <input name="label" required placeholder={`${m.name} #${units.length + 1}`} className="field !w-48 !py-1" />
              <input name="plate" placeholder="Plate" className="field !w-28 !py-1" />
              <input name="color" placeholder="Color" className="field !w-28 !py-1" />
              <ActionButton variant="sun">+ Add unit</ActionButton>
            </form>
          </section>
        );
      })}

      <section className="panel p-5">
        <h2 className="mb-3 text-3xl text-cyan">Maintenance log</h2>
        <form action={addMaintenance} className="mb-4 flex flex-wrap items-end gap-2">
          <select name="vehicle_id" className="field !w-48" required>
            {(vehicles ?? []).map((v) => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </select>
          <input name="description" required placeholder="Oil change, new tires…" className="field !w-72" />
          <input name="cost" type="number" step="0.01" placeholder="Cost USD" className="field !w-28" />
          <input name="odometer" type="number" placeholder="km" className="field !w-24" />
          <ActionButton variant="ghost">Log</ActionButton>
        </form>
        <ul className="space-y-1 text-sm">
          {(logs ?? []).map((l) => (
            <li key={l.id} className="text-muted">
              <span className="text-ink">{l.performed_on}</span> · {(l.vehicle as { label: string } | null)?.label} · {l.description}
              {l.cost_cents ? ` · ${formatUSD(l.cost_cents)}` : ""}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
