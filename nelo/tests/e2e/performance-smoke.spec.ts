import { expect, test } from "@playwright/test";

test("login page performance baseline", async ({ page }) => {
  const start = Date.now();

  const response = await page.goto("/auth/login", {
    waitUntil: "domcontentloaded",
  });

  const totalDuration = Date.now() - start;

  expect(response?.ok()).toBe(true);

  const timing = await page.evaluate(() => {
    const navigation = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming;

    return {
      dns: navigation.domainLookupEnd - navigation.domainLookupStart,

      connect: navigation.connectEnd - navigation.connectStart,

      ttfb: navigation.responseStart - navigation.requestStart,

      response: navigation.responseEnd - navigation.responseStart,

      domInteractive: navigation.domInteractive,

      domContentLoaded: navigation.domContentLoadedEventEnd,

      loadComplete: navigation.loadEventEnd,
    };
  });

  console.log("\n--- NELO Login Performance ---");

  console.log(`Total navigation: ${totalDuration}ms`);

  console.log(`DNS: ${timing.dns.toFixed(0)}ms`);

  console.log(`Connection: ${timing.connect.toFixed(0)}ms`);

  console.log(`TTFB: ${timing.ttfb.toFixed(0)}ms`);

  console.log(`Response download: ${timing.response.toFixed(0)}ms`);

  console.log(`DOM interactive: ${timing.domInteractive.toFixed(0)}ms`);

  console.log(`DOMContentLoaded: ${timing.domContentLoaded.toFixed(0)}ms`);

  console.log(`Load complete: ${timing.loadComplete.toFixed(0)}ms`);

  console.log("------------------------------\n");

  /*
   * Loose baseline for now.
   * Day 26 will establish stricter
   * production performance thresholds.
   */
  expect(totalDuration).toBeLessThan(5000);
});
