# Zoryn Rewards Hub — Standalone + Zoryn Platform Overlay

This overlay is designed for the existing public repository `asaffilate01-ship-it/zoryn-rewards-hub`.
It preserves the current TanStack Start + Vite + React + Supabase + Capacitor architecture.

## What it adds
- Multi-tenant standalone/white-label rewards programmes
- Universal points, merchant points, cashback and gift-credit wallets
- Immutable double-entry rewards ledger
- Financial-event ingestion for Swan, Adyen, affiliate and LoungeTech events
- Campaign rules and merchant matching
- Reward funding and liability records
- Redemption and reversal support
- Zoryn Platform integration client and shared contracts
- Merchant integrations screen
- Seeded development data

## Merge
Copy the folders in this overlay into the repository root. Do not delete existing files.

## Database
Apply:
`supabase/migrations/20260801150000_zoryn_rewards_unified.sql`

Optional development data:
`supabase/seed.zoryn-integration.sql`

## Edge functions
Deploy:
- `rewards-event-ingest`
- `rewards-api`

Set secrets:
- `REWARDS_INGEST_SECRET`
- `ZORYN_PLATFORM_ORIGIN`

## Important
The browser must never write directly to ledger tables. Financial and points mutations go through Edge Functions or a trusted backend.
