import { defineConfig, devices } from "@playwright/test";

const externalBaseUrl = process.env["PLAYWRIGHT_BASE_URL"];
const port = 4173;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: process.env["CI"] ? 2 : 0,
  reporter: process.env["CI"] ? [["html"], ["github"]] : "list",
  use: {
    baseURL: externalBaseUrl ?? `http://127.0.0.1:${port}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  // When PLAYWRIGHT_BASE_URL points at an already running app, do not boot a server.
  ...(externalBaseUrl
    ? {}
    : {
        webServer: {
          command: `npm run dev -- --host 127.0.0.1 --port ${port} --strictPort`,
          url: `http://127.0.0.1:${port}`,
          timeout: 180_000,
          reuseExistingServer: !process.env["CI"],
        },
      }),
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
});
