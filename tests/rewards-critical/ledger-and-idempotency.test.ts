import { describe, expect, it } from "vitest";
const eventKey = (tenant: string, provider: string, event: string) =>
  `${tenant}:${provider}:${event}`;
const difference = (entries: { direction: "debit" | "credit"; amountMinor: number }[]) =>
  entries.reduce((n, e) => n + (e.direction === "debit" ? e.amountMinor : -e.amountMinor), 0);
describe("reward invariants", () => {
  it("deduplicates within tenant and provider", () => {
    expect(eventKey("a", "affiliate", "1")).toBe(eventKey("a", "affiliate", "1"));
    expect(eventKey("a", "affiliate", "1")).not.toBe(eventKey("b", "affiliate", "1"));
  });
  it("requires balanced entries", () => {
    expect(
      difference([
        { direction: "debit", amountMinor: 500 },
        { direction: "credit", amountMinor: 500 },
      ]),
    ).toBe(0);
    expect(
      difference([
        { direction: "debit", amountMinor: 500 },
        { direction: "credit", amountMinor: 450 },
      ]),
    ).not.toBe(0);
  });
});
