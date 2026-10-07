import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { requireStaff } from "@/lib/auth";
import { db } from "@/lib/supabase/admin";
import { LangFields } from "@/components/admin/LangFields";
import { ActionButton, PageTitle, Skeleton } from "@/components/admin/ui";
import { saveModel } from "../../_actions/catalog";

export const metadata: Metadata = { title: "Edit vehicle model" };

export default function EditModelPage({ params }: PageProps<"/admin/fleet/[id]">) {
  return (
    <Suspense fallback={<Skeleton />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const { id } = await params;
  const { data: m } = await db().from("vehicle_models").select("*").eq("id", id).maybeSingle();
  if (!m) notFound();
  const usd = (c: number | null) => (c == null ? "" : (c / 100).toFixed(2));
  return (
    <>
      <Link href="/admin/fleet" className="text-sm text-muted hover:text-cyan">
        ← Fleet
      </Link>
      <PageTitle title={`${m.brand} ${m.name}`}>
        <Link href={`/fleet/${m.slug}`} target="_blank" className="btn btn-ghost !py-1 !text-base">
          View public page ↗
        </Link>
      </PageTitle>
      <form action={saveModel} className="space-y-8">
        <input type="hidden" name="id" value={m.id} />
        <section className="panel grid gap-4 p-5 sm:grid-cols-4">
          {[
            ["price_8h", "8 hours (USD)", usd(m.price_8h_cents)],
            ["price_day", "Per day (USD)", usd(m.price_day_cents)],
            ["price_week", "Per week (blank = 6 × day)", usd(m.price_week_cents)],
            ["deposit", "Deposit (USD)", usd(m.deposit_cents)],
            ["min_age", "Min. age", String(m.min_age)],
            ["sort", "Sort order", String(m.sort)],
          ].map(([name, label, value]) => (
            <label key={name} className="block">
              <span className="label !text-sm">{label}</span>
              <input name={name} defaultValue={value} type="number" step="0.01" className="field" />
            </label>
          ))}
          <label className="flex items-center gap-2 self-end pb-3">
            <input type="checkbox" name="active" defaultChecked={m.active} className="h-5 w-5 accent-pink" />
            Visible on site
          </label>
        </section>

        <section className="panel p-5">
          <h2 className="mb-4 text-2xl text-sun">Photos</h2>
          <label className="block">
            <span className="label !text-sm">Image URLs (one per line, first = main photo)</span>
            <textarea name="images" defaultValue={m.images.join("\n")} className="field min-h-20 font-mono text-xs" />
          </label>
          <label className="mt-3 block">
            <span className="label !text-sm">Upload new photos (JPG/PNG/WebP, landscape ~1600px; under 4 MB total per save)</span>
            <input type="file" name="upload" multiple accept="image/*" className="text-sm" />
          </label>
        </section>

        <section className="panel p-5">
          <h2 className="mb-4 text-2xl text-sun">Copy & SEO</h2>
          <LangFields
            content={m.content as Record<string, Record<string, unknown>>}
            fields={[
              { key: "tagline", label: "Tagline" },
              { key: "description", label: "Description", type: "textarea" },
              { key: "highlights", label: "Highlights", type: "lines" },
              { key: "seoTitle", label: "SEO title", hint: "≈ 50–60 characters, include 'Santa Teresa'" },
              { key: "seoDescription", label: "SEO description", type: "textarea", hint: "≈ 140–160 characters" },
            ]}
          />
        </section>
        <ActionButton variant="sun">Save & publish</ActionButton>
      </form>
    </>
  );
}
