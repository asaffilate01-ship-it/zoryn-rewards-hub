import { describe, expect, it } from "vitest";

type Entry = { direction: "debit" | "credit"; amount: number };

/** Mirrors zr_reverse_reward_transaction: every entry is posted with the opposite direction. */
function reverse(entries: Entry[]): Entry[] {
  return entries.map((e) => ({
    ...e,
    direction: e.direction === "debit" ? "credit" : "debit",
  }));
}

function isBalanced(entries: Entry[]) {
  const credit = entries.filter((e) => e.direction === "credit").reduce((a, e) => a + e.amount, 0);
  const debit = entries.filter((e) => e.direction === "debit").reduce((a, e) => a + e.amount, 0);
  return credit === debit;
}

describe("ledger reversal", () => {
  const original: Entry[] = [
    { direction: "debit", amount: 500 },
    { direction: "credit", amount: 500 },
  ];

  it("inverts every entry direction", () => {
    expect(reverse(original)).toEqual([
      { direction: "credit", amount: 500 },
      { direction: "debit", amount: 500 },
    ]);
  });

  it("keeps the reversal balanced", () => {
    expect(isBalanced(reverse(original))).toBe(true);
  });

  it("nets to zero when combined with the original", () => {
    expect(isBalanced([...original, ...reverse(original)])).toBe(true);
  });

  it("is an involution", () => {
    expect(reverse(reverse(original))).toEqual(original);
  });
});
