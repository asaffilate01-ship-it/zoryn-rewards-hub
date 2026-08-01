# Zoryn Rewards Hub Production Upgrade v3

Non-destructive overlay for `asaffilate01-ship-it/zoryn-rewards-hub`.

## Purpose

This upgrade turns the existing Rewards Hub into a more complete standalone, multi-tenant and white-label loyalty SaaS while preserving integration with Zoryn Money, ZorynPay and other LoungeTech products.

## Adds

- Multi-tenant organisations, brands, locations and staff roles
- Merchant onboarding and programme setup
- Universal, merchant, cashback, gift-credit and stamp programmes
- Campaign builder model, budgets, audience rules and lifecycle states
- Unified customer wallet, pending rewards and expiry information
- CRM segmentation, customer value and churn-risk structures
- Gift cards, coupons, referrals and membership tiers
- Funding accounts, reward liability and settlement controls
- Provider event ingestion for Swan, Adyen, affiliate and LoungeTech events
- Idempotent reward attribution and reversal records
- Billing plans and white-label configuration
- Operational dashboards and realistic demo scenarios
- Secure Edge Function boundaries for sensitive operations

## Merge

Copy the contents of this folder into the root of the existing repository and allow `src`, `supabase` and `docs` to merge.

Do not manually edit `src/routeTree.gen.ts`. TanStack Router regenerates it.

## New routes

- `/rewards-production`
- `/merchant-onboarding`
- `/campaign-studio`
- `/liability-centre`
- `/rewards-scenario-lab`

## Supabase

Apply:

1. `supabase/migrations/20260801210000_rewards_production_upgrade.sql`
2. `supabase/seed.rewards-production.sql` in development only

Deploy:

- `rewards-platform-api`
- `rewards-event-worker`
- `rewards-demo-reset`
