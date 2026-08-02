import { describe, expect, it } from "vitest";

/** Mirrors zr_enforce_funding_thresholds: pause when available funding drops below the threshold. */
function shouldPause(balanceCents: number, reservedCents: number, thresholdCents: number) {
  return balanceCents - reservedCents < thresholdCents;
}

describe("funding threshold enforcement", () => {
  it("pauses campaigns below the threshold", () => {
    expect(shouldPause(5_000, 0, 10_000)).toBe(true);
  });

  it("keeps campaigns active above the threshold", () => {
    expect(shouldPause(15_000, 0, 10_000)).toBe(false);
  });

  it("counts reserved funds against availability", () => {
    expect(shouldPause(15_000, 9_000, 10_000)).toBe(true);
  });

  it("treats an exact match as sufficient", () => {
    expect(shouldPause(10_000, 0, 10_000)).toBe(false);
  });

  it("never pauses when no threshold is configured", () => {
    expect(shouldPause(0, 0, 0)).toBe(false);
  });
});
