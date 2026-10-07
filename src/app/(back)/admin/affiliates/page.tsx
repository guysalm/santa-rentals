import type { Metadata } from "next";
import { Suspense } from "react";
import { requireStaff } from "@/lib/auth";
import { formatUSD } from "@/lib/money";
import { SITE, waTo } from "@/lib/site";
import { db } from "@/lib/supabase/admin";
import { ActionButton, Badge, PageTitle, Skeleton } from "@/components/admin/ui";
import { approveAffiliate, markTagFeePaid, updateAffiliate } from "../_actions/affiliates";

export const metadata: Metadata = { title: "Agents" };

export default function AffiliatesPage() {
  return (
    <>
      <PageTitle title="Agents" />
      <Suspense fallback={<Skeleton />}>
        <Content />
      </Suspense>
    </>
  );
}

async function Content() {
  await requireStaff();
  const [{ data: agents }, { data: comms }, { data: clicks }] = await Promise.all([
    db().from("affiliates").select("*").order("created_at", { ascending: false }),
    db().from("commissions").select("affiliate_id, amount_cents, status"),
    db().from("affiliate_clicks").select("affiliate_id"),
  ]);
  const stat = (id: string) => {
    const mine = (comms ?? []).filter((c) => c.affiliate_id === id);
    const sum = (s: string) => mine.filter((c) => c.status === s).reduce((t, c) => t + c.amount_cents, 0);
    return {
      deals: mine.filter((c) => c.status !== "void").length,
      pending: sum("pending"),
      earned: sum("earned"),
      paid: sum("paid"),
      scans: (clicks ?? []).filter((c) => c.affiliate_id === id).length,
    };
  };
  const pending = (agents ?? []).filter((a) => a.status === "pending");
  const others = (agents ?? []).filter((a) => a.status !== "pending");

  return (
    <div className="space-y-10">
      <section>
        <h2 className="mb-3 text-3xl text-cyan">Applications ({pending.length})</h2>
        {!pending.length && <p className="text-muted">No pending applications.</p>}
        <div className="grid gap-4 xl:grid-cols-2">
          {pending.map((a) => (
            <div key={a.id} className="panel p-5">
              <p className="text-xl font-semibold">{a.full_name}</p>
              <p className="text-sm text-muted">
                {a.email} · <a className="text-mint" href={waTo(a.phone)}>{a.phone}</a> · {a.area ?? "—"} · ID {a.id_number ?? "—"} · {a.locale.toUpperCase()}
              </p>
              <p className="text-sm text-muted">
                Payout: {a.payout_method} {a.payout_details} · Keychain fee: {a.tag_fee_paid_at ? <span className="text-mint">paid</span> : <span className="text-sun">{formatUSD(a.tag_fee_cents)} unpaid</span>}
              </p>
              {a.notes && <p className="mt-2 text-sm italic text-muted">“{a.notes}”</p>}
              <form action={approveAffiliate} className="mt-4 grid gap-2 sm:grid-cols-4 sm:items-end">
                <input type="hidden" name="id" value={a.id} />
                <label className="block sm:col-span-2">
                  <span className="label !text-xs">Link slug — {SITE.url.replace(/^https?:\/\//, "")}/a/…</span>
                  <input name="slug" defaultValue={a.full_name.split(" ")[0].toLowerCase()} className="field !py-1" />
                </label>
                <label className="block">
                  <span className="label !text-xs">Fee %</span>
                  <input name="commission_rate" type="number" step="0.5" min={0} max={20} defaultValue={Number(a.commission_rate)} className="field !py-1" />
                </label>
                <label className="block">
                  <span className="label !text-xs">Client disc. %</span>
                  <input name="customer_discount" type="number" step="0.5" min={0} max={30} defaultValue={Number(a.customer_discount)} className="field !py-1" />
                </label>
                <label className="block sm:col-span-2">
                  <span className="label !text-xs">NFC tag serial</span>
                  <input name="nfc_serial" className="field !py-1" />
                </label>
                <div className="sm:col-span-2">
                  <ActionButton variant="sun" confirm={`Approve ${a.full_name} and email them their link?`}>
                    ✓ Approve & send link
                  </ActionButton>
                </div>
              </form>
              {!a.tag_fee_paid_at && (
                <form action={markTagFeePaid} className="mt-2">
                  <input type="hidden" name="id" value={a.id} />
                  <ActionButton variant="ghost">Keychain paid in cash</ActionButton>
                </form>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-3xl text-cyan">Crew ({others.length})</h2>
        <div className="space-y-3">
          {others.map((a) => {
            const s = stat(a.id);
            const link = `${SITE.url}/a/${a.slug}`;
            return (
              <details key={a.id} className="panel p-4">
                <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-6 gap-y-1">
                  <span className="w-48 font-semibold">{a.full_name}</span>
                  <Badge value={a.status} />
                  <span className="font-mono text-xs text-cyan">/a/{a.slug}</span>
                  <span className="text-xs text-muted">
                    {s.scans} scans · {s.deals} deals · {Number(a.commission_rate)}% / −{Number(a.customer_discount)}%
                  </span>
                  <span className="ml-auto text-xs">
                    pending {formatUSD(s.pending)} · <span className="text-cyan">owed {formatUSD(s.earned)}</span> · paid {formatUSD(s.paid)}
                  </span>
                </summary>
                <div className="mt-4 grid gap-4 border-t border-white/10 pt-4 lg:grid-cols-3">
                  <div className="text-sm">
                    <p>{a.email}</p>
                    <p>
                      <a className="text-mint" href={waTo(a.phone)}>
                        {a.phone}
                      </a>
                    </p>
                    <p className="mt-2 break-all text-xs text-muted">
                      NFC / QR target:{" "}
                      <a href={link} className="text-cyan">
                        {link}
                      </a>
                    </p>
                    <p className="text-xs text-muted">QR code: {link}?s=qr</p>
                  </div>
                  <form action={updateAffiliate} className="grid gap-2 sm:grid-cols-2 lg:col-span-2">
                    <input type="hidden" name="id" value={a.id} />
                    <label className="block">
                      <span className="label !text-xs">Fee %</span>
                      <input name="commission_rate" type="number" step="0.5" defaultValue={Number(a.commission_rate)} className="field !py-1" />
                    </label>
                    <label className="block">
                      <span className="label !text-xs">Client discount %</span>
                      <input name="customer_discount" type="number" step="0.5" defaultValue={Number(a.customer_discount)} className="field !py-1" />
                    </label>
                    <label className="block">
                      <span className="label !text-xs">SINPE / payout details</span>
                      <input name="payout_details" defaultValue={a.payout_details ?? ""} className="field !py-1" />
                    </label>
                    <label className="block">
                      <span className="label !text-xs">NFC serial</span>
                      <input name="nfc_serial" defaultValue={a.nfc_serial ?? ""} className="field !py-1" />
                    </label>
                    <label className="block">
                      <span className="label !text-xs">Status</span>
                      <select name="status" defaultValue={a.status} className="field !py-1">
                        <option value="approved">approved</option>
                        <option value="suspended">suspended (link stops working)</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="label !text-xs">Notes</span>
                      <input name="notes" defaultValue={a.notes ?? ""} className="field !py-1" />
                    </label>
                    <div>
                      <ActionButton variant="ghost">Save</ActionButton>
                    </div>
                  </form>
                </div>
              </details>
            );
          })}
        </div>
      </section>
    </div>
  );
}
