import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { requireStaff } from "@/lib/auth";
import { addDaysStr, crDayStart, daysAgoIso, LIST_SELECT, toRow } from "@/lib/admin-data";
import { crToday } from "@/lib/booking";
import { formatUSD } from "@/lib/money";
import { db } from "@/lib/supabase/admin";
import { ReservationTable } from "@/components/admin/ReservationTable";
import { PageTitle, Skeleton, Stat } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Dashboard" };

export default function Dashboard() {
  return (
    <Suspense fallback={<Skeleton />}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  await requireStaff();
  await connection();
  const today = crToday();
  const t0 = crDayStart(today);
  const t1 = crDayStart(addDaysStr(today, 1));
  const week = crDayStart(addDaysStr(today, 8));
  const monthAgo = daysAgoIso(30);

  const [pickups, returns, upcoming, revenue, earned, applicants, units] = await Promise.all([
    db().from("reservations").select(LIST_SELECT).in("status", ["paid", "active"]).gte("start_at", t0).lt("start_at", t1).order("start_at"),
    db().from("reservations").select(LIST_SELECT).eq("kind", "rental").in("status", ["paid", "active"]).gte("end_at", t0).lt("end_at", t1).order("end_at"),
    db().from("reservations").select(LIST_SELECT).in("status", ["paid", "active"]).gte("start_at", t1).lt("start_at", week).order("start_at"),
    db().from("reservations").select("total_cents, refunded_cents, tax_cents").in("status", ["paid", "active", "completed", "cancelled"]).gte("paid_at", monthAgo),
    db().from("commissions").select("amount_cents").eq("status", "earned"),
    db().from("affiliates").select("id", { count: "exact", head: true }).eq("status", "pending"),
    db().from("vehicles").select("status"),
  ]);

  const rev = (revenue.data ?? []).reduce((s, r) => s + r.total_cents - r.refunded_cents, 0);
  const owed = (earned.data ?? []).reduce((s, r) => s + r.amount_cents, 0);
  const fleet = units.data ?? [];
  const inService = fleet.filter((u) => u.status === "available").length;

  return (
    <>
      <PageTitle title="Dashboard">
        <Link href="/admin/reservations/new" className="btn btn-sun !py-1 !text-base">
          + Walk-in booking
        </Link>
      </PageTitle>
      <div className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Stat label="Pickups today" value={pickups.data?.length ?? 0} />
        <Stat label="Returns today" value={returns.data?.length ?? 0} />
        <Stat label="Revenue · 30 days" value={formatUSD(rev)} hint={`${revenue.data?.length ?? 0} bookings, incl. IVA, net of refunds`} href="/admin/reports" />
        <Stat label="Owed to agents" value={formatUSD(owed)} hint="Earned, paid out Mondays" href="/admin/payouts" />
        <Stat label="Fleet in service" value={`${inService}/${fleet.length}`} hint={`${applicants.count ?? 0} agent application(s) waiting`} href="/admin/fleet" />
      </div>

      <h2 className="mb-3 text-3xl text-cyan">Today · pickups & tours</h2>
      <ReservationTable rows={(pickups.data ?? []).map(toRow)} />
      <h2 className="mb-3 mt-10 text-3xl text-cyan">Today · returns</h2>
      <ReservationTable rows={(returns.data ?? []).map(toRow)} />
      <h2 className="mb-3 mt-10 text-3xl text-cyan">Next 7 days</h2>
      <ReservationTable rows={(upcoming.data ?? []).map(toRow)} />
    </>
  );
}
