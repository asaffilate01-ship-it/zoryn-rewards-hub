begin;
select plan(10);

select has_table('public', 'zr_integration_connections');
select has_table('public', 'zr_billing_subscriptions');
select has_table('public', 'zr_affiliate_transactions');
select has_table('public', 'zr_monitoring_alert_events');
select has_table('public', 'zr_backup_restore_runs');

select has_rls('public', 'zr_integration_connections');
select has_rls('public', 'zr_billing_subscriptions');
select has_rls('public', 'zr_affiliate_transactions');
select has_rls('public', 'zr_monitoring_alert_events');
select has_rls('public', 'zr_backup_restore_runs');

select * from finish();
rollback;
