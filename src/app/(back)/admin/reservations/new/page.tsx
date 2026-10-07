import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { requireStaff } from "@/lib/auth";
import { crToday } from "@/lib/booking";
import { getModels } from "@/lib/catalog";
import { ActionButton, PageTitle, Skeleton } from "@/components/admin/ui";
import { createManualBooking } from "../../_actions/reservations";

export const metadata: Metadata = { title: "Walk-in booking" };

export default function NewBookingPage() {
  return (
    <>
      <PageTitle title="Walk-in booking" />
      <Suspense fallback={<Skeleton />}>
        <Content />
      </Suspense>
    </>
  );
}

async function Content() {
  await requireStaff();
  await connection();
  const models = await getModels();
  return (
    <form action={createManualBooking} className="panel grid max-w-3xl gap-4 p-6 sm:grid-cols-2">
      <p className="text-sm text-muted sm:col-span-2">
        For customers paying cash or SINPE at the shop. Price follows the current rate card; availability is checked and a unit is assigned automatically. Have them sign the paper waiver.
      </p>
      <label className="block">
        <span className="label">Vehicle</span>
        <select name="model" className="field" required>
          {models.map((m) => (
            <option key={m.id} value={m.slug}>
              {m.brand} {m.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="label">Quantity</span>
        <input name="qty" type="number" min={1} max={10} defaultValue={1} className="field" />
      </label>
      <label className="block">
        <span className="label">Date</span>
        <input name="date" type="date" defaultValue={crToday()} className="field" required />
      </label>
      <label className="block">
        <span className="label">Pickup time</span>
        <input name="time" type="time" defaultValue="09:00" className="field" required />
      </label>
      <label className="block">
        <span className="label">Duration</span>
        <select name="mode" className="field">
          <option value="days">Full days</option>
          <option value="8h">8 hours</option>
        </select>
      </label>
      <label className="block">
        <span className="label">Days</span>
        <input name="days" type="number" min={1} max={30} defaultValue={1} className="field" />
      </label>
      <label className="block">
        <span className="label">Customer name</span>
        <input name="name" className="field" required />
      </label>
      <label className="block">
        <span className="label">Phone / WhatsApp</span>
        <input name="phone" className="field" />
      </label>
      <label className="block">
        <span className="label">Email (optional)</span>
        <input name="email" type="email" className="field" />
      </label>
      <label className="block">
        <span className="label">Paid by</span>
        <select name="method" className="field">
          <option value="cash">Cash</option>
          <option value="sinpe">SINPE Móvil</option>
          <option value="card-terminal">Card terminal</option>
        </select>
      </label>
      <label className="block sm:col-span-2">
        <span className="label">Delivery / notes</span>
        <input name="delivery" placeholder="Pickup at shop" className="field" />
      </label>
      <div className="sm:col-span-2">
        <ActionButton variant="sun">Create paid booking</ActionButton>
      </div>
    </form>
  );
}
