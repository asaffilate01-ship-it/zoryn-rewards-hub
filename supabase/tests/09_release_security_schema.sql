begin;
select plan(10);

-- Stage 9 release evidence tables
select has_table('public', 'zr_release_security_evidence');
select has_table('public', 'zr_release_blockers');
select has_rls('public', 'zr_release_security_evidence');
select has_rls('public', 'zr_release_blockers');

-- Core multi-tenant rewards tables this project actually uses
select has_table('public', 'reward_tenants');
select has_table('public', 'reward_tenant_members');
select has_table('public', 'reward_wallets');
select has_table('public', 'reward_ledger_entries');
select has_rls('public', 'reward_wallets');
select has_rls('public', 'reward_ledger_entries');

select * from finish();
rollback;
