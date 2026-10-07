import type { Metadata } from "next";
import { Suspense } from "react";
import { requireStaff } from "@/lib/auth";
import { formatUSD } from "@/lib/money";
import { db } from "@/lib/supabase/admin";
import { ActionButton, Badge, Money, PageTitle, Skeleton, Table } from "@/components/admin/ui";
import { payPayout, runWeeklyNow } from "../_actions/affiliates";

export const metadata: Metadata = { title: "Payouts" };

export default function PayoutsPage() {
  return (
    <>
      <PageTitle title="Agent payouts">
        <form action={runWeeklyNow}>
          <ActionButton variant="ghost" confirm="Build this week's balance sheet now and email every agent their statement?">
            Run Monday statement now
          </ActionButton>
        </form>
      </PageTitle>
      <p className="mb-6 max-w-3xl text-sm text-muted">
        Every Monday 08:00 (Costa Rica) finished bookings release their finder&apos;s fees, and everything earned is grouped into one payout per agent. Each agent gets a statement email; you get the balance sheet with a CSV. Pay each agent by SINPE Móvil, then mark the payout paid with the reference — the agent gets a receipt.
      </p>
      <Suspense fallback={<Skeleton />}>
        <Content />
      </Suspense>
    </>
  );
}

async function Content() {
  await requireStaff();
  const [{ data: pending }, { data: history }, { data: unbatched }] = await Promise.all([
    db().from("payouts").select("*, affiliate:affiliates(full_name, phone, payout_method, payout_details)").eq("status", "pending").order("period_end"),
    db().from("payouts").select("*, affiliate:affiliates(full_name)").eq("status", "paid").order("paid_at", { ascending: false }).limit(50),
    db().from("commissions").select("amount_cents, status").is("payout_id", null).in("status", ["pending", "earned"]),
  ]);
  const sum = (s: string) => (unbatched ?? []).filter((c) => c.status === s).reduce((t, c) => t + c.amount_cents, 0);
  type Aff = { full_name: string; phone?: string; payout_method?: string; payout_details?: string | null };

  return (
    <div className="space-y-10">
      <p className="text-sm">
        Not yet batched: <span className="text-sun">{formatUSD(sum("pending"))}</span> pending (bookings not finished) ·{" "}
        <span className="text-cyan">{formatUSD(sum("earned"))}</span> earned (joins next Monday&apos;s batch)
      </p>
      <section>
        <h2 className="mb-3 text-3xl text-cyan">To pay</h2>
        <Table head={["Agent", "Week", "SINPE / payout", "Amount", "Mark paid"]} empty={!pending?.length}>
          {(pending ?? []).map((p) => {
            const a = p.affiliate as Aff;
            return (
              <tr key={p.id}>
                <td>
                  {a.full_name}
                  <div className="text-xs text-muted">{a.phone}</div>
                </td>
                <td className="text-xs">
                  {p.period_start} → {p.period_end}
                </td>
                <td className="font-mono text-xs">
                  {a.payout_method}: {a.payout_details ?? "—"}
                </td>
                <td>
                  <Money cents={p.amount_cents} className="hud-money text-2xl" />
                </td>
                <td>
                  <form action={payPayout} className="flex gap-2">
                    <input type="hidden" name="id" value={p.id} />
                    <input name="reference" required placeholder="SINPE ref #" className="field !w-36 !py-1" />
                    <ActionButton variant="sun" confirm={`Confirm you sent ${formatUSD(p.amount_cents, { decimals: true })} to ${a.full_name}?`}>
                      Paid
                    </ActionButton>
                  </form>
                </td>
              </tr>
            );
          })}
        </Table>
      </section>
      <section>
        <h2 className="mb-3 text-3xl text-cyan">History</h2>
        <Table head={["Agent", "Week", "Amount", "Reference", "Paid", ""]} empty={!history?.length}>
          {(history ?? []).map((p) => (
            <tr key={p.id}>
              <td>{(p.affiliate as Aff).full_name}</td>
              <td className="text-xs">
                {p.period_start} → {p.period_end}
              </td>
              <td>
                <Money cents={p.amount_cents} />
              </td>
              <td className="font-mono text-xs">{p.reference}</td>
              <td className="text-xs">{p.paid_at?.slice(0, 10)}</td>
              <td>
                <Badge value="paid" />
              </td>
            </tr>
          ))}
        </Table>
      </section>
    </div>
  );
}
