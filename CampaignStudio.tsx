import type { CampaignSummary, MerchantOverview, Scenario, WalletBalance } from '../types/domain';

export const demoMerchant: MerchantOverview = {
  tenantName: 'Café Berlin Rewards',
  plan: 'growth',
  locations: 3,
  members: 2840,
  monthlyRewardedSalesCents: 14862000,
  issuedPoints: 286400,
  redeemedPoints: 117800,
  liabilityCents: 168600,
  fundingBalanceCents: 820000,
  activeCampaigns: 4,
};

export const demoWallet: WalletBalance[] = [
  { label: 'Universal Zoryn Points', type: 'universal_points', amount: 4850, euroValueCents: 4850 },
  { label: 'Café Berlin Points', type: 'merchant_points', amount: 1320, euroValueCents: 1320 },
  { label: 'Pending rewards', type: 'universal_points', amount: 620, euroValueCents: 620, state: 'pending' },
  { label: 'Cashback', type: 'cashback', amount: 1275, euroValueCents: 1275 },
  { label: 'Gift credit', type: 'gift_credit', amount: 2500, euroValueCents: 2500, expiresAt: '2027-01-31' },
];

export const demoCampaigns: CampaignSummary[] = [
  { id: 'quiet-hours', name: 'Quiet Hours 3×', status: 'active', goal: 'Fill quiet hours', reward: '3× points', audience: 'All members', spendCents: 28400, budgetCents: 90000, attributedRevenueCents: 214600 },
  { id: 'winback', name: '60-day Win-back', status: 'active', goal: 'Reactivate customers', reward: '500 bonus points', audience: 'Dormant 60+ days', spendCents: 17500, budgetCents: 50000, attributedRevenueCents: 98100 },
  { id: 'birthday', name: 'Birthday Treat', status: 'scheduled', goal: 'Increase loyalty', reward: 'Free pastry voucher', audience: 'Birthday month', spendCents: 0, budgetCents: 30000, attributedRevenueCents: 0 },
];

export const demoScenarios: Scenario[] = [
  { id: 'pending-affiliate', area: 'consumer', title: 'Affiliate reward pending', description: '620 points wait for retailer approval and return-period expiry.', status: 'attention' },
  { id: 'low-funding', area: 'merchant', title: 'Merchant funding below threshold', description: 'A location has fewer than 14 days of projected reward funding.', status: 'attention' },
  { id: 'duplicate-event', area: 'integration', title: 'Duplicate Adyen event blocked', description: 'Idempotency protection prevented a second reward attribution.', status: 'healthy' },
  { id: 'refund-reversal', area: 'integration', title: 'Refund reversal queued', description: 'Reward reversal is awaiting the original attribution lookup.', status: 'attention' },
  { id: 'liability-alert', area: 'platform', title: 'Universal liability threshold', description: 'Network liability is approaching the configured treasury threshold.', status: 'critical' },
  { id: 'campaign-roi', area: 'merchant', title: 'Quiet-hours campaign performing', description: 'Attributed revenue is 7.6× campaign reward cost.', status: 'healthy' },
];
