# Scheduler deployment (v8)

All scheduled work runs through one secured server route:

`POST /api/public/rewards/scheduler`

Header: `x-cron-secret: <CRON_SHARED_SECRET>`
Body: `{"job":"<job-name>"}`

| Job                     | Schedule       | Effect                                             |
| ----------------------- | -------------- | -------------------------------------------------- |
| `campaign-state-update` | `*/5 * * * *`  | Activates scheduled campaigns, completes ended ones |
| `funding-thresholds`    | `*/15 * * * *` | Pauses underfunded campaigns, raises alerts         |
| `liability-snapshots`   | `0 2 * * *`    | Writes a liability snapshot per tenant              |
| `notification-retry`    | `*/5 * * * *`  | Drains the outbox with backoff and dead-lettering   |

Job definitions live in `zr_scheduled_job_configs`; disabling a row makes the
endpoint skip that job. Every invocation writes an audit row to `zr_job_runs`
(`running` → `passed` / `failed`) and stamps `last_run_at` on the config.

## pg_cron example

```sql
select cron.schedule(
  'zoryn-campaign-state-update',
  '*/5 * * * *',
  $$
  select net.http_post(
    url := 'https://project--3f2d333e-3b47-43d8-b144-ed0600c95954.lovable.app/api/public/rewards/scheduler',
    headers := '{"Content-Type":"application/json","x-cron-secret":"<CRON_SHARED_SECRET>"}'::jsonb,
    body := '{"job":"campaign-state-update"}'::jsonb
  );
  $$
);
```

Repeat with the schedule and job name from the table above. The legacy
`/api/public/rewards/scheduled-jobs` route remains available and behaves
identically for the three pilot jobs.
