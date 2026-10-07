import type { Metadata } from "next";
import { Suspense } from "react";
import { requireStaff } from "@/lib/auth";
import { formatUSD } from "@/lib/money";
import { db } from "@/lib/supabase/admin";
import { PageTitle, Skeleton, Table } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Reports" };

export default function ReportsPage() {
  return (
    <>
      <PageTitle title="Reports">
        <a href="/api/admin/export" download className="btn btn-ghost !py-1 !text-base">
          ⬇ Export bookings CSV
        </a>
      </PageTitle>
      <Suspense fallback={<Skeleton />}>
        <Content />
      </Suspense>
    </>
  );
}

type Agg = { revenue: number; tax: number; refunds: number; fees: number; bookings: number };
const empty = (): Agg => ({ revenue: 0, tax: 0, refunds: 0, fees: 0, bookings: 0 });

async function Content() {
  await requireStaff();
  const [{ data: res }, { data: comms }] = await Promise.all([
    db()
      .from("reservations")
      .select("kind, status, paid_at, total_cents, tax_cents, refunded_cents, cancellation_fee_cents, affiliate:affiliates(full_name), tour:tours(content), items:reservation_items(price_cents, model:vehicle_models(brand, name))")
      .not("paid_at", "is", null),
    db().from("commissions").select("amount_cents, status, affiliate:affiliates(full_name)").neq("status", "void"),
  ]);

  const byMonth = new Map<string, Agg>();
  const byProduct = new Map<string, { revenue: number; units: number }>();
  const byAgent = new Map<string, { bookings: number; revenue: number; fees: number }>();
  for (const r of res ?? []) {
    const m = r.paid_at!.slice(0, 7);
    const a = byMonth.get(m) ?? empty();
    a.revenue += r.total_cents;
    a.tax += r.tax_cents;
    a.refunds += r.refunded_cents;
    a.fees += r.cancellation_fee_cents;
    a.bookings += 1;
    byMonth.set(m, a);
    if (r.status !== "cancelled") {
      if (r.kind === "tour") {
        const n = (r.tour as { content?: { en?: { title?: string } } } | null)?.content?.en?.title ?? "Tour";
        const p = byProduct.get(n) ?? { revenue: 0, units: 0 };
        p.revenue += r.total_cents - r.tax_cents;
        p.units += 1;
        byProduct.set(n, p);
      } else {
        for (const i of (r.items ?? []) as { price_cents: number; model: { brand: string; name: string } }[]) {
          const n = `${i.model.brand} ${i.model.name}`;
          const p = byProduct.get(n) ?? { revenue: 0, units: 0 };
          p.revenue += i.price_cents;
          p.units += 1;
          byProduct.set(n, p);
        }
      }
      const agent = (r.affiliate as { full_name: string } | null)?.full_name;
      if (agent) {
        const g = byAgent.get(agent) ?? { bookings: 0, revenue: 0, fees: 0 };
        g.bookings += 1;
        g.revenue += r.total_cents - r.tax_cents;
        byAgent.set(agent, g);
      }
    }
  }
  for (const c of comms ?? []) {
    const agent = (c.affiliate as { full_name: string } | null)?.full_name;
    if (agent && byAgent.has(agent)) byAgent.get(agent)!.fees += c.amount_cents;
  }
  const f = (n: number) => formatUSD(n);

  return (
    <div className="space-y-10">
      <section>
        <h2 className="mb-3 text-3xl text-cyan">By month (paid date)</h2>
        <Table head={["Month", "Bookings", "Collected", "Refunded", "Net", "of which IVA (remit)", "Cancel fees kept"]} empty={!byMonth.size}>
          {[...byMonth].sort((a, b) => b[0].localeCompare(a[0])).map(([m, a]) => (
            <tr key={m}>
              <td>{m}</td>
              <td>{a.bookings}</td>
              <td>{f(a.revenue)}</td>
              <td>{f(a.refunds)}</td>
              <td className="text-mint">{f(a.revenue - a.refunds)}</td>
              <td>{f(a.tax)}</td>
              <td>{f(a.fees)}</td>
            </tr>
          ))}
        </Table>
        <p className="mt-2 text-xs text-muted">IVA shown is what was charged; refunded bookings may need a credit adjustment — check with your accountant.</p>
      </section>
      <section className="grid gap-8 xl:grid-cols-2">
        <div>
          <h2 className="mb-3 text-3xl text-cyan">By vehicle / tour (ex. tax)</h2>
          <Table head={["Product", "Units / bookings", "Revenue"]} empty={!byProduct.size}>
            {[...byProduct].sort((a, b) => b[1].revenue - a[1].revenue).map(([n, p]) => (
              <tr key={n}>
                <td>{n}</td>
                <td>{p.units}</td>
                <td>{f(p.revenue)}</td>
              </tr>
            ))}
          </Table>
        </div>
        <div>
          <h2 className="mb-3 text-3xl text-cyan">By agent</h2>
          <Table head={["Agent", "Bookings", "Revenue (ex. tax)", "Finder's fees"]} empty={!byAgent.size}>
            {[...byAgent].sort((a, b) => b[1].revenue - a[1].revenue).map(([n, g]) => (
              <tr key={n}>
                <td>{n}</td>
                <td>{g.bookings}</td>
                <td>{f(g.revenue)}</td>
                <td>{f(g.fees)}</td>
              </tr>
            ))}
          </Table>
        </div>
      </section>
    </div>
  );
}
