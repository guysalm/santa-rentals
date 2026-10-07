import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { requireStaff } from "@/lib/auth";
import { addDaysStr, crDayStart } from "@/lib/admin-data";
import { crToday } from "@/lib/booking";
import { db } from "@/lib/supabase/admin";
import { PageTitle, Skeleton } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Calendar" };

const DAYS = 14;
const COLORS: Record<string, string> = { pending_payment: "bg-sun/60 text-night", paid: "bg-pink", active: "bg-cyan text-night", completed: "bg-white/25" };

export default function CalendarPage({ searchParams }: PageProps<"/admin/calendar">) {
  return (
    <>
      <PageTitle title="Fleet calendar" />
      <Suspense fallback={<Skeleton h="h-96" />}>
        <Content searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Content({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireStaff();
  await connection();
  const sp = await searchParams;
  const start = typeof sp.start === "string" && /^\d{4}-\d{2}-\d{2}$/.test(sp.start) ? sp.start : crToday();
  const winStart = new Date(crDayStart(start)).getTime();
  const winEnd = winStart + DAYS * 86_400_000;
  const days = Array.from({ length: DAYS }, (_, i) => addDaysStr(start, i));

  const [{ data: vehicles }, { data: items }] = await Promise.all([
    db().from("vehicles").select("id, label, status, model:vehicle_models(brand, name, sort)").neq("status", "retired"),
    db()
      .from("reservation_items")
      .select("vehicle_id, period, reservation:reservations(id, code, status, customer:customers(full_name))")
      .overlaps("period", `[${new Date(winStart).toISOString()},${new Date(winEnd).toISOString()})`)
      .eq("blocks_inventory", true),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sorted = (vehicles ?? []).sort((a: any, b: any) => a.model.sort - b.model.sort || a.label.localeCompare(b.label));
  const pct = (t: number) => Math.min(100, Math.max(0, ((t - winStart) / (winEnd - winStart)) * 100));
  const parseRange = (p: string) => {
    const m = /^[[(]"?([^",]+)"?,"?([^")]+)"?[)\]]$/.exec(p);
    return m ? [new Date(m[1]).getTime(), new Date(m[2]).getTime()] : [0, 0];
  };

  return (
    <>
      <div className="mb-4 flex items-center gap-3">
        <Link href={`/admin/calendar?start=${addDaysStr(start, -7)}`} className="btn btn-ghost !py-1 !text-base">
          ◀ Week
        </Link>
        <Link href="/admin/calendar" className="btn btn-ghost !py-1 !text-base">
          Today
        </Link>
        <Link href={`/admin/calendar?start=${addDaysStr(start, 7)}`} className="btn btn-ghost !py-1 !text-base">
          Week ▶
        </Link>
        <span className="text-sm text-muted">Bars include the turnaround buffer.</span>
      </div>
      <div className="panel overflow-x-auto">
        <div className="min-w-[1000px]">
          <div className="flex border-b-2 border-white/20 text-xs">
            <div className="w-48 shrink-0 p-2 font-display text-base text-cyan">Unit</div>
            {days.map((d) => (
              <div key={d} className={`flex-1 border-l border-white/10 p-1 text-center ${d === crToday() ? "bg-pink/20" : ""}`}>
                {new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "short", day: "numeric", timeZone: "UTC" })}
              </div>
            ))}
          </div>
          {sorted.map((v) => {
            const mine = (items ?? []).filter((i) => i.vehicle_id === v.id);
            return (
              <div key={v.id} className="flex border-b border-white/10">
                <div className="w-48 shrink-0 p-2 text-sm">
                  {v.label}
                  {v.status === "maintenance" && <span className="ml-2 text-xs text-sun">🔧</span>}
                </div>
                <div className="relative h-10 flex-1">
                  {days.map((d, i) => (
                    <div key={d} className="absolute inset-y-0 border-l border-white/10" style={{ left: `${(i / DAYS) * 100}%` }} />
                  ))}
                  {mine.map((i) => {
                    const [a, b] = parseRange(i.period as unknown as string);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const r = i.reservation as any;
                    return (
                      <Link
                        key={`${r.id}-${a}`}
                        href={`/admin/reservations/${r.id}`}
                        title={`${r.code} · ${r.customer?.full_name ?? ""} · ${r.status}`}
                        className={`absolute top-1.5 h-7 overflow-hidden whitespace-nowrap rounded-sm px-1 text-[11px] leading-7 hover:ring-2 hover:ring-white ${COLORS[r.status] ?? "bg-white/30"}`}
                        style={{ left: `${pct(a)}%`, width: `${Math.max(1.5, pct(b) - pct(a))}%` }}
                      >
                        {r.code} {r.customer?.full_name?.split(" ")[0]}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <p className="mt-3 flex gap-4 text-xs text-muted">
        <span><span className="mr-1 inline-block h-3 w-3 bg-pink align-middle" />paid</span>
        <span><span className="mr-1 inline-block h-3 w-3 bg-cyan align-middle" />active</span>
        <span><span className="mr-1 inline-block h-3 w-3 bg-sun/60 align-middle" />awaiting payment</span>
      </p>
    </>
  );
}
