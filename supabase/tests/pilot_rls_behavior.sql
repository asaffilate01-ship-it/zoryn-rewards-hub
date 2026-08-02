begin;

select plan(10);

select has_table('public', 'zr_notification_outbox');
select has_table('public', 'zr_support_cases_v2');
select has_table('public', 'zr_support_case_events');
select has_table('public', 'zr_job_runs');
select has_table('public', 'zr_backup_restore_evidence');
select has_function('public', 'zr_queue_notification', array['uuid','uuid','text','text','jsonb']);
select has_function('public', 'zr_create_liability_snapshot', array['uuid']);
select has_rls('public', 'zr_notification_outbox');
select has_rls('public', 'zr_support_cases_v2');
select has_rls('public', 'zr_job_runs');

select * from finish();
rollback;
