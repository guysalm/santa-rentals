-- Commission lifecycle: pending (paid booking) → earned (booking completed)
-- → batched into a weekly payout → paid (admin confirms the SINPE transfer).

alter table affiliates add column if not exists locale text not null default 'es' check (locale in ('en', 'es'));

-- Rentals/tours whose end time has passed are completed (12h grace for late returns).
create or replace function complete_finished_reservations() returns int
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  update reservations set status = 'completed'
   where status in ('paid', 'active') and end_at < now() - interval '12 hours';
  get diagnostics n = row_count;
  return n;
end $$;

-- Pending commissions on completed bookings become payable.
create or replace function mark_commissions_earned() returns int
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  update commissions c set status = 'earned', earned_at = now()
    from reservations r
   where c.reservation_id = r.id and c.status = 'pending' and r.status = 'completed';
  get diagnostics n = row_count;
  return n;
end $$;

-- Group earned, unbatched commissions into one pending payout per agent for the
-- week ending p_period_end. Safe to re-run: later commissions join the same batch.
create or replace function build_weekly_payouts(p_period_end date)
returns table (payout_id uuid, affiliate_id uuid, amount_cents int, commission_count int)
language plpgsql security definer set search_path = public as $$
declare a record; v_payout uuid;
begin
  for a in
    select c.affiliate_id from commissions c
     where c.status = 'earned' and c.payout_id is null
     group by c.affiliate_id
  loop
    insert into payouts (affiliate_id, period_start, period_end, amount_cents)
    values (a.affiliate_id, p_period_end - 7, p_period_end, 0)
    on conflict (affiliate_id, period_end) do nothing;

    select p.id into v_payout from payouts p
     where p.affiliate_id = a.affiliate_id and p.period_end = p_period_end and p.status = 'pending';
    continue when v_payout is null;  -- already paid; new commissions wait for next week

    update commissions set payout_id = v_payout
     where commissions.affiliate_id = a.affiliate_id and status = 'earned' and payout_id is null;

    update payouts set amount_cents = (select coalesce(sum(amount_cents), 0) from commissions where commissions.payout_id = v_payout)
     where id = v_payout;
  end loop;

  return query
    select p.id, p.affiliate_id, p.amount_cents, (select count(*)::int from commissions c where c.payout_id = p.id)
      from payouts p where p.period_end = p_period_end and p.status = 'pending' and p.amount_cents > 0;
end $$;

-- Admin confirms a payout was sent.
create or replace function mark_payout_paid(p_payout uuid, p_reference text) returns void
language plpgsql security definer set search_path = public as $$
begin
  update payouts set status = 'paid', reference = p_reference, paid_at = now() where id = p_payout and status = 'pending';
  if not found then raise exception 'PAYOUT_NOT_PENDING' using errcode = 'P0001'; end if;
  update commissions set status = 'paid' where payout_id = p_payout;
end $$;

revoke execute on function complete_finished_reservations, mark_commissions_earned, build_weekly_payouts, mark_payout_paid
  from public, anon, authenticated;
