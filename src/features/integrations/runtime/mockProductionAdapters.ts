import type {
  AffiliateTransactionStatus,
  NormalizedAffiliateTransaction,
  ProductionAffiliateAdapter,
  ProductionBillingAdapter,
  ProductionNotificationAdapter,
} from "./contracts";

const AFFILIATE_STATUSES: AffiliateTransactionStatus[] = [
  "pending",
  "approved",
  "declined",
  "reversed",
];

export class MockProductionNotificationAdapter implements ProductionNotificationAdapter {
  async send(): Promise<{ externalId: string; status: "accepted" | "sent" }> {
    return { externalId: `mock_notification_${crypto.randomUUID()}`, status: "sent" };
  }
}

export class MockProductionBillingAdapter implements ProductionBillingAdapter {
  async createCustomer(): Promise<{ customerId: string }> {
    return { customerId: `mock_customer_${crypto.randomUUID()}` };
  }

  async createCheckout(input: {
    planCode: string;
  }): Promise<{ checkoutId: string; checkoutUrl: string }> {
    const checkoutId = `mock_checkout_${crypto.randomUUID()}`;
    return {
      checkoutId,
      checkoutUrl: `https://billing.example.test/${checkoutId}?plan=${encodeURIComponent(input.planCode)}`,
    };
  }

  async cancelSubscription(): Promise<void> {
    // Mock provider: cancellation is a no-op.
  }
}

export class MockProductionAffiliateAdapter implements ProductionAffiliateAdapter {
  async createTrackedUrl(input: {
    clickReference: string;
    destinationUrl: string;
  }): Promise<string> {
    const url = new URL(input.destinationUrl);
    url.searchParams.set("zoryn_click", input.clickReference);
    return url.toString();
  }

  async verifyWebhook(): Promise<boolean> {
    return true;
  }

  async normalizeTransaction(payload: unknown): Promise<NormalizedAffiliateTransaction> {
    const p = (payload ?? {}) as Record<string, unknown>;
    const rawStatus = String(p["status"] ?? "pending");
    const status = (
      AFFILIATE_STATUSES.includes(rawStatus as AffiliateTransactionStatus) ? rawStatus : "pending"
    ) as AffiliateTransactionStatus;

    return {
      providerTransactionId: String(p["id"] ?? crypto.randomUUID()),
      status,
      commissionMinor: Number(p["commissionMinor"] ?? 0),
      saleAmountMinor: Number(p["saleAmountMinor"] ?? 0),
      currency: String(p["currency"] ?? "EUR"),
      ...(p["clickReference"] ? { clickReference: String(p["clickReference"]) } : {}),
      ...(p["orderReference"] ? { orderReference: String(p["orderReference"]) } : {}),
    };
  }
}
