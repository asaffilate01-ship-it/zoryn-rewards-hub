import type {
  AffiliateAdapter,
  BillingAdapter,
  NormalizedAffiliateCallback,
  NotificationAdapter,
} from "./contracts";

export class MockNotificationAdapter implements NotificationAdapter {
  async send(): Promise<{ externalId: string }> {
    return { externalId: `notify_${crypto.randomUUID()}` };
  }
}

export class MockBillingAdapter implements BillingAdapter {
  async createCheckout(input: {
    tenantId: string;
    planCode: string;
  }): Promise<{ checkoutUrl: string; externalId: string }> {
    const externalId = `checkout_${crypto.randomUUID()}`;
    return {
      externalId,
      checkoutUrl: `https://billing.example.test/${externalId}?plan=${encodeURIComponent(input.planCode)}`,
    };
  }
}

export class MockAffiliateAdapter implements AffiliateAdapter {
  async verifyCallback(): Promise<boolean> {
    return true;
  }

  async normalizeCallback(payload: unknown): Promise<NormalizedAffiliateCallback> {
    const p = (payload ?? {}) as Record<string, unknown>;
    const status = String(p["status"] ?? "pending");
    return {
      externalId: String(p["id"] ?? crypto.randomUUID()),
      status: (["pending", "approved", "rejected", "reversed"].includes(status)
        ? status
        : "pending") as NormalizedAffiliateCallback["status"],
      commissionMinor: Number(p["commissionMinor"] ?? 0),
      ...(p["customerReference"] ? { customerReference: String(p["customerReference"]) } : {}),
      ...(p["tenantId"] ? { tenantId: String(p["tenantId"]) } : {}),
      ...(p["occurredAt"] ? { occurredAt: String(p["occurredAt"]) } : {}),
    };
  }
}

export const notificationAdapter: NotificationAdapter = new MockNotificationAdapter();
export const billingAdapter: BillingAdapter = new MockBillingAdapter();
export const affiliateAdapter: AffiliateAdapter = new MockAffiliateAdapter();
