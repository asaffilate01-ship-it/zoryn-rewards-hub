import { test, expect } from "@playwright/test";

test("public application renders", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("unknown route does not expose server error details", async ({ page }) => {
  await page.goto("/route-that-does-not-exist");
  await expect(page.locator("body")).toBeVisible();
  await expect(page.locator("body")).not.toContainText(/stack trace|service_role|postgres/i);
});

test("health endpoint responds with a status", async ({ request }) => {
  const response = await request.get("/api/public/rewards/health");
  expect([200, 503]).toContain(response.status());
  const body = (await response.json()) as { status?: string };
  expect(["healthy", "degraded"]).toContain(body.status);
});

test("scheduled jobs endpoint rejects unauthenticated calls", async ({ request }) => {
  const response = await request.post("/api/public/rewards/scheduled-jobs", {
    data: { job: "funding-thresholds" },
  });
  expect([401, 503]).toContain(response.status());
});
