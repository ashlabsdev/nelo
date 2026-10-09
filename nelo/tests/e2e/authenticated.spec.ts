import { expect, test } from "@playwright/test";

test("authenticated user can open blogs feed", async ({ page }) => {
  await page.goto("/blogs");

  await expect(page).toHaveURL(/\/blogs/);

  await expect(page.locator("body")).not.toContainText(
    "Sign in to your account",
  );
});

test("authenticated user can open profile", async ({ page }) => {
  await page.goto("/profile");

  await expect(page).toHaveURL(/\/profile/);

  await expect(page.locator("body")).toContainText("Overview");
});

test("authenticated user can open notifications", async ({ page }) => {
  await page.goto("/notifications");

  await expect(page).toHaveURL(/\/notifications/);

  await expect(page.locator("body")).toContainText("Notifications");
});

test("authenticated user can open chat", async ({ page }) => {
  await page.goto("/chat");

  await expect(page).toHaveURL(/\/chat/);
});
