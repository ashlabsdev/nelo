import { defineConfig, devices } from "@playwright/test";

import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(process.cwd(), ".env.test.local"),
});

export default defineConfig({
  testDir: "./tests/e2e",

  fullyParallel: true,

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,

  workers: process.env.CI ? 1 : undefined,

  reporter: [
    [
      "html",
      {
        outputFolder: "playwright-report",
      },
    ],
  ],

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",

    trace: "on-first-retry",

    screenshot: "only-on-failure",

    video: "retain-on-failure",
  },

  projects: [
    /*
     * STEP 1
     *
     * Logs into NELO once and writes:
     *
     * playwright/.auth/user.json
     */
    {
      name: "setup",

      testMatch: /auth\.setup\.ts/,
    },

    /*
     * PUBLIC / LOGGED-OUT TESTS
     *
     * These must NOT use stored auth.
     */
    {
      name: "public-chromium",

      testMatch: [/auth\.spec\.ts/, /performance-smoke\.spec\.ts/],

      use: {
        ...devices["Desktop Chrome"],
      },
    },

    /*
     * AUTHENTICATED TESTS
     *
     * Setup project runs first.
     * Then these tests reuse the
     * stored Supabase session.
     */
    {
      name: "authenticated-chromium",

      testMatch: [
        /authenticated\.spec\.ts/,
        /authenticated-performance\.spec\.ts/,
        /navigation\.spec\.ts/,
        /blog-crud\.spec\.ts/,
        /access-control\.spec\.ts/,
        /post-interactions\.spec\.ts/,
      ],

      dependencies: ["setup"],

      use: {
        ...devices["Desktop Chrome"],

        storageState: "playwright/.auth/user.json",
      },
    },
  ],

  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "npm run dev",

        url: "http://localhost:3000",

        reuseExistingServer: !process.env.CI,

        timeout: 120000,
      },
});
