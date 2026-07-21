import { defineConfig, devices } from "@playwright/test";

const useProductionServer =
  !!process.env.CI || process.env.PLAYWRIGHT_E2E_PROD === "1";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: useProductionServer ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:3883",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: useProductionServer ? "npm run start" : "npm run dev",
    url: "http://localhost:3883",
    // Never reuse an external dev server: a reused process can exit mid-run and
    // leave later tests failing with ERR_CONNECTION_REFUSED.
    reuseExistingServer: false,
    timeout: useProductionServer ? 180_000 : 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
