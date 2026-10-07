import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { toCsv } from "@/lib/commissions";
import { listReservations } from "@/lib/admin-data";

// Staff-only CSV of all non-expired bookings (for accounting).
export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role === "agent") return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const rows = await listReservations({ status: "all", limit: 5000 });
  const csv = toCsv([
    ["Code", "Status", "Kind", "Start", "End", "Customer", "Email", "Phone", "What", "Units", "Agent", "Payment", "Total USD", "Refunded USD"],
    ...rows.map((r) => [
      r.code,
      r.status,
      r.kind,
      r.startAt ?? "",
      r.endAt ?? "",
      r.customer,
      r.email,
      r.phone ?? "",
      r.what,
      r.units,
      r.agent ?? "",
      r.provider,
      (r.totalCents / 100).toFixed(2),
      (r.refundedCents / 100).toFixed(2),
    ]),
  ]);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="santa-bookings.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
