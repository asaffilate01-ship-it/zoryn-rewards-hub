export type RewardSource = 'swan' | 'adyen' | 'affiliate' | 'loungetech' | 'merchant' | 'manual';
export type RewardEventType =
  | 'card.transaction.authorised'
  | 'card.transaction.booked'
  | 'card.transaction.reversed'
  | 'payment.authorised'
  | 'payment.captured'
  | 'payment.refunded'
  | 'payment.chargeback.opened'
  | 'affiliate.commission.approved'
  | 'loungetech.activity.completed';

export interface RewardFinancialEvent {
  event_id: string;
  event_type: RewardEventType;
  source: RewardSource;
  occurred_at: string;
  provider_reference: string;
  platform_user_id?: string;
  member_id?: string;
  merchant_id?: string;
  merchant_name?: string;
  merchant_category_code?: string;
  amount_cents: number;
  currency: string;
  status?: 'pending' | 'booked' | 'reversed';
  metadata?: Record<string, unknown>;
}

export interface RewardWalletSummary {
  available_points: number;
  pending_points: number;
  merchant_points: number;
  cashback_cents: number;
  gift_credit_cents: number;
  euro_value_cents: number;
  tier: string;
}
