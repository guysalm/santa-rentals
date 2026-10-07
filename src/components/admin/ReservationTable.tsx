import Link from "next/link";
import type { ReservationRow } from "@/lib/admin-data";
import { crTime } from "@/lib/reservations";
import { Badge, Money, Table } from "./ui";

export function ReservationTable({ rows, showUnits = true }: { rows: ReservationRow[]; showUnits?: boolean }) {
  return (
    <Table head={["Code", "Status", "Start", "Customer", "What", ...(showUnits ? ["Units / delivery"] : []), "Agent", "Total"]} empty={!rows.length}>
      {rows.map((r) => (
        <tr key={r.id} className="hover:bg-plum/60">
          <td>
            <Link href={`/admin/reservations/${r.id}`} className="font-mono text-cyan hover:underline">
              {r.code}
            </Link>
          </td>
          <td>
            <Badge value={r.status} />
          </td>
          <td className="whitespace-nowrap">{crTime(r.startAt)}</td>
          <td>
            {r.customer}
            {r.phone && <div className="text-xs text-muted">{r.phone}</div>}
          </td>
          <td>{r.what}</td>
          {showUnits && (
            <td className="text-xs text-muted">
              {r.units || "—"}
              {r.delivery && <div>📍 {r.delivery}</div>}
            </td>
          )}
          <td className="text-xs">{r.agent ?? "—"}</td>
          <td className="text-right">
            <Money cents={r.totalCents - r.refundedCents} />
          </td>
        </tr>
      ))}
    </Table>
  );
}
