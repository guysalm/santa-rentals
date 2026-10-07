import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { requireStaff } from "@/lib/auth";
import { crToday } from "@/lib/booking";
import { db } from "@/lib/supabase/admin";
import { LangFields } from "@/components/admin/LangFields";
import { ActionButton, PageTitle, Skeleton } from "@/components/admin/ui";
import { saveTour, setDeparture } from "../../_actions/catalog";

export const metadata: Metadata = { title: "Edit tour" };
const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function EditTourPage({ params }: PageProps<"/admin/tours/[id]">) {
  return (
    <Suspense fallback={<Skeleton />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  await connection();
  const { id } = await params;
  const { data: t } = await db().from("tours").select("*").eq("id", id).maybeSingle();
  if (!t) notFound();
  const { data: departures } = await db().from("tour_departures").select("id, departs_on, capacity, closed").eq("tour_id", id).gte("departs_on", crToday()).order("departs_on").limit(30);
  const seats = await Promise.all((departures ?? []).map((d) => db().rpc("tour_seats_taken", { p_departure: d.id })));

  return (
    <>
      <Link href="/admin/tours" className="text-sm text-muted hover:text-cyan">
        ← Tours
      </Link>
      <PageTitle title={(t.content as { en?: { title?: string } })?.en?.title ?? t.slug}>
        <Link href={`/tours/${t.slug}`} target="_blank" className="btn btn-ghost !py-1 !text-base">
          View public page ↗
        </Link>
      </PageTitle>

      <form action={saveTour} className="space-y-8">
        <input type="hidden" name="id" value={t.id} />
        <section className="panel grid gap-4 p-5 sm:grid-cols-4">
          <label className="block">
            <span className="label !text-sm">Price per person (USD)</span>
            <input name="price" type="number" step="0.01" defaultValue={(t.price_cents / 100).toFixed(2)} className="field" />
          </label>
          <label className="block">
            <span className="label !text-sm">Min group</span>
            <input name="min_pax" type="number" defaultValue={t.min_pax} className="field" />
          </label>
          <label className="block">
            <span className="label !text-sm">Max group (default capacity)</span>
            <input name="max_pax" type="number" defaultValue={t.max_pax} className="field" />
          </label>
          <label className="block">
            <span className="label !text-sm">Duration (hours)</span>
            <input name="duration" type="number" step="0.5" defaultValue={Number(t.duration_hours)} className="field" />
          </label>
          <label className="block">
            <span className="label !text-sm">Start time</span>
            <input name="start_time" type="time" defaultValue={String(t.start_time).slice(0, 5)} className="field" />
          </label>
          <label className="block">
            <span className="label !text-sm">Difficulty (1–5 stars)</span>
            <input name="difficulty" type="number" min={1} max={5} defaultValue={t.difficulty} className="field" />
          </label>
          <fieldset className="sm:col-span-2">
            <legend className="label !text-sm">Runs on</legend>
            <div className="flex flex-wrap gap-3">
              {DAY.map((d, i) => (
                <label key={d} className="flex items-center gap-1 text-sm">
                  <input type="checkbox" name="days" value={i} defaultChecked={t.days_of_week.includes(i)} className="accent-pink" /> {d}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="active" defaultChecked={t.active} className="h-5 w-5 accent-pink" /> Visible on site
          </label>
        </section>
        <section className="panel p-5">
          <h2 className="mb-4 text-2xl text-sun">Photos</h2>
          <textarea name="images" defaultValue={t.images.join("\n")} className="field min-h-16 font-mono text-xs" placeholder="Image URLs, one per line" />
          <input type="file" name="upload" multiple accept="image/*" className="mt-3 text-sm" />
        </section>
        <section className="panel p-5">
          <h2 className="mb-4 text-2xl text-sun">Copy & SEO</h2>
          <LangFields
            content={t.content as Record<string, Record<string, unknown>>}
            fields={[
              { key: "title", label: "Title" },
              { key: "summary", label: "Summary", type: "textarea" },
              { key: "description", label: "Description", type: "textarea" },
              { key: "itinerary", label: "Itinerary", type: "lines" },
              { key: "includes", label: "Included", type: "lines" },
              { key: "bring", label: "What to bring", type: "lines" },
              { key: "seoTitle", label: "SEO title" },
              { key: "seoDescription", label: "SEO description", type: "textarea" },
            ]}
          />
        </section>
        <ActionButton variant="sun">Save & publish</ActionButton>
      </form>

      <section className="panel mt-10 p-5">
        <h2 className="mb-3 text-2xl text-sun">Departures</h2>
        <p className="mb-4 text-sm text-muted">Departures are created automatically when the first person books. Close a date (weather, no guide) or change its capacity here.</p>
        <form action={setDeparture} className="mb-6 flex flex-wrap items-end gap-2">
          <input type="hidden" name="tour_id" value={t.id} />
          <input type="date" name="date" min={crToday()} required className="field !w-44" />
          <input type="number" name="capacity" placeholder={`capacity (${t.max_pax})`} className="field !w-36" />
          <select name="closed" className="field !w-36">
            <option value="1">Close date</option>
            <option value="0">Open date</option>
          </select>
          <ActionButton variant="ghost">Apply</ActionButton>
        </form>
        <ul className="space-y-1 text-sm">
          {(departures ?? []).map((d, i) => (
            <li key={d.id} className={d.closed ? "text-pink" : ""}>
              {d.departs_on} ({DAY[new Date(`${d.departs_on}T12:00:00Z`).getUTCDay()]}) · {seats[i].data ?? 0}/{d.capacity} booked {d.closed && "· CLOSED"}
            </li>
          ))}
          {!departures?.length && <li className="text-muted">No upcoming departures with bookings.</li>}
        </ul>
      </section>
    </>
  );
}
