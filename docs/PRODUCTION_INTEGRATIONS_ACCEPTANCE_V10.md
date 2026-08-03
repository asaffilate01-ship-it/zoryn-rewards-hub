# Production integrations acceptance (v10)

Stage 10 wires provider-neutral production integrations plus the evidence tables
needed to sign off a live launch.

## Scope

| Area | Table | Owner |
| --- | --- | --- |
| Email / push / SMS | `zr_integration_connections` (`integration_type = email\|push`) | Platform ops |
| Merchant billing | `zr_billing_subscriptions` | Commercial |
| Affiliate networks | `zr_affiliate_transactions` | Partnerships |
| Monitoring | `zr_monitoring_alert_events` | Platform ops |
| Backup / restore drills | `zr_backup_restore_runs` | Platform ops |

All five tables are admin-only: RLS allows access solely to users holding the
`admin` role. Server code reaches them through the service-role client after an
explicit role check.

## Runtime adapters

`src/features/integrations/runtime/` holds the contracts and mock
implementations:

- `contracts.ts` — `ProductionNotificationAdapter`, `ProductionBillingAdapter`,
  `ProductionAffiliateAdapter`.
- `mockProductionAdapters.ts` — deterministic mocks used for validation.
- `adapterFactory.server.ts` — returns mocks while `INTEGRATION_MODE=mock` and
  throws `live_*_adapter_not_configured` otherwise, so a half-configured live
  environment fails loudly instead of silently no-oping.

Real provider credentials stay server-side and are only added after the mock
run is green.

## Endpoints

`GET /api/public/rewards/integration-health` returns aggregate integration state
only — type, provider, environment, status, last success timestamp and the open
alert count. It returns `503` when any connection is degraded/offline or a
critical alert is open. It never exposes tenant, user or credential data.

## Acceptance checklist

- [ ] `npm run production:validate` passes in mock mode.
- [ ] `npm run test:production-integrations` passes.
- [ ] `supabase test db` passes, including `10_production_integrations_schema.sql`.
- [ ] `/production-integrations` loads for an admin and is inaccessible otherwise.
- [ ] `/api/public/rewards/integration-health` returns healthy/degraded and no PII.
- [ ] At least one passed `zr_backup_restore_runs` record with ledger, tenant
      isolation and scheduler verification set.
- [ ] No open `critical` rows in `zr_monitoring_alert_events`.
