import { defineConfig, devices } from "@playwright/test";
const baseURL = process.env.E2E_BASE_URL ?? "http://127.0.0.1:4173";
export default defineConfig({
  testDir: "./e2e-release",
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "npm run build && npm run preview -- --host 127.0.0.1 --port 4173",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 180000,
      },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
