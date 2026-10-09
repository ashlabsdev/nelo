import { expect, test } from "@playwright/test";

test("authenticated user can move between main sections", async ({ page }) => {
  await page.goto("/blogs");
  await expect(page).toHaveURL(/\/blogs/);
  await page.goto("/photos");
  await expect(page).toHaveURL(/\/photos/);
  await page.goto("/audio");
  await expect(page).toHaveURL(/\/audio/);
  await page.goto("/chat");
  await expect(page).toHaveURL(/\/chat/);
  await page.goto("/notifications");
  await expect(page).toHaveURL(/\/notifications/);
  await page.goto("/profile");
  await expect(page).toHaveURL(/\/profile/);
});

test("authenticated user cannot be sent back to login from protected pages", async ({
  page,
}) => {
  const protectedRoutes = [
    "/blogs",
    "/photos",
    "/audio",
    "/profile",
    "/chat",
    "/notifications",
  ];

  for (const route of protectedRoutes) {
    await page.goto(route);

    await expect(page).not.toHaveURL(/\/auth\/login/);
  }
});

test("profile subpages are accessible", async ({ page }) => {
  const routes = [
    "/profile",
    "/profile/edit",
    "/profile/appearance",
    "/profile/content",
    "/profile/blocked",
    "/profile/settings",
  ];

  for (const route of routes) {
    await page.goto(route);

    await expect(page).toHaveURL(new RegExp(route.replace(/\//g, "\\/")));
  }
});
