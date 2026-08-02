create extension if not exists pgcrypto;

create table public.zr_customer_segments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.reward_tenants(id) on delete cascade,
  name text not null,
  description text,
  rules jsonb not null default '{}'::jsonb,
  estimated_members integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.zr_automations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.reward_tenants(id) on delete cascade,
  name text not null,
  trigger_type text not null check (trigger_type in ('welcome','birthday','win_back','expiry','funding_low','high_value','referral')),
  trigger_config jsonb not null default '{}'::jsonb,
  action_config jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft','active','paused','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.zr_gift_cards_v4 (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.reward_tenants(id) on delete cascade,
  code_hash text not null unique,
  initial_value_cents bigint not null check (initial_value_cents > 0),
  remaining_value_cents bigint not null check (remaining_value_cents >= 0),
  purchaser_user_id uuid references auth.users(id) on delete set null,
  recipient_email text,
  message text,
  deliver_at timestamptz,
  expires_at timestamptz,
  status text not null default 'active' check (status in ('scheduled','active','fully_used','expired','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.zr_stamp_cards (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.reward_tenants(id) on delete cascade,
  member_id uuid not null,
  programme_name text not null,
  stamps_required integer not null check (stamps_required between 2 and 100),
  current_stamps integer not null default 0 check (current_stamps >= 0),
  reward_description text not null,
  completed_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.zr_qr_challenges (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.reward_tenants(id) on delete cascade,
  token_hash text not null unique,
  action_type text not null check (action_type in ('earn','redeem')),
  member_id uuid,
  merchant_id uuid,
  location_id uuid,
  amount_cents bigint,
  nonce text not null unique,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.zr_security_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.reward_tenants(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  severity text not null check (severity in ('low','medium','high','critical')),
  risk_score integer not null default 0 check (risk_score between 0 and 100),
  reasons jsonb not null default '[]'::jsonb,
  status text not null default 'open' check (status in ('open','reviewing','blocked','resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.zr_api_credentials (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.reward_tenants(id) on delete cascade,
  name text not null,
  public_key text not null unique,
  secret_hash text not null,
  scopes text[] not null default '{}',
  last_used_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index zr_customer_segments_tenant_idx on public.zr_customer_segments (tenant_id);
create index zr_automations_tenant_idx on public.zr_automations (tenant_id);
create index zr_gift_cards_tenant_idx on public.zr_gift_cards_v4 (tenant_id);
create index zr_stamp_cards_tenant_member_idx on public.zr_stamp_cards (tenant_id, member_id);
create index zr_qr_challenges_expiry_idx on public.zr_qr_challenges (expires_at);
create index zr_security_events_tenant_status_idx on public.zr_security_events (tenant_id, status);
create index zr_api_credentials_tenant_idx on public.zr_api_credentials (tenant_id);

-- Read access for tenant staff / owners only; all writes are server-side (service role).
grant select on public.zr_customer_segments to authenticated;
grant select on public.zr_automations to authenticated;
grant select on public.zr_gift_cards_v4 to authenticated;
grant select on public.zr_stamp_cards to authenticated;
grant select on public.zr_security_events to authenticated;
grant all on public.zr_customer_segments to service_role;
grant all on public.zr_automations to service_role;
grant all on public.zr_gift_cards_v4 to service_role;
grant all on public.zr_stamp_cards to service_role;
grant all on public.zr_qr_challenges to service_role;
grant all on public.zr_security_events to service_role;
grant all on public.zr_api_credentials to service_role;

alter table public.zr_customer_segments enable row level security;
alter table public.zr_automations enable row level security;
alter table public.zr_gift_cards_v4 enable row level security;
alter table public.zr_stamp_cards enable row level security;
alter table public.zr_qr_challenges enable row level security;
alter table public.zr_security_events enable row level security;
alter table public.zr_api_credentials enable row level security;

create policy "tenant members read segments"
on public.zr_customer_segments for select to authenticated
using (public.is_reward_tenant_member(tenant_id) or public.has_role(auth.uid(), 'admin'));

create policy "tenant members read automations"
on public.zr_automations for select to authenticated
using (public.is_reward_tenant_member(tenant_id) or public.has_role(auth.uid(), 'admin'));

create policy "tenant members read gift cards"
on public.zr_gift_cards_v4 for select to authenticated
using (public.is_reward_tenant_member(tenant_id) or public.has_role(auth.uid(), 'admin'));

create policy "members read own stamp cards"
on public.zr_stamp_cards for select to authenticated
using (member_id = auth.uid() or public.is_reward_tenant_member(tenant_id) or public.has_role(auth.uid(), 'admin'));

create policy "tenant members read security events"
on public.zr_security_events for select to authenticated
using (public.is_reward_tenant_member(tenant_id) or public.has_role(auth.uid(), 'admin'));

-- No insert/update/delete policies: QR challenges, API credentials, gift-card
-- balances and security events are written only by trusted server-side code.

create trigger zr_customer_segments_updated_at before update on public.zr_customer_segments
for each row execute function public.set_updated_at();
create trigger zr_automations_updated_at before update on public.zr_automations
for each row execute function public.set_updated_at();
create trigger zr_gift_cards_v4_updated_at before update on public.zr_gift_cards_v4
for each row execute function public.set_updated_at();
create trigger zr_stamp_cards_updated_at before update on public.zr_stamp_cards
for each row execute function public.set_updated_at();
create trigger zr_security_events_updated_at before update on public.zr_security_events
for each row execute function public.set_updated_at();

-- Development seed bound to the first existing tenant.
insert into public.zr_customer_segments (tenant_id, name, description, rules, estimated_members)
select t.id, s.name, s.description, s.rules, s.estimated_members
from (select id from public.reward_tenants order by created_at limit 1) t
cross join (values
  ('Lapsed 45 days','Customers who have not visited for 45 days','{"days_since_last_visit":{"gte":45}}'::jsonb,143),
  ('High value','Top spending customers','{"lifetime_value_cents":{"gte":50000}}'::jsonb,38)
) as s(name, description, rules, estimated_members);

insert into public.zr_automations (tenant_id, name, trigger_type, trigger_config, action_config, status)
select t.id, a.name, a.trigger_type, a.trigger_config, a.action_config, a.status
from (select id from public.reward_tenants order by created_at limit 1) t
cross join (values
  ('45-day win-back','win_back','{"days":45}'::jsonb,'{"bonus_points":500,"minimum_spend_cents":2000}'::jsonb,'active'),
  ('Points expiry reminder','expiry','{"days_before":30}'::jsonb,'{"channel":["push","email"]}'::jsonb,'active')
) as a(name, trigger_type, trigger_config, action_config, status);

insert into public.zr_stamp_cards (tenant_id, member_id, programme_name, stamps_required, current_stamps, reward_description)
select t.id, gen_random_uuid(), 'Coffee Club', 10, 7, 'One free regular coffee'
from (select id from public.reward_tenants order by created_at limit 1) t;

insert into public.zr_security_events (tenant_id, event_type, severity, risk_score, reasons, status)
select t.id, e.event_type, e.severity, e.risk_score, e.reasons, e.status
from (select id from public.reward_tenants order by created_at limit 1) t
cross join (values
  ('redemption_velocity','high',82,'["8 attempts in 4 minutes","new device"]'::jsonb,'blocked'),
  ('funding_low','medium',45,'["6 days projected remaining"]'::jsonb,'open'),
  ('duplicate_provider_event','low',10,'["idempotency key already processed"]'::jsonb,'resolved')
) as e(event_type, severity, risk_score, reasons, status);