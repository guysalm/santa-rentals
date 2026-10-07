import { expect, test, type Page } from "@playwright/test";
import { admin, CRON_SECRET, crDate, LICENSE_PNG, uniqueEmail } from "./helpers";

const MAILPIT = "http://127.0.0.1:54324";

/** Log in through the real magic-link flow, reading the email from local Mailpit. */
async function magicLogin(page: Page, email: string) {
  const since = Date.now();
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByRole("button", { name: /Send magic link/ }).click();
  await expect(page.getByText(/login link is on its way/)).toBeVisible();
  let link: string | undefined;
  for (let i = 0; i < 30 && !link; i++) {
    const res = await fetch(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:"${email}"`)}`);
    const { messages } = (await res.json()) as { messages: { ID: string; Created: string }[] };
    const latest = messages?.find((m) => new Date(m.Created).getTime() >= since - 2000);
    if (latest) {
      const msg = (await (await fetch(`${MAILPIT}/api/v1/message/${latest.ID}`)).json()) as { HTML: string; Text: string };
      link = /(http[^"'\s]+\/auth\/v1\/verify[^"'\s]+)/.exec(msg.HTML || msg.Text)?.[1]?.replace(/&amp;/g, "&");
    }
    if (!link) await page.waitForTimeout(1000);
  }
  expect(link, "magic link email").toBeTruthy();
  await page.goto(link!);
}

test("agent program: apply → approve → tagged booking → commission → Monday payout → paid", async ({ page, browser }) => {
  test.setTimeout(400_000);
  const agentEmail = uniqueEmail("agent");
  const slug = `e2e${Date.now().toString(36)}`;

  // 1 · Apply
  await page.goto("/become-an-affiliate");
  await page.getByLabel("Full name").fill(`Ana ${slug}`);
  await page.getByLabel("Email").fill(agentEmail);
  await page.getByLabel("WhatsApp number").fill("+506 8888 0000");
  await page.getByLabel(/SINPE Móvil number/).fill("8888 0000");
  await page.getByLabel(/Where do you work/).fill("Surf school, Playa Carmen");
  await page.getByLabel("Pay cash when I pick it up").check();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /Send application/ }).click();
  await expect(page.getByRole("heading", { name: "Application received!" })).toBeVisible();
  const { data: applicant } = await admin.from("affiliates").select("id, status").eq("email", agentEmail).single();
  expect(applicant!.status).toBe("pending");

  // 2 · Admin logs in (account created like `npm run make-admin`)
  const adminEmail = uniqueEmail("admin");
  const { data: created } = await admin.auth.admin.createUser({ email: adminEmail, email_confirm: true });
  await admin.from("profiles").upsert({ id: created.user!.id, role: "admin" });
  await magicLogin(page, adminEmail);
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  // 3 · Approve the agent with a custom slug, 10% fee, 10% discount
  await page.goto("/admin/affiliates");
  const card = page.locator(".panel", { hasText: agentEmail });
  await card.getByLabel(/Link slug/).fill(slug);
  await card.getByLabel("Fee %").fill("10");
  await card.getByLabel(/Client disc/).fill("10");
  page.once("dialog", (d) => d.accept());
  await card.getByRole("button", { name: /Approve & send link/ }).click();
  await expect.poll(async () => (await admin.from("affiliates").select("status").eq("id", applicant!.id).single()).data?.status).toBe("approved");

  // 4 · A customer taps the keychain (new browser context = new visitor)
  const customer = await browser.newContext();
  const cp = await customer.newPage();
  await cp.goto(`/a/${slug}`);
  await expect(cp.getByText(/Agent Ana's crew: 10% off/)).toBeVisible();
  await cp.goto(`/book?model=honda-crf250f&date=${crDate(25)}`);
  await expect(cp.getByText(/\d+ left/).first()).toBeVisible();
  await cp.getByLabel(/Delivery address/).fill("Hotel Test");
  await cp.getByLabel(/Full name/).fill("Tagged Customer");
  await cp.getByLabel(/^Email/).fill(uniqueEmail("tagged"));
  await cp.getByLabel(/WhatsApp number/).fill("+1 555 000 3333");
  await cp.locator('input[type="file"]').setInputFiles(LICENSE_PNG);
  await cp.getByRole("checkbox").check();
  await cp.getByLabel(/Type your full name/).fill("Tagged Customer");
  // $80 − 10% = $72 + 13% IVA = $81.36
  await expect(cp.getByText("Agent Ana −10%")).toBeVisible();
  await cp.getByRole("button", { name: /Pay \$81\.36/ }).click();
  await expect(cp.getByRole("heading", { name: "Mission passed!" })).toBeVisible();
  const code = (await cp.locator(".hud-money").first().textContent())!.trim();
  await customer.close();

  // 5 · Commission recorded: 10% of $72 = $7.20, pending
  const { data: res } = await admin.from("reservations").select("id").eq("code", code).single();
  const { data: comm } = await admin.from("commissions").select("amount_cents, status").eq("reservation_id", res!.id).single();
  expect(comm).toEqual({ amount_cents: 720, status: "pending" });

  // 6 · Rental finishes → Monday job batches the earned fee
  await admin.from("reservations").update({ status: "completed" }).eq("id", res!.id);
  const cron = await page.request.get("/api/cron/weekly-payouts", { headers: { Authorization: `Bearer ${CRON_SECRET}` } });
  expect(cron.ok()).toBeTruthy();
  const { data: payout } = await admin.from("payouts").select("id, amount_cents, status").eq("affiliate_id", applicant!.id).single();
  expect(payout).toMatchObject({ amount_cents: 720, status: "pending" });
  expect((await page.request.get("/api/cron/weekly-payouts")).status()).toBe(401); // secret required

  // 7 · Admin pays by SINPE and records the reference
  await page.goto("/admin/payouts");
  const row = page.locator("tr", { hasText: `Ana ${slug}` });
  await row.getByPlaceholder("SINPE ref #").fill("SINPE-123456");
  page.once("dialog", (d) => d.accept());
  await row.getByRole("button", { name: "Paid" }).click();
  await expect.poll(async () => (await admin.from("commissions").select("status").eq("reservation_id", res!.id).single()).data?.status).toBe("paid");

  // 8 · Agent sees it on their dashboard
  const agentCtx = await browser.newContext();
  const ap = await agentCtx.newPage();
  await magicLogin(ap, agentEmail);
  await expect(ap).toHaveURL(/\/agent$/);
  await expect(ap.getByText(`/a/${slug}`).first()).toBeVisible();
  await expect(ap.getByText("SINPE-123456")).toBeVisible();
  await agentCtx.close();
});

test("back office is protected", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login\?next=%2Fadmin/);
  expect((await page.request.get("/api/admin/export")).status()).toBe(401);
});
