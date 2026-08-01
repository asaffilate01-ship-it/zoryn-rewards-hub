# Architecture

Zoryn Rewards remains independently sellable while integrating with Zoryn Money and ZorynPay.

```text
Standalone merchants / white-label tenants ─┐
Affiliate networks                          ├──> Zoryn Rewards API -> campaign engine -> ledger
LoungeTech apps                             │
Zoryn Platform (Swan/Adyen events) ─────────┘
```

## Ownership boundaries

Rewards owns programme rules, wallets, reward liability, campaigns, redemptions and reward history.
Zoryn Platform owns banking UX, account/card references, payment UX and financial-event delivery.
Swan remains source of truth for accounts/cards/SEPA. Adyen remains source of truth for acquiring/payments.

## Idempotency
Every inbound event must provide a globally unique `event_id` and `provider_reference`. Re-delivery returns the original attribution rather than issuing rewards twice.

## Points vs money
Points and promotional credit are not bank deposits. Cashback may only move to a Zoryn money account after settlement and an approved conversion workflow.
