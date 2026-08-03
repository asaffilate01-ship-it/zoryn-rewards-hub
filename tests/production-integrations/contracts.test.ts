import { describe, expect, it } from "vitest";
import {
  MockProductionAffiliateAdapter,
  MockProductionBillingAdapter,
  MockProductionNotificationAdapter,
} from "@/features/integrations/runtime/mockProductionAdapters";

describe("production integration contracts", () => {
  it("sends mock notifications", async () => {
    const result = await new MockProductionNotificationAdapter().send();
    expect(result.status).toBe("sent");
    expect(result.externalId).toMatch(/^mock_notification_/);
  });

  it("creates a mock checkout carrying the plan code", async () => {
    const result = await new MockProductionBillingAdapter().createCheckout({ planCode: "growth" });
    expect(result.checkoutUrl).toContain("growth");
  });

  it("creates affiliate tracking links", async () => {
    const url = await new MockProductionAffiliateAdapter().createTrackedUrl({
      clickReference: "click-1",
      destinationUrl: "https://example.test",
    });
    expect(url).toContain("zoryn_click=click-1");
  });

  it("normalises unknown affiliate statuses to pending", async () => {
    const normalized = await new MockProductionAffiliateAdapter().normalizeTransaction({
      id: "tx-1",
      status: "bogus",
      commissionMinor: 250,
    });
    expect(normalized).toMatchObject({
      providerTransactionId: "tx-1",
      status: "pending",
      commissionMinor: 250,
      currency: "EUR",
    });
  });
});
