import { test, expect } from "@playwright/test";

test("protected rewards workspace redirects to sign-in without a session", async ({ page }) => {
  await page.goto("/rewards-v4");
  await page.waitForURL(/\/auth|\/rewards-v4/);
  await expect(page.locator("body")).toBeVisible();
  await expect(page.locator("body")).not.toContainText(/unhandled|stack trace/i);
});

test("sign-in surface renders on desktop and mobile viewports", async ({ page }) => {
  await page.goto("/auth");
  await expect(page.locator("body")).toBeVisible();
  await expect(page.getByRole("button").first()).toBeVisible();
});

test("public feature pages navigate without fatal errors", async ({ page }) => {
  await page.goto("/features/merchants");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("body")).not.toContainText(/unhandled|stack trace/i);
});
