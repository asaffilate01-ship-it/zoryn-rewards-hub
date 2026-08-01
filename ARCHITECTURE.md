import type { RewardFinancialEvent, RewardWalletSummary } from '../types/contracts';

const apiUrl = import.meta.env.VITE_REWARDS_API_URL ?? '/functions/v1/rewards-api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  if (!response.ok) throw new Error(`Rewards API failed: ${response.status}`);
  return response.json() as Promise<T>;
}

export const rewardsClient = {
  wallet(memberId: string) {
    return request<RewardWalletSummary>(`/wallet/${encodeURIComponent(memberId)}`);
  },
  ingest(event: RewardFinancialEvent, secret?: string) {
    return request<{ accepted: boolean; attribution_id?: string }>('/events', {
      method: 'POST',
      headers: secret ? { 'x-ingest-secret': secret } : undefined,
      body: JSON.stringify(event),
    });
  },
};
