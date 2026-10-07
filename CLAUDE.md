# santa.rentals

ATV / dirt bike rental + tours site for Santa Teresa, Costa Rica: public SEO site (EN + ES),
online booking with payment, admin backend, and an affiliate (agent/NFC keychain) program.

@AGENTS.md

## Stack
- Next.js 16 App Router with **Cache Components** (`cacheComponents: true`). Read the bundled
  docs in `node_modules/next/dist/docs/` before using an API — `middleware` is `src/proxy.ts`,
  `params`/`cookies()` are async, `new Date()` can't run in prerendered code, catalog reads use
  `"use cache"` + `cacheTag(CATALOG_TAG)` (invalidate after admin edits).
- Supabase (Postgres + Auth + Storage). Schema: `supabase/migrations/`. `supabase/seed.sql` is
  GENERATED from `src/content/catalog.ts` (`npm run seed:gen`) — edit the TS, not the SQL.
- Stripe Checkout behind `src/lib/payments/` (swappable for ONVO/Tilopay). Resend for email.
- Tailwind v4, tokens in `src/app/globals.css`: neon pink `#FF007F`, neon cyan `#00F3FF`, sunset gradients,
  rounded neon-glow cards (`.panel`, `.panel-pink`), `.gradient-bar`, `.headline`.

## Trademark / copyright rules (public repo + public site)
- Retro-80s look only. Never use a game/film/brand name, logo, font (e.g. Pricedown), screenshot or
  character in code, copy, metadata or assets — including comments and class names.
- All artwork is original: `scripts/gen-art.ts` → `public/images/` (`npm run art:gen`), and the map in
  `src/components/CoastMap.tsx`. Fonts are OFL Google Fonts. Social icons are generic outlines.
- Real photos must be the business's own (uploaded in /admin) or properly licensed — they replace
  the illustrations automatically via `src/lib/images.ts`.

## Conventions
- Money is integer cents (USD). Costa Rica time is fixed UTC-6 (`SITE.tzOffset`).
- English is unprefixed, Spanish under `/es`; the proxy rewrites `/x` → `/en/x` and 308s `/en/x` → `/x`.
  Every public page lives under `src/app/[lang]/`, calls `resolveLang(params)` and `pageMetadata()`.
  UI strings: `src/dictionaries/{en,es}.ts` (es is type-checked against en).
- Pricing/cancellation/commission math are pure functions in `src/lib/pricing.ts` and
  `src/lib/policy.ts` — the server always recomputes prices; never trust client amounts.
- Double booking is prevented by the exclusion constraint on `reservation_items`.

## Commands (Node is at C:\Program Files\nodejs — add to PATH in Git Bash)
- `npm run dev` (port 3100 — 3000 is used by agent-project)
- `npm run db:start` / `npm run db:reset` (local Supabase via Docker) · `npm run db:types`
- `npm run typecheck` · `npm run lint` · `npm test` · `npm run test:e2e`
- In Git Bash set `MSYS_NO_PATHCONV=1` when passing URL paths like `/fleet` as arguments.
