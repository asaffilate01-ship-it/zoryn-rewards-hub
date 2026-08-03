import type {
  ProductionAffiliateAdapter,
  ProductionBillingAdapter,
  ProductionNotificationAdapter,
} from "./contracts";
import {
  MockProductionAffiliateAdapter,
  MockProductionBillingAdapter,
  MockProductionNotificationAdapter,
} from "./mockProductionAdapters";

function integrationMode(): string {
  return process.env["INTEGRATION_MODE"] ?? "mock";
}

export function createNotificationAdapter(): ProductionNotificationAdapter {
  if (integrationMode() === "mock") return new MockProductionNotificationAdapter();
  throw new Error("live_notification_adapter_not_configured");
}

export function createBillingAdapter(): ProductionBillingAdapter {
  if (integrationMode() === "mock") return new MockProductionBillingAdapter();
  throw new Error("live_billing_adapter_not_configured");
}

export function createAffiliateAdapter(): ProductionAffiliateAdapter {
  if (integrationMode() === "mock") return new MockProductionAffiliateAdapter();
  throw new Error("live_affiliate_adapter_not_configured");
}
