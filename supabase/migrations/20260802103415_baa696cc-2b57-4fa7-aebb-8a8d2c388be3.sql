create or replace function public.zr_create_liability_snapshot(p_tenant_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_id uuid;
  v_universal bigint := 0;
  v_merchant bigint := 0;
  v_pending bigint := 0;
  v_cashback bigint := 0;
  v_gift bigint := 0;
  v_payable bigint := 0;
  v_funding bigint := 0;
begin
  select
    coalesce(sum(case when p.currency = 'universal_points' then w.available else 0 end), 0),
    coalesce(sum(case when p.currency = 'merchant_points' then w.available else 0 end), 0),
    coalesce(sum(w.pending), 0),
    coalesce(sum(case when p.currency = 'cashback_cents' then w.available else 0 end), 0),
    coalesce(sum(case when p.currency in ('gift_credit_cents','promo_credit_cents') then w.available else 0 end), 0)
  into v_universal, v_merchant, v_pending, v_cashback, v_gift
  from public.reward_wallets w
  join public.reward_programmes p on p.id = w.programme_id
  join public.reward_memberships m on m.id = w.membership_id
  where m.tenant_id = p_tenant_id;

  select coalesce(sum(value_cents), 0)
  into v_payable
  from public.reward_redemption_orders
  where tenant_id = p_tenant_id
    and status in ('reserved','pending','approved','processing');

  select coalesce(sum(greatest(balance_cents - reserved_cents, 0)), 0)
  into v_funding
  from public.reward_funding_accounts
  where tenant_id = p_tenant_id;

  insert into public.zr_liability_snapshots(
    tenant_id, universal_points_minor, merchant_points_minor, pending_points_minor,
    cashback_minor, gift_credit_minor, redemption_payable_minor, funding_available_minor
  ) values (
    p_tenant_id, v_universal, v_merchant, v_pending, v_cashback, v_gift, v_payable, v_funding
  )
  returning id into v_id;

  return v_id;
end;
$$;
revoke all on function public.zr_create_liability_snapshot(uuid) from public, anon;
grant execute on function public.zr_create_liability_snapshot(uuid) to service_role;