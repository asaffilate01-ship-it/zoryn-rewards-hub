
# Zoryn build plan

Your spec targets Python FastAPI + native iOS/Android. Lovable can't build those. I'll deliver the same product logic on Lovable's stack:

- **Frontend:** TanStack Start + React + Tailwind (one responsive web app; mobile layouts included so iOS/Android can wrap it later or reuse the API).
- **Backend:** Lovable Cloud (Supabase Postgres + Auth + RLS + Storage + Realtime), with TanStack server functions replacing FastAPI endpoints. Same schemas, same double-entry ledger, same RLS model as your spec.
- **Native apps / Wallet passes / Open Banking / Celery workers:** out of scope for Lovable, but the API + schema will be ready for them.

Given the scale (30 sections, 3 surfaces, 8 phases), I'll build in staged deliveries and check in after each. Each stage ends with a working, testable slice.

## Stage 1 — Foundation (this turn)
1. Enable Lovable Cloud.
2. Design system in `src/styles.css`: Zoryn palette (midnight, deep navy, electric blue, violet, soft purple, cloud), gradient token, typography scale, dark-mode-first tokens. All semantic — no hardcoded colors in components.
3. Marketing landing at `/` — Zoryn brand, slogan "Mehr als nur Punkte.", positioning, hero, feature grid, CTA to sign up. German + English copy.
4. Auth pages (`/auth`, `/reset-password`) with email/password + Google. `profiles` table + trigger, `user_roles` table + `has_role()` function + `app_role` enum (consumer, family_admin, merchant_owner, merchant_admin, cashier, admin, support, fraud_analyst, etc.).
5. `_authenticated` gate + role-based sub-gates (`_consumer`, `_merchant`, `_admin`).
6. Sitemap, robots, per-route SEO.

## Stage 2 — Loyalty core & consumer wallet
1. Schemas: `identity`, `merchant`, `loyalty`, `campaign` (as separate Postgres schemas per spec §13).
2. Double-entry ledger tables (`ledger_accounts`, `ledger_transactions`, `ledger_entries`) with immutability trigger and integer amounts (100 pts = €1).
3. Server functions: `earn`, `redeem`, `reverse`, `getWallet`, `getTransactions` — all with idempotency keys, RLS as caller, ledger posting in a single transaction.
4. Consumer app shell (`/app`): 5-tab layout — Home, Shop, Scan, Nearby, Wallet.
5. Home screen with balance card (points + € value), pending, quick actions, near-you and featured-online stubs.
6. Wallet screen with universal + per-merchant balances, transactions list, dispute action.
7. Onboarding flow (progressive profiling per spec §4) + welcome reward.

## Stage 3 — Merchant portal & checkout
1. Merchant onboarding wizard (§11) + org, brand, location, staff tables with `is_org_member()` helper.
2. Merchant portal (`/merchant`): overview dashboard, locations, staff & permissions, campaigns, funding wallet, transactions, settlements.
3. Merchant checkout surface (web version of the native app): earn QR generator, customer-QR scanner (camera via `getUserMedia`), amount entry, redemption acceptance, refunds.
4. Programme settings (merchant-only / hybrid / universal / earn-only / redemption-only).
5. Campaign builder wizard (goal → audience → locations → timing → reward → budget → preview → launch).

## Stage 4 — Affiliate, offers, nearby
1. `affiliate_*` tables + click tracking server route (`/api/public/affiliate/click`) + webhook receiver (`/api/public/webhooks/affiliate/[network]`) with HMAC verification.
2. Consumer Shop tab: retailer directory, reward rate display (customer-facing only), "Shop & earn" redirect flow, pending → available status.
3. Nearby tab with PostGIS location matching (map or list; map optional depending on library fit for Worker runtime — likely list + static geocoding).
4. Offers surface + campaign eligibility.

## Stage 5 — Admin & operations
1. Admin portal (`/admin`): merchant onboarding review, consumer support console (read-only ledger view, no direct writes), fraud cases, campaign approval, settlement runs, GDPR export/delete, audit logs.
2. `audit` schema + append-only trigger on sensitive tables.
3. Fraud tables + basic rules (velocity counters, duplicate transaction fingerprint, device fingerprint).
4. Settlement engine: nightly (manual trigger for now) — closes period, generates statements, marks payable.

## Stage 6 — Notifications, cross-platform, polish
1. In-app notifications table + realtime subscription.
2. LoungeTech internal API (`/api/public/internal/rewards/*`) with shared-secret auth for Kiezio/Rettio/Haccora/TrainDirekt to post events.
3. Referral flow, family wallet, Premium tier flag.
4. i18n (DE/EN) across surfaces.
5. Security memory + hardening pass.

## What I need from you between stages
- Nothing to unblock Stage 1; I'll proceed on approval.
- After Stage 1 you'll see the brand, landing, and auth. If anything's off (palette weight, tone, German copy), we correct there before building deeper.
- I'll flag any spec item I can't do on this stack (e.g. real Open Banking needs a regulated provider; Apple/Google Wallet passes need a native signing service) and propose alternatives.

## Technical notes
- Points stored as `bigint` (cents-equivalent).
- Every ledger mutation via `createServerFn` with `.middleware([requireSupabaseAuth])` — clients never write to ledger tables directly.
- Every `public.*` table gets explicit `GRANT`s + RLS policies + indexed policy columns.
- `user_roles` uses `SECURITY DEFINER has_role()` (never role-on-profile).
- All new tables live in their spec schemas but are exposed through `public` views where the client needs read access (Supabase Data API only sees `public`).

## Approve to start Stage 1
Reply "go" (or edit any stage) and I'll enable Cloud and build the foundation.
