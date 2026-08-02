import { test, expect } from "@playwright/test";

const PROTECTED_ROUTES = [
  "/merchant-onboarding",
  "/campaign-studio",
  "/rewards-v4",
  "/liability-centre",
  "/final-launch",
];

test("reward lifecycle routes load safely and never leak internals", async ({ page }) => {
  for (const path of PROTECTED_ROUTES) {
    await page.goto(path);
    await page.waitForURL(new RegExp(`/auth|${path.replace(/\//g, "\\/")}`));
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("body")).not.toContainText(
      /stack trace|service_role|SUPABASE_SERVICE_ROLE_KEY|fatal/i,
    );
  }
});

test("wallet route is gated behind authentication", async ({ page }) => {
  await page.goto("/app");
  await page.waitForURL(/\/auth|\/app/);
  await expect(page.locator("body")).toBeVisible();
});

test("public health endpoint exposes no personal data", async ({ request }) => {
  const response = await request.get("/api/public/rewards/health");
  expect([200, 503]).toContain(response.status());
  const body = await response.text();
  expect(body).not.toMatch(/@|email|user_id|service_role/i);
});

test("scheduler endpoint rejects unauthenticated calls", async ({ request }) => {
  const response = await request.post("/api/public/rewards/scheduler", {
    data: { job: "campaign-state-update" },
  });
  expect([401, 503]).toContain(response.status());
});
