import { expect, test } from "@playwright/test";

test("root redirects logged-out visitor to login", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/auth\/login/);
});

test("login page displays NELO login form", async ({ page }) => {
  await page.goto("/auth/login");

  await expect(page).toHaveURL(/\/auth\/login/);

  await expect(page.locator("body")).toContainText("NELO");
});
