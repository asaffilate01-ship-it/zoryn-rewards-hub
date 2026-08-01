export interface RewardEventInput {
  eventId: string;
  source: 'swan' | 'adyen' | 'affiliate' | 'loungetech' | 'merchant';
  eventType: string;
  occurredAt: string;
  memberReference?: string;
  merchantReference?: string;
  amountCents?: number;
  currency?: string;
  providerReference?: string;
  metadata?: Record<string, unknown>;
}

const apiUrl = import.meta.env.VITE_REWARDS_PLATFORM_API_URL ?? '/functions/v1/rewards-platform-api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
  });
  if (!response.ok) throw new Error(`Rewards API failed (${response.status})`);
  return response.json() as Promise<T>;
}

export const rewardsPlatformClient = {
  wallet: () => request<{ balances: unknown[] }>('/wallet'),
  merchantDashboard: () => request<Record<string, unknown>>('/merchant/dashboard'),
  campaigns: () => request<{ campaigns: unknown[] }>('/merchant/campaigns'),
  createCampaign: (body: Record<string, unknown>) => request('/merchant/campaigns', { method: 'POST', body: JSON.stringify(body) }),
  ingestEvent: (event: RewardEventInput) => request('/internal/events', { method: 'POST', body: JSON.stringify(event) }),
};
