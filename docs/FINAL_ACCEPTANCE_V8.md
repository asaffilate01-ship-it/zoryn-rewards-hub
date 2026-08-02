# Final acceptance (v8)

Every gate below must be recorded in `zr_launch_acceptance` before public launch.
The `/final-launch` dashboard reflects the latest record.

## Engineering

- [ ] `npm run check` (typecheck, lint, coverage, build) passes
- [ ] `npm run test:e2e` passes on desktop and mobile projects
- [ ] `supabase db reset && supabase test db` passes, including tenant isolation tests

## Security

- [ ] Tenant isolation proven with two tenants (RLS behaviour tests)
- [ ] Role matrix enforced (cashier blocked from finance, marketing limited)
- [ ] Scheduler and affiliate callback reject unsigned requests
- [ ] No PII returned from any `/api/public/*` endpoint

## Operations

- [ ] All jobs in `zr_scheduled_job_configs` scheduled and recording runs
- [ ] Monitoring checks writing to `zr_monitoring_checks`
- [ ] Backup restore drill recorded with ledger and isolation verification
- [ ] Incident and reconciliation owners assigned

## Legal

- [ ] Consumer terms, merchant agreement, privacy notice, cookie policy and affiliate disclosure approved

## Pilot

- [ ] Earn, redeem, reversal and settlement completed with pilot merchants
- [ ] Mobile release checklist (`docs/MOBILE_RELEASE_V8.md`) complete
