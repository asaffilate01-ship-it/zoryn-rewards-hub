import { describe, expect, it } from "vitest";

const billing: Record<string, string[]> = {
  trialing: ["active", "cancelled"],
  active: ["past_due", "paused", "cancelled"],
  past_due: ["active", "paused", "cancelled"],
  paused: ["active", "cancelled"],
  cancelled: [],
};

const affiliate: Record<string, string[]> = {
  pending: ["approved", "declined", "reversed"],
  approved: ["paid", "reversed"],
  declined: [],
  reversed: [],
  paid: ["reversed"],
};

describe("integration lifecycles", () => {
  it("supports billing recovery from past_due", () => {
    expect(billing["past_due"]).toContain("active");
  });

  it("blocks direct reactivation of a cancelled subscription", () => {
    expect(billing["cancelled"]).not.toContain("active");
  });

  it("supports affiliate reversal after approval and payout", () => {
    expect(affiliate["approved"]).toContain("reversed");
    expect(affiliate["paid"]).toContain("reversed");
  });

  it("treats declined affiliate transactions as terminal", () => {
    expect(affiliate["declined"]).toHaveLength(0);
  });
});
