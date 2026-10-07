-- santa.rentals core schema
-- Money is stored as integer cents (USD). Times are timestamptz (business TZ: America/Costa_Rica).

create extension if not exists btree_gist;
create extension if not exists pgcrypto;

-- ───────────────────────── enums ─────────────────────────
create type app_role            as enum ('admin', 'staff', 'agent');
create type vehicle_type        as enum ('atv', 'dirtbike', 'scooter', 'utv');
create type vehicle_status      as enum ('available', 'maintenance', 'retired');
create type tour_category       as enum ('atv-tour', 'dirt-bike-tour', 'camping', 'day-tour');
create type reservation_kind    as enum ('rental', 'tour');
create type reservation_status  as enum ('pending_payment', 'paid', 'active', 'completed', 'cancelled', 'no_show', 'expired');
create type affiliate_status    as enum ('pending', 'approved', 'suspended');
create type commission_status   as enum ('pending', 'earned', 'paid', 'void');
create type payout_status       as enum ('pending', 'paid');

-- ───────────────────────── users ─────────────────────────
create table profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  role        app_role not null default 'agent',
  full_name   text,
  created_at  timestamptz not null default now()
);

create or replace function has_role(roles app_role[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles p where p.id = auth.uid() and p.role = any (roles));
$$;

create or replace function is_staff()
returns boolean language sql stable as $$ select has_role(array['admin','staff']::app_role[]); $$;

-- ───────────────────────── settings ─────────────────────────
create table settings (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now()
);

-- ───────────────────────── fleet ─────────────────────────
create table vehicle_models (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  type              vehicle_type not null,
  brand             text not null,
  name              text not null,
  engine_cc         int,
  seats             int not null default 1,
  transmission      text,               -- 'automatic' | 'semi-automatic' | 'manual'
  min_age           int not null default 18,
  price_8h_cents    int not null check (price_8h_cents >= 0),
  price_day_cents   int not null check (price_day_cents >= 0),
  price_week_cents  int check (price_week_cents >= 0),  -- null → 6 × day
  deposit_cents     int not null default 50000,
  images            text[] not null default '{}',
  content           jsonb not null default '{}',  -- { en: {tagline, description, highlights[], seoTitle, seoDescription}, es: {...} }
  specs             jsonb not null default '{}',
  sort              int not null default 0,
  active            boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table vehicles (
  id          uuid primary key default gen_random_uuid(),
  model_id    uuid not null references vehicle_models (id) on delete restrict,
  label       text not null,          -- e.g. "TRX420 #3"
  plate       text,
  vin         text,
  color       text,
  odometer_km int,
  status      vehicle_status not null default 'available',
  notes       text,
  created_at  timestamptz not null default now()
);
create index on vehicles (model_id) where status = 'available';

create table maintenance_logs (
  id           uuid primary key default gen_random_uuid(),
  vehicle_id   uuid not null references vehicles (id) on delete cascade,
  performed_on date not null default current_date,
  description  text not null,
  cost_cents   int,
  odometer_km  int,
  created_at   timestamptz not null default now()
);

create table seasons (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  start_date  date not null,
  end_date    date not null,
  multiplier  numeric(4,2) not null default 1.00 check (multiplier > 0),
  check (end_date >= start_date)
);

-- ───────────────────────── tours ─────────────────────────
create table tours (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  category         tour_category not null,
  duration_hours   numeric(5,1) not null,
  overnight        boolean not null default false,
  start_time       time not null default '08:00',
  days_of_week     int[] not null default '{0,1,2,3,4,5,6}',  -- 0 = Sunday
  price_cents      int not null check (price_cents >= 0),       -- per person
  min_pax          int not null default 2,
  max_pax          int not null default 8,
  difficulty       int not null default 2 check (difficulty between 1 and 5),
  images           text[] not null default '{}',
  content          jsonb not null default '{}',  -- { en: {title, summary, description, itinerary[], includes[], bring[], seoTitle, seoDescription}, es: {...} }
  sort             int not null default 0,
  active           boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table tour_departures (
  id          uuid primary key default gen_random_uuid(),
  tour_id     uuid not null references tours (id) on delete cascade,
  departs_on  date not null,
  capacity    int not null,
  closed      boolean not null default false,
  unique (tour_id, departs_on)
);

-- ───────────────────────── affiliates ─────────────────────────
create table affiliates (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid unique references auth.users (id) on delete set null,
  slug                  text unique,       -- assigned on approval → santa.rentals/a/{slug}
  full_name             text not null,
  email                 text not null unique,
  phone                 text not null,     -- WhatsApp
  id_number             text,              -- cédula / passport
  area                  text,
  payout_method         text not null default 'sinpe',
  payout_details        text,              -- SINPE Móvil number etc.
  commission_rate       numeric(4,2) not null default 7.00 check (commission_rate between 0 and 50),
  customer_discount     numeric(4,2) not null default 10.00 check (customer_discount between 0 and 50),
  nfc_serial            text,
  tag_fee_cents         int not null default 4000,
  tag_fee_paid_at       timestamptz,
  tag_fee_session_id    text,
  status                affiliate_status not null default 'pending',
  notes                 text,
  approved_at           timestamptz,
  created_at            timestamptz not null default now()
);

create table affiliate_clicks (
  id            bigint generated always as identity primary key,
  affiliate_id  uuid not null references affiliates (id) on delete cascade,
  source        text not null default 'nfc',  -- nfc | qr | link
  visitor_hash  text,
  created_at    timestamptz not null default now()
);
create index on affiliate_clicks (affiliate_id, created_at);

-- ───────────────────────── customers & reservations ─────────────────────────
create table customers (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  full_name   text not null,
  phone       text,
  country     text,
  created_at  timestamptz not null default now()
);

create table reservations (
  id                      uuid primary key default gen_random_uuid(),
  code                    text not null unique default upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 6)),
  kind                    reservation_kind not null,
  status                  reservation_status not null default 'pending_payment',
  customer_id             uuid not null references customers (id),
  affiliate_id            uuid references affiliates (id),
  locale                  text not null default 'en',

  -- rental
  start_at                timestamptz,
  end_at                  timestamptz,
  delivery_location       text,

  -- tour
  tour_id                 uuid references tours (id),
  tour_departure_id       uuid references tour_departures (id),
  pax                     int,

  -- money (cents)
  subtotal_cents          int not null,
  discount_cents          int not null default 0,
  tax_cents               int not null default 0,
  total_cents             int not null,
  refunded_cents          int not null default 0,
  cancellation_fee_cents  int not null default 0,
  deposit_cents           int not null default 0,

  -- payment
  payment_provider        text not null default 'stripe',
  checkout_session_id     text unique,
  payment_intent_id       text unique,
  payment_method_id       text,     -- saved card for the deposit hold
  provider_customer_id    text,
  deposit_hold_id         text,     -- authorized-but-uncaptured PaymentIntent
  paid_at                 timestamptz,
  expires_at              timestamptz,  -- pending_payment holds expire

  -- paperwork
  waiver_version          text,
  waiver_signed_name      text,
  waiver_signed_at        timestamptz,
  license_path            text,
  notes                   text,
  admin_notes             text,
  manage_token            text not null unique default encode(gen_random_bytes(18), 'hex'),

  cancelled_at            timestamptz,
  cancel_reason           text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),

  check (kind <> 'rental' or (start_at is not null and end_at is not null and end_at > start_at)),
  check (kind <> 'tour'   or (tour_id is not null and pax is not null and pax > 0))
);
create index on reservations (status, start_at);
create index on reservations (affiliate_id);

-- One row per vehicle unit in a rental. Exclusion constraint = no double booking.
create table reservation_items (
  id                uuid primary key default gen_random_uuid(),
  reservation_id    uuid not null references reservations (id) on delete cascade,
  model_id          uuid not null references vehicle_models (id),
  vehicle_id        uuid not null references vehicles (id),
  period            tstzrange not null,          -- includes turnaround buffer
  price_cents       int not null,
  blocks_inventory  boolean not null default true,
  exclude using gist (vehicle_id with =, period with &&) where (blocks_inventory)
);
create index on reservation_items (model_id);

-- Keep items' inventory flag in sync with reservation status.
create or replace function sync_items_blocking() returns trigger language plpgsql as $$
begin
  if new.status is distinct from old.status then
    update reservation_items
       set blocks_inventory = new.status in ('pending_payment','paid','active')
     where reservation_id = new.id;
  end if;
  new.updated_at := now();
  return new;
end $$;
create trigger reservations_status_sync before update on reservations
  for each row execute function sync_items_blocking();

-- ───────────────────────── commissions & payouts ─────────────────────────
create table payouts (
  id             uuid primary key default gen_random_uuid(),
  affiliate_id   uuid not null references affiliates (id),
  period_start   date not null,
  period_end     date not null,
  amount_cents   int not null,
  status         payout_status not null default 'pending',
  reference      text,
  paid_at        timestamptz,
  created_at     timestamptz not null default now(),
  unique (affiliate_id, period_end)
);

create table commissions (
  id              uuid primary key default gen_random_uuid(),
  reservation_id  uuid not null unique references reservations (id) on delete cascade,
  affiliate_id    uuid not null references affiliates (id),
  base_cents      int not null,       -- reservation net (excl. tax) the rate applies to
  rate            numeric(4,2) not null,
  amount_cents    int not null,
  status          commission_status not null default 'pending',
  earned_at       timestamptz,
  payout_id       uuid references payouts (id),
  created_at      timestamptz not null default now()
);
create index on commissions (affiliate_id, status);

-- ───────────────────────── functions ─────────────────────────

-- Release unpaid holds whose checkout window has passed.
create or replace function expire_stale_holds() returns int language plpgsql security definer set search_path = public as $$
declare n int;
begin
  update reservations set status = 'expired'
   where status = 'pending_payment' and expires_at < now();
  get diagnostics n = row_count;
  return n;
end $$;

-- Count free units of a model for a period (period already includes buffer).
create or replace function available_units(p_model uuid, p_period tstzrange)
returns int language sql stable as $$
  select count(*)::int from vehicles v
   where v.model_id = p_model and v.status = 'available'
     and not exists (
       select 1 from reservation_items ri
        where ri.vehicle_id = v.id and ri.blocks_inventory and ri.period && p_period);
$$;

-- Atomically pick a free unit; returns null when sold out. The exclusion
-- constraint remains the final guard against races.
create or replace function pick_vehicle(p_model uuid, p_period tstzrange)
returns uuid language sql volatile as $$
  select v.id from vehicles v
   where v.model_id = p_model and v.status = 'available'
     and not exists (
       select 1 from reservation_items ri
        where ri.vehicle_id = v.id and ri.blocks_inventory and ri.period && p_period)
   order by v.label
   limit 1
   for update of v skip locked;
$$;

-- Seats already taken on a tour departure.
create or replace function tour_seats_taken(p_departure uuid)
returns int language sql stable as $$
  select coalesce(sum(pax), 0)::int from reservations
   where tour_departure_id = p_departure and status in ('pending_payment','paid','active','completed');
$$;

-- Affiliate balance summary.
create or replace function affiliate_balance(p_affiliate uuid)
returns table (pending_cents int, earned_cents int, paid_cents int)
language sql stable as $$
  select
    coalesce(sum(amount_cents) filter (where status = 'pending'), 0)::int,
    coalesce(sum(amount_cents) filter (where status = 'earned'),  0)::int,
    coalesce(sum(amount_cents) filter (where status = 'paid'),    0)::int
  from commissions where affiliate_id = p_affiliate;
$$;

-- New auth users get a profile (role defaults to agent; promote admins manually).
create or replace function handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name) values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- ───────────────────────── RLS ─────────────────────────
-- The server uses the service-role key for bookings, webhooks and admin
-- mutations; these policies are defense in depth for any direct client access.
alter table profiles           enable row level security;
alter table settings           enable row level security;
alter table vehicle_models     enable row level security;
alter table vehicles           enable row level security;
alter table maintenance_logs   enable row level security;
alter table seasons            enable row level security;
alter table tours              enable row level security;
alter table tour_departures    enable row level security;
alter table affiliates         enable row level security;
alter table affiliate_clicks   enable row level security;
alter table customers          enable row level security;
alter table reservations       enable row level security;
alter table reservation_items  enable row level security;
alter table commissions        enable row level security;
alter table payouts            enable row level security;

-- public catalog
create policy "public read models"  on vehicle_models  for select using (active or is_staff());
create policy "public read tours"   on tours           for select using (active or is_staff());
create policy "public read seasons" on seasons         for select using (true);

-- staff full access
create policy "staff all" on profiles          for all using (is_staff()) with check (has_role(array['admin']::app_role[]));
create policy "staff all" on settings          for all using (is_staff()) with check (is_staff());
create policy "staff all" on vehicle_models    for all using (is_staff()) with check (is_staff());
create policy "staff all" on vehicles          for all using (is_staff()) with check (is_staff());
create policy "staff all" on maintenance_logs  for all using (is_staff()) with check (is_staff());
create policy "staff all" on seasons           for all using (is_staff()) with check (is_staff());
create policy "staff all" on tours             for all using (is_staff()) with check (is_staff());
create policy "staff all" on tour_departures   for all using (is_staff()) with check (is_staff());
create policy "staff all" on affiliates        for all using (is_staff()) with check (is_staff());
create policy "staff all" on affiliate_clicks  for all using (is_staff()) with check (is_staff());
create policy "staff all" on customers         for all using (is_staff()) with check (is_staff());
create policy "staff all" on reservations      for all using (is_staff()) with check (is_staff());
create policy "staff all" on reservation_items for all using (is_staff()) with check (is_staff());
create policy "staff all" on commissions       for all using (is_staff()) with check (is_staff());
create policy "staff all" on payouts           for all using (is_staff()) with check (is_staff());

-- agents see their own records
create policy "own profile"     on profiles    for select using (id = auth.uid());
create policy "own affiliate"   on affiliates  for select using (user_id = auth.uid());
create policy "own commissions" on commissions for select using (affiliate_id in (select id from affiliates where user_id = auth.uid()));
create policy "own payouts"     on payouts     for select using (affiliate_id in (select id from affiliates where user_id = auth.uid()));

-- ───────────────────────── storage ─────────────────────────
insert into storage.buckets (id, name, public) values
  ('media', 'media', true),          -- vehicle & tour photos
  ('licenses', 'licenses', false)    -- driver licenses (service role only)
on conflict (id) do nothing;

create policy "public read media" on storage.objects for select using (bucket_id = 'media');
create policy "staff write media" on storage.objects for all
  using (bucket_id = 'media' and is_staff()) with check (bucket_id = 'media' and is_staff());
create policy "staff read licenses" on storage.objects for select using (bucket_id = 'licenses' and is_staff());
