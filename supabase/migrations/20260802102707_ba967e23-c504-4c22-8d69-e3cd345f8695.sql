-- Pilot readiness v7 -------------------------------------------------------

create table if not exists public.zr_notification_outbox (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.reward_tenants(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  channel text not null check (channel in ('email','push','in_app','sms')),
  template_key text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'queued' check (
    status in ('queued','processing','sent','failed','dead_letter','cancelled')
  ),
  attempt_count integer not null default 0,
  next_attempt_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);
create index if not exists zr_notification_outbox_queue_idx
  on public.zr_notification_outbox(status, next_attempt_at, created_at);
grant select on public.zr_notification_outbox to authenticated;
grant all on public.zr_notification_outbox to service_role;
alter table public.zr_notification_outbox enable row level security;
create policy zr_notification_own_read on public.zr_notification_outbox
  for select to authenticated
  using (user_id = auth.uid() or (tenant_id is not null and public.is_reward_tenant_member(tenant_id)));

create table if not exists public.zr_support_cases_v2 (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.reward_tenants(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  case_type text not null check (
    case_type in ('support','complaint','missing_reward','fraud','privacy','merchant_funding')
  ),
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  status text not null default 'open' check (
    status in ('open','assigned','waiting_customer','waiting_internal','resolved','closed')
  ),
  subject text not null,
  description text,
  assigned_to uuid references auth.users(id),
  due_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists zr_support_cases_v2_tenant_idx
  on public.zr_support_cases_v2(tenant_id, status, created_at desc);
grant select, insert, update on public.zr_support_cases_v2 to authenticated;
grant all on public.zr_support_cases_v2 to service_role;
alter table public.zr_support_cases_v2 enable row level security;
create policy zr_support_case_read on public.zr_support_cases_v2
  for select to authenticated
  using (user_id = auth.uid() or (tenant_id is not null and public.is_reward_tenant_member(tenant_id)));
create policy zr_support_case_own_insert on public.zr_support_cases_v2
  for insert to authenticated with check (user_id = auth.uid());
create policy zr_support_case_staff_update on public.zr_support_cases_v2
  for update to authenticated
  using (tenant_id is not null and public.zr_has_tenant_role(tenant_id, array['owner','admin','platform_admin','support','merchant_support']))
  with check (tenant_id is not null and public.zr_has_tenant_role(tenant_id, array['owner','admin','platform_admin','support','merchant_support']));
create trigger zr_support_cases_v2_updated_at before update on public.zr_support_cases_v2
  for each row execute function public.set_updated_at();

create table if not exists public.zr_support_case_events (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.zr_support_cases_v2(id) on delete cascade,
  actor_user_id uuid references auth.users(id),
  event_type text not null,
  note text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists zr_support_case_events_case_idx
  on public.zr_support_case_events(case_id, created_at desc);
grant select, insert on public.zr_support_case_events to authenticated;
grant all on public.zr_support_case_events to service_role;
alter table public.zr_support_case_events enable row level security;
create policy zr_support_events_case_read on public.zr_support_case_events
  for select to authenticated
  using (exists (
    select 1 from public.zr_support_cases_v2 c
    where c.id = case_id
      and (c.user_id = auth.uid()
        or (c.tenant_id is not null and public.is_reward_tenant_member(c.tenant_id)))
  ));
create policy zr_support_events_case_insert on public.zr_support_case_events
  for insert to authenticated
  with check (actor_user_id = auth.uid() and exists (
    select 1 from public.zr_support_cases_v2 c
    where c.id = case_id
      and (c.user_id = auth.uid()
        or (c.tenant_id is not null and public.is_reward_tenant_member(c.tenant_id)))
  ));

create table if not exists public.zr_job_runs (
  id uuid primary key default gen_random_uuid(),
  job_name text not null,
  status text not null check (status in ('running','passed','warning','failed')),
  processed_count integer not null default 0,
  error_count integer not null default 0,
  details jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists zr_job_runs_started_idx on public.zr_job_runs(started_at desc);
grant select on public.zr_job_runs to authenticated;
grant all on public.zr_job_runs to service_role;
alter table public.zr_job_runs enable row level security;
create policy zr_job_runs_staff_read on public.zr_job_runs
  for select to authenticated
  using (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    or exists (select 1 from public.reward_tenant_members m where m.user_id = auth.uid())
  );

create table if not exists public.zr_backup_restore_evidence (
  id uuid primary key default gen_random_uuid(),
  environment text not null,
  backup_reference text not null,
  restored_at timestamptz not null,
  verified_by uuid references auth.users(id),
  verification_notes text,
  ledger_verified boolean not null default false,
  tenant_isolation_verified boolean not null default false,
  created_at timestamptz not null default now()
);
grant select on public.zr_backup_restore_evidence to authenticated;
grant all on public.zr_backup_restore_evidence to service_role;
alter table public.zr_backup_restore_evidence enable row level security;
create policy zr_backup_evidence_admin_read on public.zr_backup_restore_evidence
  for select to authenticated
  using (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Queue a notification -----------------------------------------------------
create or replace function public.zr_queue_notification(
  p_tenant_id uuid,
  p_user_id uuid,
  p_channel text,
  p_template_key text,
  p_payload jsonb default '{}'::jsonb
) returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if p_user_id is distinct from auth.uid()
     and not (
       p_tenant_id is not null
       and public.zr_has_tenant_role(
         p_tenant_id,
         array['owner','admin','platform_admin','marketing_manager','support','merchant_support']
       )
     ) then
    raise exception 'forbidden';
  end if;

  insert into public.zr_notification_outbox(tenant_id, user_id, channel, template_key, payload)
  values (p_tenant_id, p_user_id, p_channel, p_template_key, coalesce(p_payload, '{}'::jsonb))
  returning id into v_id;

  return v_id;
end;
$$;
revoke all on function public.zr_queue_notification(uuid, uuid, text, text, jsonb) from public, anon;
grant execute on function public.zr_queue_notification(uuid, uuid, text, text, jsonb) to authenticated, service_role;

-- Liability snapshot from live wallet and funding data ---------------------
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

  select coalesce(sum(amount_cents), 0)
  into v_payable
  from public.reward_redemption_orders
  where tenant_id = p_tenant_id and status in ('pending','approved','processing');

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