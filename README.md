# Zoryn Rewards Hub

Brand: Zoryn
Slogan: Mehr als nur Punkte.
Positioning: One wallet for points, cashback, affiliate shopping, local offers and merchant rewards.

Zoryn should operate as a shared loyalty infrastructure across:

Direct Zoryn merchants
Kiezio, Rettio, Haccora, TrainDirekt and other LoungeTech products
Online affiliate retailers
Card-linked offer partners
Manufacturer-funded promotions
Travel, ticketing and service partners
Future co-branded debit-card programmes
1. Platform structure
Consumer iOS app ──────────────┐
Consumer Android app ──────────┤
Merchant iOS/Android app ──────┤
Merchant web portal ───────────┼── Python FastAPI platform
Admin portal ──────────────────┤              │
LoungeTech applications ───────┤              ├── Rewards engine
Affiliate networks ────────────┤              ├── Campaign engine
POS/e-commerce systems ────────┤              ├── Double-entry points ledger
Open Banking/card link ────────┘              ├── Settlement engine
                                               ├── Fraud engine
                                               └── Supabase
Recommended technology
Layer	Technology
Backend	Python 3.13+, FastAPI
Database	Supabase PostgreSQL
Authentication	Supabase Auth
Security	PostgreSQL RLS plus backend permissions
Files	Supabase Storage
Realtime	Supabase Realtime
Location	PostGIS
Background jobs	Celery or Dramatiq with Redis
Consumer iOS	Swift, SwiftUI
Consumer Android	Kotlin, Jetpack Compose
Merchant web	Next.js, TypeScript
Admin web	Next.js, TypeScript
Infrastructure	Docker, EU-hosted containers
Monitoring	Sentry and OpenTelemetry
Push	APNs and Firebase Cloud Messaging
Loyalty wallet	Apple Wallet and Google Wallet

Supabase provides PostgreSQL, authentication, storage and realtime capabilities. Auth-issued JWTs can be combined with Row Level Security so database rows are restricted to the relevant user or organisation.

Sensitive financial and points operations should nevertheless pass through FastAPI rather than allowing the apps to modify ledger tables directly.

2. Zoryn product surfaces
Consumer app

The consumer uses one Zoryn account across every connected LoungeTech application.

Main navigation:

Home
Shop
Nearby
Wallet
Profile

Core functions:

Universal points balance
Merchant-specific points
Pending points
Cashback balance
Offers and promotions
Online affiliate shopping
Nearby participating merchants
QR earning and redemption
Linked-card offers
Gift cards
Referral rewards
Family wallet
Transaction history
Digital receipts
Apple Wallet or Google Wallet pass
Privacy and consent controls
Support and disputes
Merchant app

The merchant app should prioritise checkout operations.

Main navigation:

Today
Earn
Redeem
Transactions
More

Functions:

Create earning QR
Scan customer membership QR
Accept points
Process refunds
View reward funding
View recent transactions
Staff login
Daily totals
Campaign performance
Fraud warnings
Settlement status
Merchant web portal

The portal provides more detailed management:

Organisation profile
Brands and locations
Staff and permissions
Loyalty programme settings
Campaign builder
Merchant-specific and universal points
Reward funding wallet
Customer segments
Analytics
Affiliate campaigns
Card-linked offers
POS integrations
Settlement statements
Billing and invoices
Support cases
Platform admin portal
Merchant onboarding
Consumer support
Rewards liability
Fraud management
Campaign approval
Affiliate reconciliation
Merchant settlement
User and merchant suspension
GDPR requests
Provider integrations
Audit logs
System health
3. User roles
Consumers
Standard customer

Can:

Earn and redeem points
Shop through affiliate links
Activate card-linked offers
View balances
Manage account
Add Wallet pass
Refer users
Open support cases
Family administrator

Can:

Invite family members
Share selected points
Set child-account restrictions
View pooled family activity
Family member

Can:

Earn points
Use permitted shared rewards
View only their own transactions unless sharing is enabled
Premium customer

Additional functions could include:

Higher selected reward rates
Point-expiry protection
Premium offers
Priority support
Family pooling
Travel benefits
Merchant roles
Merchant owner

Full access to:

Organisation settings
Billing
Funding
Staff
Locations
Campaigns
Analytics
Settlement
Integrations
Merchant administrator

Can manage:

Locations
Staff
Offers
Campaigns
Transactions

Cannot change:

Legal ownership
Settlement bank account
Primary contract
Finance manager

Can access:

Funding account
Invoices
Settlements
Redemptions
Reconciliation
Exports
Marketing manager

Can access:

Campaigns
Offers
Customer segments
Analytics
Promotional content

Cannot access customer identity beyond the permitted marketing relationship.

Location manager

Can:

Manage one or more assigned stores
View store performance
Manage local staff
Create local offers within limits
Cashier

Can only:

Issue earning transaction
Accept redemption
Process permitted same-day cancellation
View their recent checkout activity
Analyst

Read-only access to:

Aggregated reports
Campaign performance
Location comparisons
LoungeTech platform roles
Super administrator

Emergency and configuration access. Use sparingly and require MFA.

Operations administrator
Merchant onboarding
Account status
Location setup
Programme configuration
Customer support
Search customer account
View transaction explanations
Remove devices
Lock accounts
Create escalations

Customer-support staff should not be able to alter the points ledger directly.

Merchant support
Merchant configuration
POS troubleshooting
Campaign support
Settlement enquiries
Finance administrator
Merchant funding
Redemptions
Settlements
Affiliate commissions
Liability reports
Bank reconciliation
Fraud analyst
Suspicious transactions
Device activity
Referral abuse
Merchant collusion
Account takeover
Receipt fraud
Compliance and privacy officer
Consent records
GDPR requests
Data retention
Merchant due diligence
Policy management
Campaign administrator
Network campaigns
Sponsored promotions
Manufacturer offers
Promotional budgets
Affiliate manager
Affiliate advertisers
Commission rates
Tracking rules
Programme approvals
Declined commission analysis
Auditor

Read-only, time-limited access to relevant records and audit logs.

4. Consumer onboarding flow
Install app
→ Choose language
→ View value proposition
→ Sign up with Apple, Google, email or phone
→ Verify contact method
→ Accept Zoryn terms
→ Select required privacy settings
→ Optional marketing consent
→ Create universal wallet
→ Generate membership number
→ Show welcome reward
→ Add Zoryn to Apple/Google Wallet
→ Discover nearby and online offers
Minimum registration data

Initially request only:

First name
Email or mobile
Country
Preferred language
Date of birth only if required for an age-specific benefit
Terms acceptance

Do not force users to provide a complete demographic profile before using the service.

Progressive profiling

Ask for additional information only when necessary:

Postcode for local offers
Birthday for birthday rewards
Payment-card or bank link
Delivery address for physical reward
Identity verification for regulated financial products
5. Consumer home screen

The polished home screen should show:

Good afternoon, Amer

4,850 points
€48.50 value

[Scan] [Shop online] [Use points]

Pending rewards: 620 points

Near you
• Café Berlin – 3× points
• City Cinema – Spend points
• Barber Mitte – 2% back

Featured online
• Fashion retailer – 4 points/€1
• Hotel partner – up to 8 points/€1
UI principles
Show both points and euro value.
Keep one consistent rate, such as 100 points = €1.
Clearly separate pending and available points.
Always show whether a merchant supports:
Earn
Spend
Earn and spend
Avoid overwhelming users with dozens of banners.
Give one prominent action per screen.
6. Direct merchant earning flow
Customer scans merchant QR
Cashier enters transaction
→ Backend creates signed QR challenge
→ Customer scans
→ App displays merchant and purchase amount
→ Customer confirms
→ Backend checks campaign and fraud rules
→ Points ledger posts transaction
→ Customer sees updated balance
→ Merchant receives confirmation
Merchant scans customer QR
Customer opens membership QR
→ QR contains short-lived customer token
→ Cashier scans
→ Merchant enters purchase amount
→ Backend validates cashier and location
→ Reward calculation runs
→ Points move to customer wallet
→ Both receive receipt
POS-integrated transaction
Customer identifies account
→ POS completes sale
→ POS calls Zoryn API
→ Zoryn calculates reward
→ Points are posted
→ New balance returned to POS
7. Redemption flow
Customer selects “Use points”
→ Enters amount or chooses reward
→ Biometric confirmation
→ Backend creates 60-second redemption token
→ Merchant scans token
→ Backend locks customer balance
→ Merchant rules checked
→ Points ledger posts redemption
→ Merchant settlement payable created
→ Customer pays remaining balance
→ Receipt generated

Example:

Purchase value:           €40
Points used:           1,200 = €12
Card/cash payment:        €28

Merchant controls may include:

Maximum 20% of basket
Minimum €10 spend
No gift-card purchases
No tobacco or restricted goods
Only selected hours
Maximum daily customer redemption
8. Affiliate online-shopping flow
Customer finds retailer in Zoryn
→ Sees reward rate and conditions
→ Taps “Shop and earn”
→ Backend creates click reference
→ Customer redirects through affiliate network
→ Customer purchases
→ Network reports tracked transaction
→ Zoryn adds pending points
→ Retailer validates order
→ Affiliate commission approved
→ Points become available
Statuses
Clicked
Tracked
Pending
Approved
Available
Declined
Reversed
Reward calculation
Order value:                €100
Confirmed commission:         €8
Customer reward:              €5
Zoryn gross margin:           €3

The customer sees:

Earn 5 points per €1

They do not need to see the confidential affiliate commission.

9. Card-linked and Open Banking flow
Customer chooses “Link account”
→ Hosted regulated-provider journey
→ Select bank
→ Authenticate with bank
→ Grant account-information consent
→ Return to Zoryn
→ Eligible transactions imported
→ Merchant is matched
→ Campaign eligibility checked
→ Points added as pending
→ Booked transaction confirmed
→ Points become available

This does not create commission by itself. Zoryn only awards a commercial reward where:

The merchant has a direct Zoryn agreement
An affiliate/card-linked campaign funds it
A manufacturer funds it
LoungeTech funds it
A connected platform transaction funds it
10. LoungeTech cross-platform flow

Every connected LoungeTech product should call the same Zoryn API.

Example:

Rettio order completed
→ Rettio sends transaction to Zoryn
→ Zoryn identifies funding campaign
→ Customer receives sustainability points

TrainDirekt course completed
→ Training provider funds achievement bonus
→ Zoryn issues points

Kiezio restaurant booking paid
→ Merchant reward applies
→ Zoryn issues universal and merchant points
Internal API request
{
  "source_application": "rettio",
  "event_type": "order.completed",
  "customer_id": "uuid",
  "merchant_id": "uuid",
  "transaction_reference": "RET-2026-009812",
  "gross_amount_cents": 2450,
  "currency": "EUR",
  "occurred_at": "2026-07-25T13:45:00Z"
}
11. Merchant onboarding flow
Merchant applies
→ Email and mobile verification
→ Business information
→ Legal entity verification
→ Add beneficial owners if required
→ Accept merchant agreement
→ Choose programme type
→ Configure locations
→ Add settlement details
→ Deposit reward funding
→ Invite staff
→ Configure earn/spend rules
→ Test transaction
→ Compliance review
→ Go live
Programme options
Merchant-only

Points can only be spent with the issuing merchant.

Hybrid

Example:

75% merchant-specific points
25% universal points
Fully universal

All points may be spent across participating merchants.

Earn-only

Merchant funds points but does not accept redemptions.

Redemption-only

Merchant accepts points and receives settlement but does not issue points.

12. Merchant dashboard design
Overview
Today’s rewarded sales          €2,485
Points issued                    12,450
Points redeemed                   4,200
New customers                        18
Returning customers                  46
Reward budget remaining          €820
Campaign builder

Step-by-step wizard:

Goal
→ Audience
→ Locations
→ Timing
→ Reward
→ Budget
→ Preview
→ Approval
→ Launch

Campaign goals:

Attract new customers
Increase repeat visits
Fill quiet hours
Increase average order
Reactivate lost customers
Promote a product
Encourage cross-merchant spending
13. Supabase database design

Use separate PostgreSQL schemas:

public
identity
merchant
loyalty
campaign
affiliate
payment_event
settlement
fraud
notification
integration
audit
analytics
Core tables
Identity
profiles
devices
consent_records
user_preferences
family_groups
family_members
Merchant
organisations
brands
locations
organisation_members
terminals
merchant_documents
merchant_programme_settings
Loyalty
programmes
member_accounts
ledger_accounts
ledger_transactions
ledger_entries
reward_attributions
points_batches
redemption_tokens
Campaign
campaigns
campaign_rules
campaign_locations
campaign_segments
campaign_budgets
campaign_usage
Affiliate
affiliate_networks
affiliate_advertisers
affiliate_programmes
affiliate_links
affiliate_clicks
affiliate_transactions
affiliate_commissions
affiliate_adjustments
Settlement
merchant_funding_accounts
merchant_funding_movements
settlement_periods
settlement_lines
settlement_statements
settlement_payments
Fraud
risk_events
risk_scores
fraud_rules
fraud_cases
device_fingerprints
velocity_counters
blocked_entities
14. Double-entry points ledger

Never rely on a mutable points balance alone.

Accounts
Customer available
Customer pending
Customer locked
Merchant funding
Merchant redemption
Platform promotion
Affiliate funding
Expired points
Settlement payable
Merchant issues 500 points
Debit: Merchant funding account
Credit: Customer pending or available account
Customer redeems 500 points elsewhere
Debit: Customer available account
Credit: Merchant redemption account
Points expire
Debit: Customer available account
Credit: Expired points account

Entries are immutable. Corrections use reversing transactions.

15. Core SQL structure
create schema if not exists loyalty;

create table loyalty.ledger_transactions (
    id uuid primary key default gen_random_uuid(),
    transaction_type text not null,
    status text not null,
    idempotency_key text not null unique,
    reference_type text,
    reference_id text,
    actor_user_id uuid references auth.users(id),
    metadata jsonb not null default '{}',
    occurred_at timestamptz not null,
    created_at timestamptz not null default now()
);

create table loyalty.ledger_entries (
    id uuid primary key default gen_random_uuid(),
    transaction_id uuid not null
        references loyalty.ledger_transactions(id),
    ledger_account_id uuid not null,
    direction text not null
        check (direction in ('debit', 'credit')),
    amount bigint not null check (amount > 0),
    expires_at timestamptz,
    created_at timestamptz not null default now()
);

Points should be stored as integers:

100 points = €1
1 point = €0.01
16. Row Level Security

RLS is essential for client-visible Supabase tables. Supabase describes RLS as a PostgreSQL security mechanism that works with Supabase Auth to restrict user access to rows.

Example:

alter table public.profiles enable row level security;

create policy "user_reads_own_profile"
on public.profiles
for select
using (id = auth.uid());

create policy "user_updates_own_profile"
on public.profiles
for update
using (id = auth.uid())
with check (id = auth.uid());

Merchant access helper:

create or replace function public.is_org_member(target_org uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organisation_members om
    where om.organisation_id = target_org
      and om.user_id = auth.uid()
      and om.status = 'active'
  );
$$;

Add indexes to columns used heavily in RLS policies, such as user_id and organisation_id, because Supabase’s RLS guidance identifies indexing policy columns as an important performance measure.

17. Python backend structure
backend/
  app/
    main.py
    config.py

    api/
      v1/
        users.py
        merchants.py
        programmes.py
        earn.py
        redeem.py
        campaigns.py
        affiliate.py
        settlements.py
        support.py
        admin.py
        webhooks.py

    domain/
      loyalty/
      merchant/
      affiliate/
      settlement/
      fraud/
      notification/

    services/
      ledger_service.py
      reward_service.py
      redemption_service.py
      campaign_service.py
      affiliate_service.py
      settlement_service.py
      fraud_service.py
      notification_service.py

    repositories/
    schemas/
    integrations/
    workers/
    security/
    tests/
Reward endpoint
from uuid import UUID

from fastapi import APIRouter, Depends, Header
from pydantic import BaseModel, Field

router = APIRouter(prefix="/v1/rewards", tags=["rewards"])


class EarnRequest(BaseModel):
    member_id: UUID
    merchant_id: UUID
    location_id: UUID
    transaction_reference: str
    amount_cents: int = Field(gt=0, le=100_000_000)
    currency: str = Field(pattern=r"^[A-Z]{3}$")


class EarnResponse(BaseModel):
    transaction_id: UUID
    pending_points: int
    available_points: int
    balance: int


@router.post("/earn", response_model=EarnResponse)
async def earn_points(
    request: EarnRequest,
    idempotency_key: str = Header(alias="Idempotency-Key"),
    current_staff=Depends(require_cashier_permission),
    reward_service=Depends(get_reward_service),
) -> EarnResponse:
    return await reward_service.earn(
        request=request,
        actor=current_staff,
        idempotency_key=idempotency_key,
    )

Use FastAPI’s dependency and security mechanisms to validate access on every sensitive endpoint. FastAPI provides built-in patterns for security dependencies and JWT-based authentication.

18. Background workers

Use workers for:

Affiliate transaction import
Commission approval
Points release
Refund reversal
Settlement calculation
Point expiry
Expiry reminders
Campaign scheduling
Merchant statements
Push notifications
GDPR exports
Merchant reconciliation
Fraud scoring

FastAPI’s own BackgroundTasks mechanism is useful for lightweight post-response actions, but financially significant or resource-heavy processing should use a durable task queue. FastAPI documents its background-task feature as post-response execution rather than a replacement for a full distributed worker system.

19. Native iOS architecture

Use:

Swift
SwiftUI
Async/await
URLSession
Keychain
LocalAuthentication
MapKit
Core Location
AVFoundation for QR
PassKit
App Attest
APNs
SwiftData for selected offline caching

Apple’s PassKit framework supports loyalty cards and other passes in Apple Wallet and allows pass information to be updated.

iOS modules
ZorynApp
Core
  Networking
  Authentication
  Security
  Storage
  Analytics

Features
  Onboarding
  Home
  Wallet
  Shop
  Nearby
  MerchantDetails
  Offers
  QRScanner
  Redemption
  AffiliateShopping
  LinkedAccounts
  Family
  Profile
  Support

DesignSystem
Resources
Tests
iOS navigation

Use a five-tab SwiftUI interface:

Home
Shop
Scan
Nearby
Wallet

The scan action can be visually raised in the centre.

iOS security
Tokens in Keychain
Biometric confirmation for redemption
App Attest validation on the server
Short-lived QR tokens
Device registration
No Supabase service key in the app
No raw payment-card details
Mask app previews on sensitive screens

Apple provides device attestation verification guidance, and biometric APIs can be used for secure user confirmation.

20. Native Android architecture

Use:

Kotlin
Jetpack Compose
Coroutines and Flow
Hilt
Retrofit or Ktor
Room
DataStore
CameraX
ML Kit barcode scanner
Google Maps Compose
Firebase Cloud Messaging
BiometricPrompt
Play Integrity
Google Wallet
Android modules
:app
:core:model
:core:network
:core:database
:core:security
:core:designsystem
:feature:onboarding
:feature:home
:feature:wallet
:feature:shop
:feature:nearby
:feature:scanner
:feature:redemption
:feature:affiliate
:feature:profile
:feature:support

Use unidirectional data flow:

Compose screen
→ ViewModel
→ Use case
→ Repository
→ API/Room

Android’s Compose guidance uses state management and state hoisting to maintain predictable UI state.

Android security
Android Keystore
Biometric confirmation
Play Integrity token
Server-side integrity verification
Encrypted sensitive local data
Dynamic QR tokens
No service-role key
Rate limits and device risk scoring

Google states that Play Integrity can help confirm that requests originate from the genuine app on a genuine certified device, and integrity token verification should occur in a secure server environment rather than inside the client.

21. Zoryn Apple/Google Wallet pass

The loyalty pass should show:

Zoryn
Mehr als nur Punkte.

Amer Saleem
4,850 points
Gold member

Dynamic membership barcode

Functions:

View account
Show current balance
Open nearby offers
Identify customer at checkout
Update balance
Display relevant nearby merchant notification

Do not use the Wallet barcode as a permanent redemption credential. Generate a secure challenge in the app for spending points.

22. Polished UI design system

Use the logo’s existing visual identity.

Brand palette
Midnight:       #080B1A
Deep navy:      #11162D
Electric blue:  #2D69FF
Violet:         #713BFF
Soft purple:    #A58BFF
Cloud:          #F5F6FA
White:          #FFFFFF
Success:        #20B878
Warning:        #F2A900
Error:          #E5484D
Gradient
Purple → Electric blue → Light blue

Use the gradient only for:

Z icon
Main CTA
Active wallet card
Progress indicators
Premium campaign highlights

Do not apply gradients to every component.

Typography
Large, bold numerical balance
Clean geometric sans-serif
Clear hierarchy
Short German labels
Minimum 16px body copy on mobile
High contrast in dark mode
Components
Balance card
Merchant card
Offer tile
Earning-rate badge
Earn/spend status badge
Transaction row
Campaign card
QR action sheet
Confirmation bottom sheet
Error/retry state
Skeleton loading state
23. Consumer screen flow
Splash
→ Onboarding
→ Registration
→ Welcome reward
→ Home
   ├── Shop online
   ├── Nearby merchant
   ├── Scan
   ├── Wallet
   └── Offer detail
Shop flow
Shop
→ Category or search
→ Retailer profile
→ Reward conditions
→ Shop and earn
→ Affiliate redirect
→ Return to Zoryn
→ Pending purchase notification
Nearby flow
Nearby
→ Map/list
→ Filters
→ Merchant
→ Earn/spend conditions
→ Directions
→ Scan or redeem
Wallet flow
Wallet
→ Universal balance
→ Merchant balances
→ Pending points
→ Transaction
→ Detailed attribution
→ Dispute
24. Merchant app checkout UX
Earn screen
Enter purchase amount
→ Optional receipt reference
→ Select reward rule
→ Generate QR
→ Customer scans
→ Success animation
Redeem screen
Scan customer redemption QR
→ Show customer-selected amount
→ Confirm
→ Display remaining customer payment
→ Success

Use large touch targets and reduce checkout to fewer than five actions.

25. Fraud and abuse controls
Customer risks
Multiple fake accounts
Referral farming
Affiliate self-referrals
Duplicate receipts
Account takeover
Reward laundering
Repeated refunds
Merchant risks
Fake purchases
Cashier/customer collusion
Inflated purchase amounts
Repeated self-awarding
Excessive refunds
Unauthorised redemptions
Controls
Device fingerprint
IP risk
App integrity
Transaction velocity
Location comparison
Merchant terminal identification
Pending points
Daily/monthly reward limits
Duplicate transaction fingerprint
Manual review
Merchant funding limit
Cashier permission limits
Biometric confirmation
26. Settlement flow
Customer redeems at Merchant C
→ Zoryn reduces customer points
→ Redemption liability released
→ Merchant C settlement line created
→ Redemption fee deducted
→ Settlement period closes
→ Statement generated
→ Merchant paid
→ Bank payment reconciled

Example:

Customer redemption value        €10.00
Merchant reimbursement             €9.70
Zoryn redemption fee                €0.30

The exact settlement and VAT treatment should be reviewed by a German tax adviser before launch.

27. Notification events

Consumer:

Points earned
Points pending
Points available
Points expiring
Redemption completed
Affiliate commission declined
New nearby offer
Referral completed
Login from new device

Merchant:

Reward budget low
Large redemption
Campaign approved
Settlement ready
Merchant funding received
Suspicious cashier activity
Integration failure
28. API groups
Consumer
GET    /v1/me
GET    /v1/wallet
GET    /v1/wallet/transactions
GET    /v1/merchants/nearby
GET    /v1/offers
POST   /v1/qr/claim
POST   /v1/redemptions/token
POST   /v1/referrals
POST   /v1/support/cases
Merchant
POST   /v1/merchant/earn/challenge
POST   /v1/merchant/redemptions/accept
POST   /v1/merchant/refunds
GET    /v1/merchant/dashboard
GET    /v1/merchant/transactions
POST   /v1/merchant/campaigns
GET    /v1/merchant/settlements
Affiliate
POST   /v1/affiliate/click
POST   /v1/webhooks/affiliate/{network}
GET    /v1/affiliate/retailers
GET    /v1/affiliate/transactions
LoungeTech internal
POST   /v1/internal/rewards/earn
POST   /v1/internal/rewards/reverse
GET    /v1/internal/members/{id}/wallet
29. Delivery roadmap
Phase 1: platform foundation
Supabase structure
Auth
Roles
RLS
Organisations
Locations
Audit logs
Design system
Phase 2: direct loyalty
Ledger
Universal points
Merchant points
QR earning
Redemption
Refunds
Merchant funding
Phase 3: native consumer apps
iOS and Android
Wallet
Merchant discovery
Offers
QR
Transaction history
Push
Wallet passes
Phase 4: merchant operations
Merchant web portal
Merchant native checkout app
Campaigns
Staff roles
Settlement
Billing
Phase 5: affiliate marketplace
Awin adapter
Other affiliate adapters
Click tracking
Pending/approved rewards
Commission reconciliation
Online retailer directory
Phase 6: LoungeTech integration
Kiezio
Rettio
Haccora
TrainDirekt
EventPlanr
Transport platforms
Phase 7: card-linked rewards
Regulated provider
Hosted consent
Transaction ingestion
Merchant matching
Card-linked campaigns
Phase 8: scale
POS plugins
E-commerce plugins
Gift-card API
Manufacturer offers
Employer programmes
White-label loyalty
Co-branded payment card
30. Minimum viable launch

The first commercial version should include:

Consumers
German and English
Registration
Universal wallet
Points balance
Pending balance
Merchant directory
Affiliate retailers
Offers
QR earning
Points redemption
Transaction history
Referral
Wallet pass
Push notifications
Merchants
Registration
Business verification
Locations
Staff
Earn QR
Redemption scanner
Merchant-specific and universal points
Funding balance
Campaigns
Transactions
Refunds
Settlement statements
Platform
Double-entry points ledger
Affiliate tracking
Merchant funding
Settlement engine
Fraud rules
RLS
Audit logs
Support console
GDPR workflows
Monitoring and backups

Zoryn should launch as a rewards wallet and merchant network, not as a banking app. The debit-card and broader financial functions can then be added through regulated partners once the core merchant, affiliate and customer network is active.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3f2d333e-3b47-43d8-b144-ed0600c95954).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
