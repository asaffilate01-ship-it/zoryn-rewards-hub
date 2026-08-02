# Scheduled background jobs

Jobs run as a server route, not an edge function: `POST /api/public/rewards/scheduled-jobs`.

Header: `x-cron-secret: <CRON_SHARED_SECRET>`
Body: `{"job":"funding-thresholds"}` | `{"job":"liability-snapshots"}` | `{"job":"notification-retry"}`

Every invocation writes a row to `zr_job_runs` (`running` → `passed` / `failed`).

## Schedule with pg_cron

```sql
select cron.schedule(
  'zoryn-funding-thresholds',
  '*/15 * * * *',
  $$
  select net.http_post(
    url := 'https://project--3f2d333e-3b47-43d8-b144-ed0600c95954.lovable.app/api/public/rewards/scheduled-jobs',
    headers := '{"Content-Type":"application/json","x-cron-secret":"<CRON_SHARED_SECRET>"}'::jsonb,
    body := '{"job":"funding-thresholds"}'::jsonb
  );
  $$
);

select cron.schedule(
  'zoryn-liability-snapshots',
  '0 2 * * *',
  $$
  select net.http_post(
    url := 'https://project--3f2d333e-3b47-43d8-b144-ed0600c95954.lovable.app/api/public/rewards/scheduled-jobs',
    headers := '{"Content-Type":"application/json","x-cron-secret":"<CRON_SHARED_SECRET>"}'::jsonb,
    body := '{"job":"liability-snapshots"}'::jsonb
  );
  $$
);

select cron.schedule(
  'zoryn-notification-retry',
  '*/5 * * * *',
  $$
  select net.http_post(
    url := 'https://project--3f2d333e-3b47-43d8-b144-ed0600c95954.lovable.app/api/public/rewards/scheduled-jobs',
    headers := '{"Content-Type":"application/json","x-cron-secret":"<CRON_SHARED_SECRET>"}'::jsonb,
    body := '{"job":"notification-retry"}'::jsonb
  );
  $$
);
```

## Health

`GET /api/public/rewards/health` returns counts only (no PII) and 503 when degraded.
