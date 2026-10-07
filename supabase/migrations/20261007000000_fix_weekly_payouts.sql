-- build_weekly_payouts: its OUT column "affiliate_id" clashed with the table
-- column in ON CONFLICT (affiliate_id, period_end). Prefer columns.
create or replace function build_weekly_payouts(p_period_end date)
returns table (payout_id uuid, affiliate_id uuid, amount_cents int, commission_count int)
language plpgsql security definer set search_path = public as $$
#variable_conflict use_column
declare a record; v_payout uuid;
begin
  for a in
    select c.affiliate_id as aff from commissions c
     where c.status = 'earned' and c.payout_id is null
     group by c.affiliate_id
  loop
    insert into payouts (affiliate_id, period_start, period_end, amount_cents)
    values (a.aff, p_period_end - 7, p_period_end, 0)
    on conflict (affiliate_id, period_end) do nothing;

    select p.id into v_payout from payouts p
     where p.affiliate_id = a.aff and p.period_end = p_period_end and p.status = 'pending';
    continue when v_payout is null;  -- already paid; new commissions wait for next week

    update commissions c set payout_id = v_payout
     where c.affiliate_id = a.aff and c.status = 'earned' and c.payout_id is null;

    update payouts p set amount_cents = (select coalesce(sum(c.amount_cents), 0) from commissions c where c.payout_id = v_payout)
     where p.id = v_payout;
  end loop;

  return query
    select p.id, p.affiliate_id, p.amount_cents, (select count(*)::int from commissions c where c.payout_id = p.id)
      from payouts p where p.period_end = p_period_end and p.status = 'pending' and p.amount_cents > 0;
end $$;

revoke execute on function build_weekly_payouts from public, anon, authenticated;
