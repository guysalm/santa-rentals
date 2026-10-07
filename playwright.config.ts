import { defineConfig, devices } from "@playwright/test";

// Requires: local Supabase (`npm run db:start`) and PAYMENTS_PROVIDER=mock in .env.local.
// Reuses a running `npm run dev` on :3100 or starts one.
export default defineConfig({
  testDir: "tests/e2e",
  globalSetup: "./tests/e2e/global-setup.ts",
  timeout: 180_000,
  expect: { timeout: 30_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:3100/robots.txt",
    reuseExistingServer: true,
    timeout: 300_000,
  },
});
