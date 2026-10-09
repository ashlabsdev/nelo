import { expect, test } from "@playwright/test";

const pages = [
  {
    name: "Blogs",
    path: "/blogs",
  },
  {
    name: "Photos",
    path: "/photos",
  },
  {
    name: "Audio",
    path: "/audio",
  },
  {
    name: "Profile",
    path: "/profile",
  },
  {
    name: "Chat",
    path: "/chat",
  },
  {
    name: "Notifications",
    path: "/notifications",
  },
];

for (const target of pages) {
  test(`${target.name} performance`, async ({ page }) => {
    const start = Date.now();

    const response = await page.goto(target.path, {
      waitUntil: "domcontentloaded",
    });

    const total = Date.now() - start;

    expect(response?.ok()).toBe(true);

    const timing = await page.evaluate(() => {
      const nav = performance.getEntriesByType(
        "navigation",
      )[0] as PerformanceNavigationTiming;

      return {
        ttfb: nav.responseStart - nav.requestStart,

        response: nav.responseEnd - nav.responseStart,

        dom: nav.domContentLoadedEventEnd,
      };
    });

    console.log(
      `${target.name}: total=${total}ms, TTFB=${timing.ttfb.toFixed(
        0,
      )}ms, response=${timing.response.toFixed(0)}ms, DOM=${timing.dom.toFixed(
        0,
      )}ms`,
    );

    /*
     * Loose baseline only.
     */
    expect(total).toBeLessThan(8000);
  });
}
