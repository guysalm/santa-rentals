import { admin } from "./helpers";

// Release inventory held by previous e2e runs so tests are repeatable.
export default async function globalSetup() {
  const { data: customers } = await admin.from("customers").select("id").like("email", "e2e+%");
  const ids = (customers ?? []).map((c) => c.id);
  if (ids.length) {
    await admin.from("reservations").update({ status: "cancelled" }).in("customer_id", ids).in("status", ["pending_payment", "paid", "active"]);
  }
}
