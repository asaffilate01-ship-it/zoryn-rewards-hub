import { describe, expect, it } from "vitest";
import { z } from "zod";

const schema = z.object({
  action: z.enum(["earn", "redeem", "reverse", "gift_card_issue", "stamp_award"]),
  tenantId: z.string().uuid(),
  memberId: z.string().uuid(),
  amount: z.number().positive(),
  idempotencyKey: z.string().min(12),
});

describe("reward action validation", () => {
  it("accepts a valid earn action", () => {
    expect(schema.safeParse({
      action: "earn",
      tenantId: "00000000-0000-0000-0000-000000000101",
      memberId: "00000000-0000-0000-0000-000000000201",
      amount: 250,
      idempotencyKey: "purchase-123456",
    }).success).toBe(true);
  });

  it("rejects zero or negative rewards", () => {
    expect(schema.safeParse({
      action: "earn",
      tenantId: "00000000-0000-0000-0000-000000000101",
      memberId: "00000000-0000-0000-0000-000000000201",
      amount: 0,
      idempotencyKey: "purchase-123456",
    }).success).toBe(false);
  });
});
