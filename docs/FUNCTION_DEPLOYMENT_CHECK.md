# Backend endpoint deployment verification

This stack uses TanStack server routes and server functions instead of standalone edge functions.

Required endpoints:

- `POST /api/public/rewards/events` — provider webhook (HMAC verified)
- `POST /api/public/rewards/scheduled-jobs` — scheduled jobs (shared secret)
- `GET /api/public/rewards/health` — platform health

Server functions: secure reward action, QR issue/consume, billing, reconciliation, go-live, pilot operations.

For each endpoint record: deployed, authenticated correctly, rejects invalid callers, logged in `zr_job_runs` or `audit_log` where applicable.
