import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireStaff } from "@/lib/auth";
import { listReservations } from "@/lib/admin-data";
import { ReservationTable } from "@/components/admin/ReservationTable";
import { PageTitle, Skeleton } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Reservations" };

const STATUSES = ["upcoming", "all", "pending_payment", "paid", "active", "completed", "cancelled", "no_show", "expired"];

export default function ReservationsPage({ searchParams }: PageProps<"/admin/reservations">) {
  return (
    <>
      <PageTitle title="Reservations">
        <Link href="/admin/reservations/new" className="btn btn-sun !py-1 !text-base">
          + Walk-in booking
        </Link>
      </PageTitle>
      <Suspense fallback={<Skeleton />}>
        <Content searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Content({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireStaff();
  const sp = await searchParams;
  const s = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const status = s("status") || "upcoming";
  const rows = await listReservations({ status, from: s("from") || undefined, to: s("to") || undefined, q: s("q") || undefined });
  return (
    <>
      <form className="panel mb-6 grid gap-3 p-4 sm:grid-cols-5 sm:items-end">
        <label className="block">
          <span className="label !text-sm">Status</span>
          <select name="status" defaultValue={status} className="field">
            {STATUSES.map((x) => (
              <option key={x} value={x}>
                {x.replace("_", " ")}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label !text-sm">From</span>
          <input type="date" name="from" defaultValue={s("from")} className="field" />
        </label>
        <label className="block">
          <span className="label !text-sm">To</span>
          <input type="date" name="to" defaultValue={s("to")} className="field" />
        </label>
        <label className="block">
          <span className="label !text-sm">Search</span>
          <input name="q" defaultValue={s("q")} placeholder="code, name, email, phone" className="field" />
        </label>
        <button className="btn btn-primary !text-base">Filter</button>
      </form>
      <p className="mb-2 text-sm text-muted">{rows.length} result(s)</p>
      <ReservationTable rows={rows} />
    </>
  );
}
