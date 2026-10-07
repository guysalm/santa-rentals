-- Atomic booking holds. Each runs in one transaction: either the whole
-- reservation (all units / seats) is held, or nothing is written.

-- p_items: [{ "model_id": uuid, "qty": int, "unit_price_cents": int }]
create or replace function create_rental_hold(
  p_customer      uuid,
  p_affiliate     uuid,
  p_locale        text,
  p_start         timestamptz,
  p_end           timestamptz,
  p_buffer_hours  numeric,
  p_items         jsonb,
  p_subtotal      int,
  p_discount      int,
  p_tax           int,
  p_total         int,
  p_deposit       int,
  p_delivery      text,
  p_notes         text,
  p_waiver_version text,
  p_waiver_name   text,
  p_license_path  text,
  p_expires_at    timestamptz
) returns table (reservation_id uuid, code text, manage_token text)
language plpgsql security definer set search_path = public as $$
declare
  v_res     reservations%rowtype;
  v_period  tstzrange := tstzrange(p_start, p_end + make_interval(hours => p_buffer_hours::int), '[)');
  v_item    jsonb;
  v_vehicle uuid;
  i         int;
begin
  perform expire_stale_holds();

  insert into reservations (
    kind, status, customer_id, affiliate_id, locale, start_at, end_at, delivery_location, notes,
    subtotal_cents, discount_cents, tax_cents, total_cents, deposit_cents,
    waiver_version, waiver_signed_name, waiver_signed_at, license_path, expires_at
  ) values (
    'rental', 'pending_payment', p_customer, p_affiliate, p_locale, p_start, p_end, p_delivery, p_notes,
    p_subtotal, p_discount, p_tax, p_total, p_deposit,
    p_waiver_version, p_waiver_name, now(), p_license_path, p_expires_at
  ) returning * into v_res;

  for v_item in select * from jsonb_array_elements(p_items) loop
    for i in 1 .. (v_item ->> 'qty')::int loop
      v_vehicle := pick_vehicle((v_item ->> 'model_id')::uuid, v_period);
      if v_vehicle is null then
        raise exception 'SOLD_OUT:%', v_item ->> 'model_id' using errcode = 'P0001';
      end if;
      insert into reservation_items (reservation_id, model_id, vehicle_id, period, price_cents)
      values (v_res.id, (v_item ->> 'model_id')::uuid, v_vehicle, v_period, (v_item ->> 'unit_price_cents')::int);
    end loop;
  end loop;

  return query select v_res.id, v_res.code, v_res.manage_token;
end $$;

create or replace function create_tour_hold(
  p_customer      uuid,
  p_affiliate     uuid,
  p_locale        text,
  p_tour          uuid,
  p_date          date,
  p_pax           int,
  p_subtotal      int,
  p_discount      int,
  p_tax           int,
  p_total         int,
  p_notes         text,
  p_waiver_version text,
  p_waiver_name   text,
  p_license_path  text,
  p_expires_at    timestamptz
) returns table (reservation_id uuid, code text, manage_token text)
language plpgsql security definer set search_path = public as $$
declare
  v_tour  tours%rowtype;
  v_dep   tour_departures%rowtype;
  v_start timestamptz;
  v_res   reservations%rowtype;
begin
  perform expire_stale_holds();

  select * into v_tour from tours where id = p_tour and active;
  if not found then raise exception 'TOUR_NOT_FOUND' using errcode = 'P0001'; end if;
  if not (extract(dow from p_date)::int = any (v_tour.days_of_week)) then
    raise exception 'TOUR_NOT_RUNNING' using errcode = 'P0001';
  end if;

  insert into tour_departures (tour_id, departs_on, capacity)
  values (p_tour, p_date, v_tour.max_pax)
  on conflict (tour_id, departs_on) do nothing;

  -- Row lock serializes concurrent bookings for the same departure.
  select * into v_dep from tour_departures where tour_id = p_tour and departs_on = p_date for update;
  if v_dep.closed then raise exception 'TOUR_CLOSED' using errcode = 'P0001'; end if;
  if tour_seats_taken(v_dep.id) + p_pax > v_dep.capacity then
    raise exception 'TOUR_FULL' using errcode = 'P0001';
  end if;

  v_start := (p_date + v_tour.start_time) at time zone 'America/Costa_Rica';

  insert into reservations (
    kind, status, customer_id, affiliate_id, locale, tour_id, tour_departure_id, pax,
    start_at, end_at, notes, subtotal_cents, discount_cents, tax_cents, total_cents,
    waiver_version, waiver_signed_name, waiver_signed_at, license_path, expires_at
  ) values (
    'tour', 'pending_payment', p_customer, p_affiliate, p_locale, p_tour, v_dep.id, p_pax,
    v_start, v_start + make_interval(mins => (v_tour.duration_hours * 60)::int), p_notes,
    p_subtotal, p_discount, p_tax, p_total,
    p_waiver_version, p_waiver_name, now(), p_license_path, p_expires_at
  ) returning * into v_res;

  return query select v_res.id, v_res.code, v_res.manage_token;
end $$;

-- Free units per model for a period (used by the live availability API).
create or replace function availability_for_period(p_start timestamptz, p_end timestamptz, p_buffer_hours numeric)
returns table (model_id uuid, available int)
language plpgsql security definer set search_path = public as $$
begin
  perform expire_stale_holds();
  return query
    select m.id, available_units(m.id, tstzrange(p_start, p_end + make_interval(hours => p_buffer_hours::int), '[)'))
      from vehicle_models m where m.active;
end $$;

create or replace function tour_seats_left(p_tour uuid, p_date date)
returns int language plpgsql security definer set search_path = public as $$
declare v_dep tour_departures%rowtype; v_max int;
begin
  perform expire_stale_holds();
  select max_pax into v_max from tours where id = p_tour;
  select * into v_dep from tour_departures where tour_id = p_tour and departs_on = p_date;
  if not found then return v_max; end if;
  if v_dep.closed then return 0; end if;
  return greatest(0, v_dep.capacity - tour_seats_taken(v_dep.id));
end $$;

-- Only the server (service role) may call these.
revoke execute on function create_rental_hold, create_tour_hold, availability_for_period, tour_seats_left,
  expire_stale_holds, pick_vehicle from public, anon, authenticated;
