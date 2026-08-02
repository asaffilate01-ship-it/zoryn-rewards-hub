import { describe, expect, it } from "vitest";

/**
 * Permission matrix mirrored from the merchant/tenant role model.
 * Keep in sync with the role checks used by the reward server functions.
 */
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  owner: [
    "campaigns:write",
    "campaigns:read",
    "funding:read",
    "funding:write",
    "billing:read",
    "settlements:read",
    "rewards:issue",
    "rewards:redeem",
    "team:manage",
  ],
  finance_manager: ["funding:read", "funding:write", "billing:read", "settlements:read"],
  marketing_manager: ["campaigns:write", "campaigns:read"],
  analyst: ["campaigns:read", "settlements:read"],
  cashier: ["rewards:issue", "rewards:redeem"],
};

export function can(role: string, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

describe("role permission matrix", () => {
  it("gives owners full control", () => {
    expect(can("owner", "team:manage")).toBe(true);
    expect(can("owner", "funding:write")).toBe(true);
  });

  it("blocks cashiers from finance data", () => {
    expect(can("cashier", "funding:read")).toBe(false);
    expect(can("cashier", "billing:read")).toBe(false);
    expect(can("cashier", "rewards:redeem")).toBe(true);
  });

  it("limits marketing managers to campaigns", () => {
    expect(can("marketing_manager", "settlements:read")).toBe(false);
    expect(can("marketing_manager", "funding:write")).toBe(false);
    expect(can("marketing_manager", "campaigns:write")).toBe(true);
  });

  it("keeps analysts read-only", () => {
    expect(can("analyst", "campaigns:write")).toBe(false);
    expect(can("analyst", "rewards:issue")).toBe(false);
    expect(can("analyst", "settlements:read")).toBe(true);
  });

  it("denies unknown roles everything", () => {
    expect(can("guest", "campaigns:read")).toBe(false);
  });
});
