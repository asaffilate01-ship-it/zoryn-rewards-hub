begin;

create table if not exists public.zr_billing_plans(
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  monthly_price_minor bigint not null default 0,
  annual_price_minor bigint not null default 0,
  location_limit integer,
  staff_limit integer,
  campaign_limit integer,
  api_request_limit integer,
  white_label_enabled boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.zr_billing_plans to authenticated;
grant all on public.zr_billing_plans to service_role;
alter table public.zr_billing_plans enable row level security;
create policy zr_billing_plans_read on public.zr_billing_plans for select to authenticated using (active = true);

create table if not exists public.zr_subscriptions_v2(
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.reward_tenants(id) on delete cascade,
  plan_id uuid not null references public.zr_billing_plans(id),
  status text not null default 'trialing' check (status in ('trialing','active','past_due','grace_period','restricted','cancelled')),
  trial_ends_at timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  provider_customer_id text,
  provider_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id)
);
grant select on public.zr_subscriptions_v2 to authenticated;
grant all on public.zr_subscriptions_v2 to service_role;
alter table public.zr_subscriptions_v2 enable row level security;
create policy zr_subscription_read on public.zr_subscriptions_v2 for select to authenticated
  using (public.reward_is_tenant_member(tenant_id, auth.uid()) or public.has_role(auth.uid(), 'admin'));

create table if not exists public.zr_consent_records(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  consent_type text not null,
  granted boolean not null,
  policy_version text not null,
  source text not null default 'web',
  created_at timestamptz not null default now()
);
grant select, insert on public.zr_consent_records to authenticated;
grant all on public.zr_consent_records to service_role;
alter table public.zr_consent_records enable row level security;
create policy zr_consent_own_read on public.zr_consent_records for select to authenticated using (user_id = auth.uid());
create policy zr_consent_own_insert on public.zr_consent_records for insert to authenticated with check (user_id = auth.uid());

create table if not exists public.zr_reconciliation_runs(
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.reward_tenants(id) on delete cascade,
  run_type text not null check (run_type in ('daily_liability','merchant_funding','settlement','affiliate')),
  status text not null default 'running' check (status in ('running','passed','warning','failed')),
  expected_minor bigint not null default 0,
  actual_minor bigint not null default 0,
  difference_minor bigint generated always as (actual_minor - expected_minor) stored,
  details jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);
grant select on public.zr_reconciliation_runs to authenticated;
grant all on public.zr_reconciliation_runs to service_role;
alter table public.zr_reconciliation_runs enable row level security;
create policy zr_reconciliation_read on public.zr_reconciliation_runs for select to authenticated
  using (
    public.has_role(auth.uid(), 'admin')
    or (tenant_id is not null and public.zr_has_tenant_role(tenant_id, array['owner','administrator','admin','finance_manager','analyst','platform_admin']))
  );

create table if not exists public.zr_release_acceptance(
  id uuid primary key default gen_random_uuid(),
  release_name text not null,
  environment text not null,
  checklist jsonb not null default '{}'::jsonb,
  approved boolean not null default false,
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_at timestamptz not null default now()
);
grant select on public.zr_release_acceptance to authenticated;
grant all on public.zr_release_acceptance to service_role;
alter table public.zr_release_acceptance enable row level security;
create policy zr_release_acceptance_read on public.zr_release_acceptance for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

alter table public.reward_funding_accounts
  add column if not exists minimum_threshold_cents bigint not null default 0;

create or replace function public.zr_reverse_reward_transaction(
  p_tenant_id uuid,
  p_original_reference text,
  p_idempotency_key text,
  p_reason text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_entry record;
  v_new_id uuid;
  v_ids uuid[] := '{}';
  v_existing uuid;
begin
  if not (
    public.has_role(auth.uid(), 'admin')
    or public.zr_has_tenant_role(p_tenant_id, array['owner','administrator','admin','finance_manager','platform_admin'])
  ) then
    raise exception 'forbidden';
  end if;

  select id into v_existing from public.reward_ledger_entries
    where source_reference = p_idempotency_key limit 1;
  if v_existing is not null then
    return jsonb_build_object('ok', true, 'duplicate', true, 'entry_ids', jsonb_build_array(v_existing));
  end if;

  for v_entry in
    select id, wallet_id, direction, amount, description
    from public.reward_ledger_entries
    where source_reference = p_original_reference
      and tenant_id = p_tenant_id
      and status <> 'reversed'
  loop
    v_new_id := public.reward_post_entry(
      v_entry.wallet_id,
      (case when v_entry.direction = 'debit' then 'credit' else 'debit' end)::public.reward_entry_direction,
      v_entry.amount,
      'available'::public.reward_entry_status,
      'adjustment'::public.reward_source,
      p_idempotency_key,
      coalesce(p_reason, 'reversal'),
      jsonb_build_object('reversal_of', v_entry.id, 'reason', p_reason, 'tenant_id', p_tenant_id)
    );
    update public.reward_ledger_entries
      set status = 'reversed', reversed_entry_id = v_new_id
      where id = v_entry.id;
    v_ids := v_ids || v_new_id;
  end loop;

  if array_length(v_ids, 1) is null then
    raise exception 'no_reversible_entries';
  end if;

  insert into public.audit_log(actor_user_id, action, entity_type, entity_id, details)
  values (auth.uid(), 'reward_action_reversed', 'reward_ledger_entry', v_ids[1],
          jsonb_build_object('tenant_id', p_tenant_id, 'original_reference', p_original_reference,
                             'idempotency_key', p_idempotency_key, 'reason', p_reason));

  return jsonb_build_object('ok', true, 'duplicate', false, 'entry_ids', to_jsonb(v_ids));
end $$;

revoke all on function public.zr_reverse_reward_transaction(uuid, text, text, text) from public, anon;

create or replace function public.zr_enforce_funding_thresholds()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer := 0;
begin
  with underfunded as (
    select f.tenant_id
    from public.reward_funding_accounts f
    group by f.tenant_id
    having sum(f.balance_cents - f.reserved_cents) < sum(coalesce(f.minimum_threshold_cents, 0))
  ), paused as (
    update public.reward_campaigns c
      set status = 'paused'
      where c.status = 'active'
        and c.tenant_id in (select tenant_id from underfunded)
      returning c.id, c.tenant_id
  )
  select count(*) into v_count from paused;

  if v_count > 0 then
    insert into public.zr_operational_alerts(tenant_id, severity, alert_type, title, details, status)
    select distinct f.tenant_id, 'critical', 'funding_threshold_breached',
           'Kampagnen wegen zu geringer Deckung pausiert',
           jsonb_build_object('paused_campaigns', v_count), 'open'
    from public.reward_funding_accounts f
    group by f.tenant_id
    having sum(f.balance_cents - f.reserved_cents) < sum(coalesce(f.minimum_threshold_cents, 0));
  end if;

  return v_count;
end $$;

revoke all on function public.zr_enforce_funding_thresholds() from public, anon, authenticated;

insert into public.zr_billing_plans(code, name, monthly_price_minor, annual_price_minor, location_limit, staff_limit, campaign_limit, api_request_limit, white_label_enabled)
values
  ('starter','Starter',2900,29000,1,5,3,10000,false),
  ('growth','Growth',7900,79000,5,25,20,100000,false),
  ('pro','Pro',19900,199000,null,null,null,1000000,true)
on conflict (code) do nothing;

commit;