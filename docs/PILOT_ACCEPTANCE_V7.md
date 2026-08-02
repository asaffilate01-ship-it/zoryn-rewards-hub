# Pilot acceptance (v7)

Complete every item before the pilot goes live.

## Automated gates

- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run test:coverage`
- [ ] `npm run build`
- [ ] `npm run test:e2e` (desktop Chrome and mobile viewport)
- [ ] `supabase db reset && supabase test db`

## Scheduled jobs

- [ ] `CRON_SHARED_SECRET` configured
- [ ] `funding-thresholds` job runs and records a `passed` row in `zr_job_runs`
- [ ] `liability-snapshots` job writes a snapshot per tenant
- [ ] `notification-retry` job drains the outbox with backoff and dead-lettering

## Health

- [ ] `GET /api/public/rewards/health` returns `healthy` in a clean environment
- [ ] The endpoint returns `degraded` (503) when a job fails or a critical alert is open

## Operations

- [ ] `/pilot-operations` shows jobs, cases, alerts and restore evidence
- [ ] Support and complaint cases can be raised and progressed
- [ ] Backup restore drill recorded in `zr_backup_restore_evidence` with ledger and tenant-isolation checks

## Security

- [ ] RLS verified: a member of tenant A cannot read tenant B data
- [ ] Scheduled-job endpoint rejects requests without the shared secret
- [ ] No PII returned from any `/api/public/*` endpoint
