export interface NotificationAdapter {
  send(input: {
    channel: "email" | "push" | "sms";
    recipient: string;
    templateKey: string;
    payload: Record<string, unknown>;
  }): Promise<{ externalId: string }>;
}

export interface BillingAdapter {
  createCheckout(input: {
    tenantId: string;
    planCode: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ checkoutUrl: string; externalId: string }>;
}

export type AffiliateCallbackStatus = "pending" | "approved" | "rejected" | "reversed";

export interface NormalizedAffiliateCallback {
  externalId: string;
  status: AffiliateCallbackStatus;
  commissionMinor: number;
  customerReference?: string;
  tenantId?: string;
  occurredAt?: string;
}

export interface AffiliateAdapter {
  verifyCallback(headers: Headers, rawBody: string): Promise<boolean>;
  normalizeCallback(payload: unknown): Promise<NormalizedAffiliateCallback>;
}
