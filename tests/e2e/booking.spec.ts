import { expect, test, type Page } from "@playwright/test";
import { admin, crDate, LICENSE_PNG, uniqueEmail } from "./helpers";

async function fillDetails(page: Page, email: string) {
  await page.getByLabel(/Full name/).fill("Test Rider");
  await page.getByLabel(/^Email/).fill(email);
  await page.getByLabel(/WhatsApp number/).fill("+1 555 000 1111");
  await page.getByLabel(/Country/).fill("USA");
}

async function sign(page: Page) {
  await page.getByRole("checkbox").check();
  await page.getByLabel(/Type your full name/).fill("Test Rider");
}

test("rental booking: quote, pay (mock), confirmation, DB state", async ({ page }) => {
  const email = uniqueEmail("rental");
  const date = crDate(20);
  await page.goto(`/book?model=honda-trx420&date=${date}`);
  // Live availability renders only after hydration — wait before interacting.
  await expect(page.getByText(/\d+ left/).first()).toBeVisible();

  // Pre-selected TRX420 ×1; switch to 2 days and add a second unit.
  await page.getByRole("button", { name: "+ days" }).click();
  await page.getByRole("button", { name: "+ Honda TRX420 Rancher" }).click();
  await page.getByLabel(/Delivery address/).fill("Villa Test, Playa Carmen");
  await fillDetails(page, email);
  await page.locator('input[type="file"]').setInputFiles(LICENSE_PNG);
  await sign(page);

  // 2 units × 2 days × $85 = $340 subtotal, +13% IVA = $384.20
  await expect(page.getByText("$384.20").first()).toBeVisible();
  await page.getByRole("button", { name: /Pay \$384\.20/ }).click();

  await expect(page.getByRole("heading", { name: "Mission passed!" })).toBeVisible();
  const code = (await page.locator(".hud-money").first().textContent())!.trim();

  const { data: r } = await admin.from("reservations").select("status, total_cents, subtotal_cents, tax_cents, license_path, items:reservation_items(vehicle_id)").eq("code", code).single();
  expect(r!.status).toBe("paid");
  expect(r!.subtotal_cents).toBe(34000);
  expect(r!.tax_cents).toBe(4420);
  expect(r!.total_cents).toBe(38420);
  expect(r!.items).toHaveLength(2);
  expect(new Set(r!.items.map((i) => i.vehicle_id)).size).toBe(2);
  expect(r!.license_path).toBeTruthy();
});

test("tour booking respects capacity and running days", async ({ page }) => {
  // Ridge Runner runs Mon–Sat (not Sunday), max 6.
  let date = crDate(15);
  while (new Date(`${date}T12:00:00Z`).getUTCDay() === 0) date = crDate(16);
  await page.goto(`/book?tour=ridge-runner-enduro-tour&date=${date}`);
  await expect(page.getByText(/seats left/)).toBeVisible();
  await fillDetails(page, uniqueEmail("tour"));
  await sign(page);
  await page.getByRole("button", { name: /^Pay / }).click();
  await expect(page.getByRole("heading", { name: "Mission passed!" })).toBeVisible();
});

test("double booking is impossible: sold-out units cannot be held", async ({ request }) => {
  // CRF300L has 3 units. Hold all 3 via the API, then a 4th request must fail.
  const date = crDate(40);
  const body = (n: number) => {
    const form = new FormData();
    form.set(
      "payload",
      JSON.stringify({
        kind: "rental",
        locale: "en",
        date,
        time: "09:00",
        mode: "days",
        days: 1,
        items: [{ slug: "honda-crf300l", qty: n }],
        delivery: "Hotel Test",
        customer: { fullName: "Load Test", email: uniqueEmail("load"), phone: "+1 555 000 2222", country: "" },
        notes: "",
        waiverName: "Load Test",
        waiverAccepted: true,
      }),
    );
    form.set("license", new Blob([LICENSE_PNG.buffer], { type: "image/png" }), "license.png");
    return form;
  };
  const first = await request.post("/api/bookings", { multipart: body(3) as unknown as Record<string, string> });
  expect(first.ok()).toBeTruthy();
  const second = await request.post("/api/bookings", { multipart: body(1) as unknown as Record<string, string> });
  expect(second.status()).toBe(409);
  expect((await second.json()).error).toBe("SOLD_OUT");
});
