create extension if not exists pgcrypto;

do $$ begin create type public.reward_tenant_mode as enum ('standalone','zoryn_integrated','white_label'); exception when duplicate_object then null; end $$;
do $$ begin create type public.reward_currency as enum ('universal_points','merchant_points','cashback_cents','gift_credit_cents','promo_credit_cents'); exception when duplicate_object then null; end $$;
do $$ begin create type public.reward_entry_direction as enum ('credit','debit'); exception when duplicate_object then null; end $$;
do $$ begin create type public.reward_entry_status as enum ('pending','available','reversed','expired','cancelled'); exception when duplicate_object then null; end $$;
do $$ begin create type public.reward_source as enum ('card','payment','qr','affiliate','referral','campaign','manual','gift_card','loungetech_app','adjustment'); exception when duplicate_object then null; end $$;
do $$ begin create type public.reward_event_status as enum ('received','processing','processed','ignored','failed'); exception when duplicate_object then null; end $$;

create table if not exists public.reward_tenants (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  mode reward_tenant_mode not null default 'standalone',
  owner_organisation_id uuid,
  brand jsonb not null default '{}'::jsonb,
  settings jsonb not null default '{"points_per_euro":1,"point_value_cents":1,"expiry_months":24}'::jsonb,
  status text not null default 'active',
  created_at timestamptz not null default now()
);
grant select on public.reward_tenants to authenticated;
grant all on public.reward_tenants to service_role;
alter table public.reward_tenants enable row level security;

create table if not exists public.reward_tenant_members (
  tenant_id uuid references public.reward_tenants(id) on delete cascade,
  user_id uuid not null,
  role text not null check (role in ('owner','admin','finance','marketing','manager','cashier','analyst','support','viewer')),
  location_ids uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  primary key (tenant_id,user_id)
);
grant select on public.reward_tenant_members to authenticated;
grant all on public.reward_tenant_members to service_role;
alter table public.reward_tenant_members enable row level security;

create or replace function public.is_reward_tenant_member(_tenant_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.reward_tenant_members tm where tm.tenant_id = _tenant_id and tm.user_id = auth.uid())
$$;

create table if not exists public.reward_programmes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.reward_tenants(id) on delete cascade,
  name text not null,
  programme_type text not null check(programme_type in ('universal','merchant','cashback','stamp','gift_card','membership')),
  currency reward_currency not null,
  conversion jsonb not null default '{}'::jsonb,
  rules jsonb not null default '{}'::jsonb,
  status text not null default 'active',
  created_at timestamptz not null default now()
);
grant select on public.reward_programmes to authenticated;
grant all on public.reward_programmes to service_role;
alter table public.reward_programmes enable row level security;

create table if not exists public.reward_memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.reward_tenants(id) on delete cascade,
  platform_user_id uuid not null,
  external_customer_id text,
  membership_number text unique not null,
  tier text not null default 'bronze',
  family_group_id uuid,
  preferences jsonb not null default '{}'::jsonb,
  joined_at timestamptz not null default now(),
  status text not null default 'active',
  unique(tenant_id,platform_user_id)
);
grant select on public.reward_memberships to authenticated;
grant all on public.reward_memberships to service_role;
alter table public.reward_memberships enable row level security;

create table if not exists public.reward_wallets (
  id uuid primary key default gen_random_uuid(),
  membership_id uuid not null references public.reward_memberships(id) on delete cascade,
  programme_id uuid not null references public.reward_programmes(id) on delete cascade,
  available bigint not null default 0,
  pending bigint not null default 0,
  lifetime_earned bigint not null default 0,
  lifetime_redeemed bigint not null default 0,
  version bigint not null default 0,
  updated_at timestamptz not null default now(),
  unique(membership_id,programme_id)
);
grant select on public.reward_wallets to authenticated;
grant all on public.reward_wallets to service_role;
alter table public.reward_wallets enable row level security;

create table if not exists public.reward_ledger_entries (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.reward_tenants(id),
  wallet_id uuid not null references public.reward_wallets(id),
  direction reward_entry_direction not null,
  amount bigint not null check(amount > 0),
  status reward_entry_status not null,
  source reward_source not null,
  source_reference text not null,
  counterparty_wallet_id uuid,
  funding_source text,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  available_at timestamptz,
  expires_at timestamptz,
  reversed_entry_id uuid references public.reward_ledger_entries(id),
  created_at timestamptz not null default now(),
  unique(tenant_id,source,source_reference,direction,wallet_id)
);
grant select on public.reward_ledger_entries to authenticated;
grant all on public.reward_ledger_entries to service_role;
alter table public.reward_ledger_entries enable row level security;

create table if not exists public.reward_merchants (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.reward_tenants(id) on delete cascade,
  organisation_id uuid,
  name text not null,
  merchant_group text,
  mcc text,
  provider_merchant_ids jsonb not null default '{}'::jsonb,
  card_match_rules jsonb not null default '[]'::jsonb,
  status text not null default 'active',
  created_at timestamptz not null default now()
);
grant select on public.reward_merchants to authenticated;
grant all on public.reward_merchants to service_role;
alter table public.reward_merchants enable row level security;

create table if not exists public.reward_locations (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.reward_merchants(id) on delete cascade,
  name text not null,
  address jsonb not null default '{}'::jsonb,
  provider_store_ids jsonb not null default '{}'::jsonb,
  timezone text not null default 'Europe/Berlin',
  status text not null default 'active'
);
grant select on public.reward_locations to authenticated;
grant all on public.reward_locations to service_role;
alter table public.reward_locations enable row level security;

create table if not exists public.reward_campaigns (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.reward_tenants(id) on delete cascade,
  merchant_id uuid references public.reward_merchants(id),
  name text not null,
  campaign_type text not null check(campaign_type in ('earn','cashback','bonus','stamp','coupon','challenge','referral','winback','birthday','sponsored')),
  audience jsonb not null default '{}'::jsonb,
  trigger_rules jsonb not null default '{}'::jsonb,
  reward_rules jsonb not null default '{}'::jsonb,
  budget jsonb not null default '{}'::jsonb,
  starts_at timestamptz,
  ends_at timestamptz,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);
grant select on public.reward_campaigns to authenticated;
grant all on public.reward_campaigns to service_role;
alter table public.reward_campaigns enable row level security;

create table if not exists public.reward_funding_accounts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.reward_tenants(id) on delete cascade,
  merchant_id uuid references public.reward_merchants(id),
  balance_cents bigint not null default 0,
  reserved_cents bigint not null default 0,
  currency text not null default 'EUR',
  updated_at timestamptz not null default now()
);
grant select on public.reward_funding_accounts to authenticated;
grant all on public.reward_funding_accounts to service_role;
alter table public.reward_funding_accounts enable row level security;

create table if not exists public.reward_external_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.reward_tenants(id),
  provider text not null,
  event_type text not null,
  provider_event_id text not null,
  platform_user_id uuid,
  merchant_id uuid,
  amount_cents bigint,
  currency text,
  payload jsonb not null,
  status reward_event_status not null default 'received',
  attempts int not null default 0,
  error text,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  unique(provider,provider_event_id)
);
grant all on public.reward_external_events to service_role;
alter table public.reward_external_events enable row level security;

create table if not exists public.reward_attributions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.reward_external_events(id) on delete cascade,
  campaign_id uuid references public.reward_campaigns(id),
  membership_id uuid not null references public.reward_memberships(id),
  wallet_id uuid not null references public.reward_wallets(id),
  reward_amount bigint not null,
  reward_value_cents bigint not null default 0,
  funding_source text not null,
  ledger_entry_id uuid references public.reward_ledger_entries(id),
  created_at timestamptz not null default now()
);
grant all on public.reward_attributions to service_role;
alter table public.reward_attributions enable row level security;

create table if not exists public.reward_redemption_orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.reward_tenants(id),
  membership_id uuid not null references public.reward_memberships(id),
  merchant_id uuid references public.reward_merchants(id),
  wallet_id uuid not null references public.reward_wallets(id),
  points bigint not null check(points > 0),
  value_cents bigint not null check(value_cents > 0),
  payment_provider text,
  payment_reference text,
  token_hash text,
  status text not null default 'reserved',
  expires_at timestamptz,
  created_at timestamptz not null default now()
);
grant select on public.reward_redemption_orders to authenticated;
grant all on public.reward_redemption_orders to service_role;
alter table public.reward_redemption_orders enable row level security;

create table if not exists public.reward_integrations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.reward_tenants(id) on delete cascade,
  integration_type text not null,
  provider text not null,
  config jsonb not null default '{}'::jsonb,
  secret_reference text,
  status text not null default 'sandbox',
  last_event_at timestamptz,
  created_at timestamptz not null default now(),
  unique(tenant_id,integration_type,provider)
);
grant select on public.reward_integrations to authenticated;
grant all on public.reward_integrations to service_role;
alter table public.reward_integrations enable row level security;

create table if not exists public.reward_api_keys (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.reward_tenants(id) on delete cascade,
  name text not null,
  key_prefix text not null,
  key_hash text not null,
  scopes text[] not null default '{}',
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);
grant all on public.reward_api_keys to service_role;
alter table public.reward_api_keys enable row level security;

create table if not exists public.reward_outbox (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.reward_tenants(id),
  topic text not null,
  aggregate_id uuid,
  payload jsonb not null,
  status text not null default 'pending',
  attempts int not null default 0,
  available_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
grant all on public.reward_outbox to service_role;
alter table public.reward_outbox enable row level security;

create or replace function public.reward_post_entry(
  p_wallet_id uuid,p_direction reward_entry_direction,p_amount bigint,p_status reward_entry_status,
  p_source reward_source,p_reference text,p_description text default null,p_metadata jsonb default '{}'::jsonb
) returns uuid language plpgsql security definer set search_path = public as $$
declare v_wallet public.reward_wallets%rowtype; v_tenant uuid; v_id uuid;
begin
  if p_amount <= 0 then raise exception 'amount_must_be_positive'; end if;
  select w.* into v_wallet from public.reward_wallets w where w.id=p_wallet_id for update;
  if not found then raise exception 'wallet_not_found'; end if;
  select m.tenant_id into v_tenant from public.reward_memberships m where m.id=v_wallet.membership_id;
  insert into public.reward_ledger_entries(tenant_id,wallet_id,direction,amount,status,source,source_reference,description,metadata)
  values(v_tenant,p_wallet_id,p_direction,p_amount,p_status,p_source,p_reference,p_description,p_metadata) returning id into v_id;
  update public.reward_wallets set
    available = available + case when p_status='available' then (case when p_direction='credit' then p_amount else -p_amount end) else 0 end,
    pending = pending + case when p_status='pending' then (case when p_direction='credit' then p_amount else -p_amount end) else 0 end,
    lifetime_earned = lifetime_earned + case when p_direction='credit' then p_amount else 0 end,
    lifetime_redeemed = lifetime_redeemed + case when p_direction='debit' then p_amount else 0 end,
    version=version+1,updated_at=now()
  where id=p_wallet_id;
  if (select available from public.reward_wallets where id=p_wallet_id) < 0 then raise exception 'insufficient_rewards'; end if;
  insert into public.reward_outbox(tenant_id,topic,aggregate_id,payload) values(v_tenant,'rewards.ledger.posted',p_wallet_id,jsonb_build_object('entry_id',v_id));
  return v_id;
end $$;

create policy tenant_members_read_tenant on public.reward_tenants for select to authenticated using (public.is_reward_tenant_member(id));
create policy tenant_members_read_members on public.reward_tenant_members for select to authenticated using (user_id = auth.uid() or public.is_reward_tenant_member(tenant_id));
create policy tenant_members_read_programmes on public.reward_programmes for select to authenticated using (public.is_reward_tenant_member(tenant_id));
create policy consumer_read_membership on public.reward_memberships for select to authenticated using (platform_user_id=auth.uid() or public.is_reward_tenant_member(tenant_id));
create policy consumer_read_wallets on public.reward_wallets for select to authenticated using (exists(select 1 from public.reward_memberships m where m.id=membership_id and (m.platform_user_id=auth.uid() or public.is_reward_tenant_member(m.tenant_id))));
create policy consumer_read_ledger on public.reward_ledger_entries for select to authenticated using (exists(select 1 from public.reward_wallets w join public.reward_memberships m on m.id=w.membership_id where w.id=wallet_id and (m.platform_user_id=auth.uid() or public.is_reward_tenant_member(m.tenant_id))));
create policy tenant_members_read_merchants on public.reward_merchants for select to authenticated using (public.is_reward_tenant_member(tenant_id));
create policy tenant_members_read_locations on public.reward_locations for select to authenticated using (exists(select 1 from public.reward_merchants rm where rm.id=merchant_id and public.is_reward_tenant_member(rm.tenant_id)));
create policy tenant_members_read_campaigns on public.reward_campaigns for select to authenticated using (public.is_reward_tenant_member(tenant_id));
create policy tenant_members_read_funding on public.reward_funding_accounts for select to authenticated using (public.is_reward_tenant_member(tenant_id));
create policy tenant_members_read_integrations on public.reward_integrations for select to authenticated using (public.is_reward_tenant_member(tenant_id));
create policy consumer_read_redemption_orders on public.reward_redemption_orders for select to authenticated using (exists(select 1 from public.reward_memberships m where m.id=membership_id and (m.platform_user_id=auth.uid() or public.is_reward_tenant_member(m.tenant_id))));

insert into public.reward_tenants(id,slug,name,mode,brand) values
('10000000-0000-0000-0000-000000000001','zoryn-network','Zoryn Rewards Network','zoryn_integrated','{"primary":"#0f2f2d","accent":"#d7ff4f","name":"Zoryn Rewards"}'),
('10000000-0000-0000-0000-000000000002','cafe-berlin','Cafe Berlin Loyalty','standalone','{"primary":"#5a2d1f","accent":"#f6c96b","name":"Cafe Berlin Rewards"}')
on conflict do nothing;

insert into public.reward_programmes(id,tenant_id,name,programme_type,currency,conversion,rules,status) values
('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','Universal Zoryn Points','universal','universal_points','{"100_points_value_cents":100}','{"card_points_per_euro":1}','active'),
('20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','Zoryn Cashback','cashback','cashback_cents','{"unit":"cent"}','{}','active'),
('20000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000002','Cafe Berlin Points','merchant','merchant_points','{"100_points_value_cents":100}','{"points_per_euro":5}','active')
on conflict do nothing;

insert into public.reward_merchants(id,tenant_id,name,merchant_group,mcc,provider_merchant_ids,card_match_rules) values
('30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','Cafe Berlin','Cafe Berlin','5812','{"adyen":"MRC-CB-001","swan_descriptor":"CAFE BERLIN"}','[{"field":"merchant_name","operator":"contains","value":"CAFE BERLIN"}]'),
('30000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','REWE City','REWE','5411','{}','[{"field":"merchant_name","operator":"contains","value":"REWE"}]')
on conflict do nothing;

insert into public.reward_campaigns(id,tenant_id,merchant_id,name,campaign_type,trigger_rules,reward_rules,budget,status,starts_at,ends_at) values
('40000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','Cafe Berlin 5x','earn','{"minimum_amount_cents":500}','{"points_per_euro":5,"wallet":"universal"}','{"funding":"merchant"}','active',now()-interval '30 day',now()+interval '365 day'),
('40000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001',null,'Zoryn Card Base Reward','earn','{"source":"card","minimum_amount_cents":100}','{"points_per_euro":1,"wallet":"universal"}','{"funding":"interchange"}','active',now()-interval '30 day',now()+interval '365 day')
on conflict do nothing;