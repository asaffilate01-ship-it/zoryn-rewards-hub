import { describe, expect, it } from "vitest";
import { z } from "zod";

const ledgerEntry = z.object({
  wallet_id: z.string().uuid(),
  direction: z.enum(["credit", "debit"]),
  amount: z.number().int().positive().max(10_000_000),
});

const rewardActionInput = z.object({
  tenantId: z.string().uuid(),
  transactionType: z.enum(["earn", "redeem", "reverse"]),
  idempotencyKey: z.string().min(12).max(128),
  entries: z.array(ledgerEntry).min(2).max(10),
});

const base = {
  tenantId: "00000000-0000-0000-0000-000000000101",
  transactionType: "earn" as const,
  idempotencyKey: "pilot-earn-000001",
  entries: [
    {
      wallet_id: "00000000-0000-0000-0000-000000000201",
      direction: "credit" as const,
      amount: 500,
    },
    {
      wallet_id: "00000000-0000-0000-0000-000000000202",
      direction: "debit" as const,
      amount: 500,
    },
  ],
};

function isBalanced(entries: typeof base.entries) {
  const credit = entries.filter((e) => e.direction === "credit").reduce((a, e) => a + e.amount, 0);
  const debit = entries.filter((e) => e.direction === "debit").reduce((a, e) => a + e.amount, 0);
  return credit === debit;
}

describe("go-live secure reward action", () => {
  it("accepts a balanced double-entry action", () => {
    expect(rewardActionInput.safeParse(base).success).toBe(true);
    expect(isBalanced(base.entries)).toBe(true);
  });

  it("rejects a single-sided posting", () => {
    expect(rewardActionInput.safeParse({ ...base, entries: [base.entries[0]] }).success).toBe(
      false,
    );
  });

  it("rejects short idempotency keys", () => {
    expect(rewardActionInput.safeParse({ ...base, idempotencyKey: "short" }).success).toBe(false);
  });

  it("detects unbalanced entries", () => {
    expect(isBalanced([base.entries[0]!, { ...base.entries[1]!, amount: 400 }])).toBe(false);
  });
});
