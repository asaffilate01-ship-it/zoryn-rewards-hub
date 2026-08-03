export interface ProductionNotificationAdapter {
  send(input: {
    channel: "email" | "push" | "sms";
    recipient: string;
    templateKey: string;
    payload: Record<string, unknown>;
    idempotencyKey: string;
  }): Promise<{ externalId: string; status: "accepted" | "sent" }>;
}

export interface ProductionBillingAdapter {
  createCustomer(input: {
    tenantId: string;
    email: string;
    name: string;
  }): Promise<{ customerId: string }>;
  createCheckout(input: {
    tenantId: string;
    customerId: string;
    planCode: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ checkoutId: string; checkoutUrl: string }>;
  cancelSubscription(input: { subscriptionId: string; atPeriodEnd: boolean }): Promise<void>;
}

export type AffiliateTransactionStatus = "pending" | "approved" | "declined" | "reversed";

export interface NormalizedAffiliateTransaction {
  providerTransactionId: string;
  status: AffiliateTransactionStatus;
  commissionMinor: number;
  saleAmountMinor?: number;
  currency: string;
  clickReference?: string;
  orderReference?: string;
}

export interface ProductionAffiliateAdapter {
  createTrackedUrl(input: {
    clickReference: string;
    merchantReference?: string;
    destinationUrl: string;
  }): Promise<string>;
  verifyWebhook(input: { rawBody: string; headers: Headers }): Promise<boolean>;
  normalizeTransaction(payload: unknown): Promise<NormalizedAffiliateTransaction>;
}
