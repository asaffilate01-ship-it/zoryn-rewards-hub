# External adapters

Provider-neutral contracts live in `src/features/integrations/contracts.ts`, with
mock implementations in `mockAdapters.ts`.

| Contract              | Purpose                                        | Replace with            |
| --------------------- | ---------------------------------------------- | ----------------------- |
| `NotificationAdapter` | Email, push and SMS delivery                   | Resend / APNs+FCM / SMS |
| `BillingAdapter`      | Merchant subscription checkout                 | Stripe / Paddle         |
| `AffiliateAdapter`    | Affiliate-network callback verify + normalise   | Awin / Tradedoubler     |

## Affiliate callbacks

`POST /api/public/rewards/affiliate-callback`

- Requires header `x-affiliate-signature: sha256=<hex>` — HMAC-SHA256 of the raw
  request body using `AFFILIATE_WEBHOOK_SECRET`, compared in constant time.
- Body is validated with Zod and must contain `id` and a `tenantId` (UUID).
- Events are inserted into `reward_external_events` with `provider = 'affiliate'`.
  A repeated `provider_event_id` for the same tenant returns
  `{ accepted: true, duplicate: true }` instead of double-crediting.
- Returns `202` on first acceptance, `401` on bad signature, `400` on bad payload,
  `503` when the secret is not configured.

Keep every provider credential server-side; adapters must never be imported into
browser bundles with secrets attached.
