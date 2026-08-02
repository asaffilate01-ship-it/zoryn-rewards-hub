begin;

select plan(14);

-- Tenant and reward core tables exist
select has_table('public', 'reward_tenants');
select has_table('public', 'reward_tenant_members');
select has_table('public', 'reward_wallets');
select has_table('public', 'reward_campaigns');
select has_table('public', 'reward_funding_accounts');
select has_table('public', 'reward_ledger_entries');
select has_table('public', 'reward_external_events');

-- Sensitive tables must have row level security enabled
select has_rls('public', 'reward_wallets');
select has_rls('public', 'reward_campaigns');
select has_rls('public', 'reward_funding_accounts');
select has_rls('public', 'reward_ledger_entries');
select has_rls('public', 'zr_mobile_devices');
select has_rls('public', 'zr_launch_acceptance');
select has_rls('public', 'zr_scheduled_job_configs');

select * from finish();
rollback;
