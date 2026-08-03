begin;

create table if not exists public.zr_integration_connections (
  id uuid primary key default gen_random_uuid(),
  integration_type text not null check (integration_type in ('email','push','billing','affiliate','monitoring')),
  provider text not null,
  environment text not null check (environment in ('mock','sandbox','live')),
  status text not null default 'not_configured' check (status in ('not_configured','configured','healthy','degraded','offline')),
  last_success_at timestamptz,
  last_failure_at timestamptz,
  last_error text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (integration_type, provider, environment)
);

create table if not exists public.zr_billing_subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.reward_tenants(id) on delete cascade,
  provider text not null,
  provider_subscription_id text,
  plan_code text not null,
  status text not null check (status in ('trialing','active','past_due','paused','cancelled','incomplete')),
  trial_ends_at timestamptz,
  current_period_ends_at timestamptz,
  grace_ends_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.zr_affiliate_transactions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.reward_tenants(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  provider text not null,
  provider_transaction_id text not null,
  click_reference text,
  merchant_reference text,
  order_reference text,
  sale_amount_minor bigint,
  commission_minor bigint not null default 0,
  reward_minor bigint not null default 0,
  currency text not null default 'EUR',
  status text not null check (status in ('pending','approved','declined','reversed','paid')),
  expected_available_at timestamptz,
  approved_at timestamptz,
  reversed_at timestamptz,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_transaction_id)
);

create table if not exists public.zr_monitoring_alert_events (
  id uuid primary key default gen_random_uuid(),
  rule_key text not null,
  severity text not null check (severity in ('info','warning','critical')),
  status text not null default 'open' check (status in ('open','acknowledged','resolved')),
  title text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.zr_backup_restore_runs (
  id uuid primary key default gen_random_uuid(),
  environment text not null,
  backup_reference text not null,
  restore_target text not null,
  status text not null check (status in ('running','passed','failed','blocked')),
  recovery_time_seconds integer,
  recovery_point_seconds integer,
  ledger_verified boolean not null default false,
  tenant_isolation_verified boolean not null default false,
  scheduler_verified boolean not null default false,
  notes text,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

grant select, insert, update, delete on public.zr_integration_connections to authenticated;
grant select, insert, update, delete on public.zr_billing_subscriptions to authenticated;
grant select, insert, update, delete on public.zr_affiliate_transactions to authenticated;
grant select, insert, update, delete on public.zr_monitoring_alert_events to authenticated;
grant select, insert, update, delete on public.zr_backup_restore_runs to authenticated;
grant all on public.zr_integration_connections to service_role;
grant all on public.zr_billing_subscriptions to service_role;
grant all on public.zr_affiliate_transactions to service_role;
grant all on public.zr_monitoring_alert_events to service_role;
grant all on public.zr_backup_restore_runs to service_role;

alter table public.zr_integration_connections enable row level security;
alter table public.zr_billing_subscriptions enable row level security;
alter table public.zr_affiliate_transactions enable row level security;
alter table public.zr_monitoring_alert_events enable row level security;
alter table public.zr_backup_restore_runs enable row level security;

create policy "Admins manage integration connections" on public.zr_integration_connections
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'::public.app_role))
  with check (public.has_role(auth.uid(), 'admin'::public.app_role));

create policy "Admins manage billing subscriptions" on public.zr_billing_subscriptions
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'::public.app_role))
  with check (public.has_role(auth.uid(), 'admin'::public.app_role));

create policy "Admins manage affiliate transactions" on public.zr_affiliate_transactions
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'::public.app_role))
  with check (public.has_role(auth.uid(), 'admin'::public.app_role));

create policy "Admins manage monitoring alert events" on public.zr_monitoring_alert_events
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'::public.app_role))
  with check (public.has_role(auth.uid(), 'admin'::public.app_role));

create policy "Admins manage backup restore runs" on public.zr_backup_restore_runs
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'::public.app_role))
  with check (public.has_role(auth.uid(), 'admin'::public.app_role));

create trigger zr_integration_connections_updated_at before update on public.zr_integration_connections
  for each row execute function public.set_updated_at();
create trigger zr_billing_subscriptions_updated_at before update on public.zr_billing_subscriptions
  for each row execute function public.set_updated_at();
create trigger zr_affiliate_transactions_updated_at before update on public.zr_affiliate_transactions
  for each row execute function public.set_updated_at();

create index if not exists zr_billing_subscriptions_tenant_idx on public.zr_billing_subscriptions (tenant_id, status);
create index if not exists zr_affiliate_transactions_tenant_idx on public.zr_affiliate_transactions (tenant_id, status, created_at desc);
create index if not exists zr_monitoring_alert_events_status_idx on public.zr_monitoring_alert_events (status, severity, created_at desc);

commit;