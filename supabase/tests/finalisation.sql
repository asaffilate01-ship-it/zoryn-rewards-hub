begin;
select plan(8);

select has_function('public', 'zr_execute_reward_action', array['uuid','uuid','text','text','jsonb','jsonb']);
select has_function('public', 'zr_reverse_reward_transaction', array['uuid','text','text','text']);
select has_function('public', 'zr_enforce_funding_thresholds', array[]::text[]);

select has_table('public', 'zr_billing_plans');
select has_table('public', 'zr_subscriptions_v2');
select has_table('public', 'zr_reconciliation_runs');
select has_table('public', 'zr_consent_records');
select has_table('public', 'zr_release_acceptance');

select * from finish();
rollback;
