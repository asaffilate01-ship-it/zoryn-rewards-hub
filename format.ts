export type ProgrammeType =
  | 'universal_points'
  | 'merchant_points'
  | 'cashback'
  | 'stamp_card'
  | 'gift_credit'
  | 'membership';

export type ProgrammeStatus = 'draft' | 'review' | 'active' | 'paused' | 'closed';
export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed';
export type RewardState = 'pending' | 'available' | 'locked' | 'redeemed' | 'expired' | 'reversed';
export type FundingSource = 'merchant' | 'zoryn' | 'affiliate' | 'interchange' | 'manufacturer' | 'loungetech';

export interface WalletBalance {
  label: string;
  type: ProgrammeType;
  amount: number;
  euroValueCents: number;
  state?: RewardState;
  expiresAt?: string;
}

export interface MerchantOverview {
  tenantName: string;
  plan: 'starter' | 'growth' | 'pro' | 'enterprise';
  locations: number;
  members: number;
  monthlyRewardedSalesCents: number;
  issuedPoints: number;
  redeemedPoints: number;
  liabilityCents: number;
  fundingBalanceCents: number;
  activeCampaigns: number;
}

export interface CampaignSummary {
  id: string;
  name: string;
  status: CampaignStatus;
  goal: string;
  reward: string;
  audience: string;
  spendCents: number;
  budgetCents: number;
  attributedRevenueCents: number;
}

export interface Scenario {
  id: string;
  area: 'consumer' | 'merchant' | 'platform' | 'integration';
  title: string;
  description: string;
  status: 'healthy' | 'attention' | 'critical';
}
