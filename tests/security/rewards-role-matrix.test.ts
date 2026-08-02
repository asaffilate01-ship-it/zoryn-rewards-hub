import { describe, expect, it } from "vitest";
const p = {
  owner: ["funding:read", "billing:read", "settlements:read", "campaigns:write"],
  finance_manager: ["funding:read", "settlements:read"],
  marketing_manager: ["campaigns:write", "analytics:read"],
  cashier: ["rewards:issue", "rewards:redeem"],
  support: ["support:read", "support:write"],
};
const can = (r: string, x: string) => p[r as keyof typeof p]?.includes(x) ?? false;
describe("role matrix", () => {
  it("blocks cashier finance access", () => {
    expect(can("cashier", "funding:read")).toBe(false);
    expect(can("cashier", "settlements:read")).toBe(false);
  });
  it("blocks support ledger writes", () => expect(can("support", "ledger:write")).toBe(false));
  it("limits marketing", () => {
    expect(can("marketing_manager", "campaigns:write")).toBe(true);
    expect(can("marketing_manager", "settlements:read")).toBe(false);
  });
});
