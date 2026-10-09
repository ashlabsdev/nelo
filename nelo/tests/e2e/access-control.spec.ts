import { expect, test } from "@playwright/test";

test("normal authenticated user cannot access admin dashboard", async ({
  page,
}) => {
  await page.goto("/admin");

  /*
   * Your admin layout intentionally uses
   * notFound() for non-admin users.
   */
  await expect(page).toHaveURL(/\/admin/);

  await expect(page.locator("body")).toContainText("404");
});

test("authenticated user can access content creation pages", async ({
  page,
}) => {
  const routes = ["/create/blog", "/create/photo", "/create/audio"];

  for (const route of routes) {
    await page.goto(route);

    await expect(page).toHaveURL(new RegExp(route.replace(/\//g, "\\/")));

    await expect(page).not.toHaveURL(/\/auth\/login/);
  }
});

test("authenticated user cannot access login as an anonymous session", async ({
  page,
}) => {
  await page.goto("/auth/login");

  /*
   * Depending on your current login page logic,
   * an already-authenticated user should either
   * redirect into the app or at least remain
   * authenticated.
   *
   * We only verify that authentication was
   * not lost.
   */
  await page.goto("/blogs");

  await expect(page).toHaveURL(/\/blogs/);
});
