# santa.rentals 🌴

ATV, dirt bike & tour rentals in **Santa Teresa, Costa Rica** — public SEO site (EN/ES), instant
online booking with payment, admin backend, and an NFC-keychain agent (affiliate) program.

**Stack:** Next.js 16 (App Router, Cache Components) · Supabase (Postgres, Auth, Storage) ·
Stripe Checkout · Resend · Vercel (hosting + cron) · Tailwind v4.

---

## What's inside

| Area | Where |
|---|---|
| Public site, SEO pages (EN unprefixed, ES under `/es`) | `src/app/[lang]/` |
| Booking wizard → `/api/bookings` → Stripe Checkout → webhook | `src/components/booking/`, `src/lib/booking.ts`, `src/lib/fulfillment.ts` |
| Pricing / cancellation / commission rules (pure, unit-tested) | `src/lib/pricing.ts`, `src/lib/policy.ts` |
| Admin (`/admin`) and agent dashboard (`/agent`) | `src/app/(back)/` |
| Agent NFC/QR link `santa.rentals/a/{slug}` | `src/app/a/[slug]/route.ts` |
| Emails (confirmation + .ics, agent deal + balance, Monday statements) | `src/lib/email/` |
| Cron: daily completion, **Monday 08:00 CR** payouts | `vercel.json`, `src/app/api/cron/` |
| Database schema, booking/commission SQL functions | `supabase/migrations/` |
| Launch catalog (vehicles, tours, prices) → `supabase/seed.sql` | `src/content/catalog.ts` + `npm run seed:gen` |

### How the agent program works
1. Applicant fills `/become-an-affiliate` (keychain fee online via Stripe or cash).
2. Admin approves in **Admin → Agents**: picks the link slug, fee %, client discount %, NFC serial.
   The agent gets an email with their link and a login.
3. Program the NFC keychain with `https://santa.rentals/a/{slug}` (any NFC tools app, NTAG213+).
   Use `…/a/{slug}?s=qr` for printed QR codes so scans are counted separately.
4. Tapping sets a 30-day attribution cookie; the customer sees the discount banner and gets the
   discount at checkout automatically (last agent tapped wins).
5. On payment the commission is **pending** and the agent gets a "new deal" email with their balance.
   When the rental/tour finishes it becomes **earned**; cancelled bookings void it (the
   cancellation fee is still kept by the business).
6. **Every Monday 08:00 (Costa Rica)** earned fees are batched per agent; each agent gets a statement,
   admins get the balance sheet + CSV of SINPE numbers. Pay by SINPE Móvil, then **Admin → Payouts →
   Paid** with the reference — the agent gets a receipt.

---

## Local development

Requires Node 20.9+, Docker Desktop, and (optionally) the Stripe CLI.

```bash
npm install
npm run db:start                      # local Supabase (Docker); applies migrations + seed
npx supabase status -o env            # copy ANON_KEY / SERVICE_ROLE_KEY into .env.local
cp .env.example .env.local            # then fill in the keys
npm run make-admin -- you@example.com # create your admin login
npm run dev                           # http://localhost:3100
```

- Magic-link emails locally land in **Mailpit**: http://127.0.0.1:54324
- **Payments locally:** either set `PAYMENTS_PROVIDER=mock` (instant fake checkout; never active in
  production), or use Stripe test mode: set `STRIPE_SECRET_KEY=sk_test_…`, run
  `stripe listen --forward-to localhost:3100/api/webhooks/stripe` and put the printed `whsec_…` in
  `STRIPE_WEBHOOK_SECRET`. Test card: `4242 4242 4242 4242`.
- Without `RESEND_API_KEY` emails are printed to the dev server log.

```bash
npm run typecheck && npm run lint
npm test            # pricing / cancellation / commission unit tests
npm run test:e2e    # Playwright: booking, double-booking guard, full agent program (needs mock payments)
npm run db:reset    # wipe local DB → migrations + seed
npm run db:types    # regenerate src/lib/database.types.ts after schema changes
```

---

## Deploying (first time)

1. **Supabase** — create a project (region: `us-east-1` is closest to Costa Rica).
   `npx supabase link --project-ref <ref>` → `npx supabase db push` → run `supabase/seed.sql` once in
   the SQL editor. In Auth → URL configuration set Site URL `https://santa.rentals` and redirect
   `https://santa.rentals/**`. Configure SMTP (Resend) for auth emails.
2. **Stripe** — ⚠ Stripe does not onboard Costa Rican companies; open the account with a US entity
   (existing LLC or Stripe Atlas). Otherwise implement `src/lib/payments/` for ONVO Pay or Tilopay.
   Add a webhook endpoint `https://santa.rentals/api/webhooks/stripe` for
   `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.expired`.
   Enable Apple Pay / Google Pay in Payment methods.
3. **Resend** — add and verify the `santa.rentals` domain (DNS records), sender `bookings@santa.rentals`.
4. **Vercel** — import the GitHub repo, add the env vars from `.env.example` (production values,
   `NEXT_PUBLIC_SITE_URL=https://santa.rentals`, a long random `CRON_SECRET`), deploy, then add the
   domain `santa.rentals` (+ redirect `www`). Crons in `vercel.json` start automatically.
5. `npm run make-admin -- you@yourmail.com` against production env, log in at `/login`, and set
   **Admin → Settings → Admin notification emails**.

---

## Launch checklist

**Replace placeholders** (`src/lib/site.ts`): phone, WhatsApp number, exact address & GPS, Instagram.
They must match the Google Business Profile exactly.

**Business & legal**
- [ ] Have a Costa Rican attorney review `src/content/pages.ts` (rental agreement / waiver, terms,
      privacy). Bump `WAIVER_VERSION` when it changes.
- [ ] Confirm insurance wording in `src/content/faq.ts` (SOA, deposit coverage) and deposit amounts.
- [ ] Confirm IVA registration (13%) with your accountant; reports show IVA collected per month.
- [ ] Real fleet: Admin → Fleet — set unit counts, plates, prices; upload photos (landscape, ~1600px).
- [ ] Real tour schedule and prices: Admin → Tours.

**SEO**
- [ ] Google Search Console: verify domain, submit `https://santa.rentals/sitemap.xml`.
- [ ] Google Business Profile ("ATV rental agency" + "Tour operator"), same NAP as the site, link to
      `/` and `/book`, add photos weekly, ask every customer for a review (link it in the
      confirmation email once you have the review URL).
- [ ] TripAdvisor + GetYourGuide/Viator listings for the tours (they rank for "things to do").
- [ ] Partner pages: ask hotels/villas/surf schools to link to you — and recruit them as agents.
- [ ] Test rich results: https://search.google.com/test/rich-results (home, a fleet page, a tour).
- [ ] Add real photos — pages currently use neon line-art placeholders; photos lift CTR and conversions.
- [ ] Publish a new guide every couple of weeks (`src/content/guides.ts`): routes, tides, events.

**Agents**
- [ ] Order NTAG213/215 NFC keychains; program each with its agent's link; record the serial in admin.
- [ ] Set keychain price and default rates in Admin → Settings.

---

## Competitor snapshot (Oct 2026)

ATVs $70–90/day (8h ≈ $10 less), dirt bikes $70–90, scooters $45–60, $500 deposit typical, free
delivery standard. Guided ATV tours $119 (2h) – $280 (full day). **No local competitor takes instant
online payment** — they book via WhatsApp or request forms. That's the edge: live availability +
pay now + instant confirmation.
