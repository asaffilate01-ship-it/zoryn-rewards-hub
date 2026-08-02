begin;

create table if not exists public.zr_scheduled_job_configs (
  id uuid primary key default gen_random_uuid(),
  job_name text not null unique,
  enabled boolean not null default true,
  schedule_expression text not null,
  configuration jsonb not null default '{}'::jsonb,
  last_run_at timestamptz,
  next_run_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.zr_scheduled_job_configs to authenticated;
grant all on public.zr_scheduled_job_configs to service_role;
alter table public.zr_scheduled_job_configs enable row level security;
drop policy if exists zr_scheduled_job_configs_admin_read on public.zr_scheduled_job_configs;
create policy zr_scheduled_job_configs_admin_read on public.zr_scheduled_job_configs
  for select to authenticated
  using (public.has_role(auth.uid(), 'admin'::public.app_role));

drop trigger if exists zr_scheduled_job_configs_updated_at on public.zr_scheduled_job_configs;
create trigger zr_scheduled_job_configs_updated_at
  before update on public.zr_scheduled_job_configs
  for each row execute function public.set_updated_at();

insert into public.zr_scheduled_job_configs (job_name, schedule_expression) values
  ('campaign-state-update', '*/5 * * * *'),
  ('funding-thresholds', '*/15 * * * *'),
  ('liability-snapshots', '0 2 * * *'),
  ('notification-retry', '*/5 * * * *')
on conflict (job_name) do nothing;

create or replace function public.zr_update_campaign_states()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  activated integer := 0;
  completed integer := 0;
begin
  update public.reward_campaigns
     set status = 'active'
   where status = 'scheduled'
     and starts_at is not null
     and starts_at <= now()
     and (ends_at is null or ends_at > now());
  get diagnostics activated = row_count;

  update public.reward_campaigns
     set status = 'completed'
   where status in ('active', 'paused')
     and ends_at is not null
     and ends_at <= now();
  get diagnostics completed = row_count;

  update public.zr_scheduled_job_configs
     set last_run_at = now()
   where job_name = 'campaign-state-update';

  return activated + completed;
end;
$$;
revoke all on function public.zr_update_campaign_states() from public, anon, authenticated;
grant execute on function public.zr_update_campaign_states() to service_role;

create table if not exists public.zr_monitoring_checks (
  id uuid primary key default gen_random_uuid(),
  check_name text not null,
  status text not null check (status in ('healthy','degraded','failed')),
  latency_ms integer,
  details jsonb not null default '{}'::jsonb,
  checked_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists zr_monitoring_checks_checked_idx on public.zr_monitoring_checks(checked_at desc);
grant select on public.zr_monitoring_checks to authenticated;
grant all on public.zr_monitoring_checks to service_role;
alter table public.zr_monitoring_checks enable row level security;
drop policy if exists zr_monitoring_checks_admin_read on public.zr_monitoring_checks;
create policy zr_monitoring_checks_admin_read on public.zr_monitoring_checks
  for select to authenticated
  using (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    or exists (select 1 from public.reward_tenant_members m where m.user_id = auth.uid())
  );

create table if not exists public.zr_mobile_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null check (platform in ('ios','android','web')),
  device_name text,
  device_token_hash text,
  push_enabled boolean not null default false,
  biometric_enabled boolean not null default false,
  revoked_at timestamptz,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, device_token_hash)
);
create index if not exists zr_mobile_devices_user_idx on public.zr_mobile_devices(user_id);
grant select, insert, update, delete on public.zr_mobile_devices to authenticated;
grant all on public.zr_mobile_devices to service_role;
alter table public.zr_mobile_devices enable row level security;
drop policy if exists zr_mobile_devices_own on public.zr_mobile_devices;
create policy zr_mobile_devices_own on public.zr_mobile_devices
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop trigger if exists zr_mobile_devices_updated_at on public.zr_mobile_devices;
create trigger zr_mobile_devices_updated_at
  before update on public.zr_mobile_devices
  for each row execute function public.set_updated_at();

create table if not exists public.zr_launch_acceptance (
  id uuid primary key default gen_random_uuid(),
  release_name text not null,
  environment text not null,
  engineering_passed boolean not null default false,
  security_passed boolean not null default false,
  operations_passed boolean not null default false,
  legal_passed boolean not null default false,
  pilot_passed boolean not null default false,
  notes text,
  approved boolean generated always as (
    engineering_passed and security_passed and operations_passed and legal_passed and pilot_passed
  ) stored,
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists zr_launch_acceptance_created_idx on public.zr_launch_acceptance(created_at desc);
grant select on public.zr_launch_acceptance to authenticated;
grant all on public.zr_launch_acceptance to service_role;
alter table public.zr_launch_acceptance enable row level security;
drop policy if exists zr_launch_acceptance_admin_read on public.zr_launch_acceptance;
create policy zr_launch_acceptance_admin_read on public.zr_launch_acceptance
  for select to authenticated
  using (public.has_role(auth.uid(), 'admin'::public.app_role));

drop trigger if exists zr_launch_acceptance_updated_at on public.zr_launch_acceptance;
create trigger zr_launch_acceptance_updated_at
  before update on public.zr_launch_acceptance
  for each row execute function public.set_updated_at();

commit;