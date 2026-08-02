-- Helper: tenant role check for the existing reward_tenant_members table
create or replace function public.zr_has_tenant_role(target_tenant uuid, allowed_roles text[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.reward_tenant_members m
    where m.tenant_id = target_tenant and m.user_id = auth.uid() and m.role = any(allowed_roles)
  ) or public.has_role(auth.uid(), 'admin'::public.app_role);
$$;
revoke all on function public.zr_has_tenant_role(uuid, text[]) from public, anon;
grant execute on function public.zr_has_tenant_role(uuid, text[]) to authenticated, service_role;

-- Merchant onboarding state machine ---------------------------------------
create table if not exists public.zr_merchant_onboarding_cases (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.reward_tenants(id) on delete cascade,
  status text not null default 'draft' check (status in (
    'draft','contact_verified','business_completed','agreement_accepted',
    'programme_configured','locations_configured','funding_confirmed',
    'test_passed','review_required','approved','active','restricted','suspended','closed')),
  legal_name text,
  legal_form text,
  registration_number text,
  beneficial_owners jsonb not null default '[]'::jsonb,
  required_actions jsonb not null default '[]'::jsonb,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id)
);
grant select, insert, update on public.zr_merchant_onboarding_cases to authenticated;
grant all on public.zr_merchant_onboarding_cases to service_role;
alter table public.zr_merchant_onboarding_cases enable row level security;
create policy zr_onboarding_tenant_read on public.zr_merchant_onboarding_cases
  for select to authenticated using (public.is_reward_tenant_member(tenant_id));
create policy zr_onboarding_admin_update on public.zr_merchant_onboarding_cases
  for update to authenticated
  using (public.zr_has_tenant_role(tenant_id, array['owner','admin','platform_admin']))
  with check (public.zr_has_tenant_role(tenant_id, array['owner','admin','platform_admin']));
create policy zr_onboarding_admin_insert on public.zr_merchant_onboarding_cases
  for insert to authenticated
  with check (public.zr_has_tenant_role(tenant_id, array['owner','admin','platform_admin']));
create trigger zr_onboarding_cases_updated_at before update on public.zr_merchant_onboarding_cases
  for each row execute function public.set_updated_at();

-- Liability snapshots ------------------------------------------------------
create table if not exists public.zr_liability_snapshots (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.reward_tenants(id) on delete cascade,
  universal_points_minor bigint not null default 0,
  merchant_points_minor bigint not null default 0,
  pending_points_minor bigint not null default 0,
  cashback_minor bigint not null default 0,
  gift_credit_minor bigint not null default 0,
  redemption_payable_minor bigint not null default 0,
  funding_available_minor bigint not null default 0,
  calculated_at timestamptz not null default now()
);
create index if not exists zr_liability_snapshots_tenant_date_idx
  on public.zr_liability_snapshots(tenant_id, calculated_at desc);
grant select on public.zr_liability_snapshots to authenticated;
grant all on public.zr_liability_snapshots to service_role;
alter table public.zr_liability_snapshots enable row level security;
create policy zr_liability_finance_read on public.zr_liability_snapshots
  for select to authenticated
  using (public.zr_has_tenant_role(tenant_id, array['owner','admin','platform_admin','finance_manager','analyst']));

-- Operational alerts -------------------------------------------------------
create table if not exists public.zr_operational_alerts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.reward_tenants(id) on delete cascade,
  severity text not null check (severity in ('info','warning','critical')),
  alert_type text not null,
  title text not null,
  details jsonb not null default '{}'::jsonb,
  status text not null default 'open' check (status in ('open','acknowledged','resolved')),
  assigned_to uuid references auth.users(id),
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists zr_operational_alerts_tenant_idx
  on public.zr_operational_alerts(tenant_id, status, created_at desc);
grant select on public.zr_operational_alerts to authenticated;
grant all on public.zr_operational_alerts to service_role;
alter table public.zr_operational_alerts enable row level security;
create policy zr_alerts_tenant_read on public.zr_operational_alerts
  for select to authenticated
  using (tenant_id is not null and public.is_reward_tenant_member(tenant_id));

-- Privacy requests ---------------------------------------------------------
create table if not exists public.zr_privacy_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tenant_id uuid references public.reward_tenants(id) on delete cascade,
  request_type text not null check (request_type in ('access','export','delete','correct','restrict')),
  status text not null default 'received' check (status in ('received','identity_check','processing','completed','rejected')),
  due_at timestamptz not null default (now() + interval '30 days'),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
grant select, insert on public.zr_privacy_requests to authenticated;
grant all on public.zr_privacy_requests to service_role;
alter table public.zr_privacy_requests enable row level security;
create policy zr_privacy_own_read on public.zr_privacy_requests
  for select to authenticated using (user_id = auth.uid());
create policy zr_privacy_own_insert on public.zr_privacy_requests
  for insert to authenticated with check (user_id = auth.uid());

-- Atomic balanced double-entry reward action ------------------------------
create or replace function public.zr_execute_reward_action(
  p_tenant_id uuid,
  p_actor uuid,
  p_transaction_type text,
  p_idempotency_key text,
  p_entries jsonb,
  p_metadata jsonb default '{}'::jsonb
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_debits bigint; v_credits bigint; v_entry jsonb; v_ids uuid[] := '{}';
  v_id uuid; v_existing uuid;
begin
  select id into v_existing from public.reward_ledger_entries
    where source_reference = p_idempotency_key limit 1;
  if v_existing is not null then
    return jsonb_build_object('ok', true, 'duplicate', true, 'entry_ids', jsonb_build_array(v_existing));
  end if;

  select
    coalesce(sum(case when x->>'direction' = 'debit' then (x->>'amount')::bigint else 0 end),0),
    coalesce(sum(case when x->>'direction' = 'credit' then (x->>'amount')::bigint else 0 end),0)
  into v_debits, v_credits from jsonb_array_elements(p_entries) x;

  if v_debits <= 0 or v_debits <> v_credits then
    raise exception 'unbalanced_ledger_transaction';
  end if;

  for v_entry in select * from jsonb_array_elements(p_entries) loop
    v_id := public.reward_post_entry(
      (v_entry->>'wallet_id')::uuid,
      (v_entry->>'direction')::public.reward_entry_direction,
      (v_entry->>'amount')::bigint,
      coalesce(v_entry->>'status','available')::public.reward_entry_status,
      'manual'::public.reward_source,
      p_idempotency_key,
      coalesce(v_entry->>'description', p_transaction_type),
      p_metadata || jsonb_build_object('actor', p_actor, 'transaction_type', p_transaction_type)
    );
    v_ids := v_ids || v_id;
  end loop;

  insert into public.audit_log(actor_user_id, action, entity_type, entity_id, details)
  values (p_actor, 'reward_action_posted', 'reward_ledger_entry', v_ids[1],
          jsonb_build_object('tenant_id', p_tenant_id, 'transaction_type', p_transaction_type,
                             'idempotency_key', p_idempotency_key, 'amount', v_debits));

  return jsonb_build_object('ok', true, 'duplicate', false, 'entry_ids', to_jsonb(v_ids));
end $$;
revoke all on function public.zr_execute_reward_action(uuid,uuid,text,text,jsonb,jsonb) from public, anon, authenticated;
grant execute on function public.zr_execute_reward_action(uuid,uuid,text,text,jsonb,jsonb) to service_role;

-- Secure one-time QR challenges -------------------------------------------
create or replace function public.zr_qr_issue(
  p_tenant_id uuid, p_action_type text, p_token_hash text, p_nonce text,
  p_member_id uuid, p_merchant_id uuid, p_location_id uuid,
  p_amount_cents bigint, p_ttl_seconds integer default 60
) returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if p_ttl_seconds <= 0 or p_ttl_seconds > 300 then raise exception 'invalid_ttl'; end if;
  insert into public.zr_qr_challenges(tenant_id, action_type, token_hash, nonce, member_id,
    merchant_id, location_id, amount_cents, expires_at)
  values (p_tenant_id, p_action_type, p_token_hash, p_nonce, p_member_id,
    p_merchant_id, p_location_id, p_amount_cents, now() + make_interval(secs => p_ttl_seconds))
  returning id into v_id;
  return v_id;
end $$;
revoke all on function public.zr_qr_issue(uuid,text,text,text,uuid,uuid,uuid,bigint,integer) from public, anon, authenticated;
grant execute on function public.zr_qr_issue(uuid,text,text,text,uuid,uuid,uuid,bigint,integer) to service_role;

create or replace function public.zr_qr_consume(p_token_hash text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v public.zr_qr_challenges%rowtype;
begin
  select * into v from public.zr_qr_challenges where token_hash = p_token_hash for update;
  if not found then return jsonb_build_object('ok', false, 'reason', 'unknown_token'); end if;
  if v.consumed_at is not null then return jsonb_build_object('ok', false, 'reason', 'already_consumed'); end if;
  if v.expires_at <= now() then return jsonb_build_object('ok', false, 'reason', 'expired'); end if;
  update public.zr_qr_challenges set consumed_at = now() where id = v.id;
  return jsonb_build_object('ok', true, 'challenge_id', v.id, 'tenant_id', v.tenant_id,
    'action_type', v.action_type, 'member_id', v.member_id, 'merchant_id', v.merchant_id,
    'amount_cents', v.amount_cents);
end $$;
revoke all on function public.zr_qr_consume(text) from public, anon, authenticated;
grant execute on function public.zr_qr_consume(text) to service_role;