import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireStaff } from "@/lib/auth";
import { formatUSD } from "@/lib/money";
import { db } from "@/lib/supabase/admin";
import { PageTitle, Skeleton, Table } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Tours" };
const DAY = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function ToursAdmin() {
  return (
    <>
      <PageTitle title="Tours" />
      <Suspense fallback={<Skeleton />}>
        <Content />
      </Suspense>
    </>
  );
}

async function Content() {
  await requireStaff();
  const { data: tours } = await db().from("tours").select("*").order("sort");
  return (
    <Table head={["Tour", "Category", "Price pp", "Group", "Days", "Start", "Status"]} empty={!tours?.length}>
      {(tours ?? []).map((t) => (
        <tr key={t.id} className="hover:bg-plum/60">
          <td>
            <Link href={`/admin/tours/${t.id}`} className="text-cyan hover:underline">
              {(t.content as { en?: { title?: string } })?.en?.title ?? t.slug}
            </Link>
          </td>
          <td>{t.category}</td>
          <td>{formatUSD(t.price_cents)}</td>
          <td>
            {t.min_pax}–{t.max_pax}
          </td>
          <td className="text-xs">{t.days_of_week.length === 7 ? "daily" : t.days_of_week.map((d) => DAY[d]).join(" ")}</td>
          <td>{String(t.start_time).slice(0, 5)}</td>
          <td>{t.active ? "live" : <span className="text-pink">hidden</span>}</td>
        </tr>
      ))}
    </Table>
  );
}
