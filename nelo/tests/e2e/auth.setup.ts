import { expect, test as setup } from "@playwright/test";

import fs from "fs";
import path from "path";

const authFile = path.join(process.cwd(), "playwright", ".auth", "user.json");

setup("authenticate normal user", async ({ page }) => {
  const email = process.env.E2E_USER_EMAIL;

  const password = process.env.E2E_USER_PASSWORD;

  if (!email) {
    throw new Error("E2E_USER_EMAIL is missing from .env.test.local");
  }

  if (!password) {
    throw new Error("E2E_USER_PASSWORD is missing from .env.test.local");
  }

  /*
   * Important:
   * Make sure the directory exists
   * before Playwright writes user.json.
   */
  fs.mkdirSync(path.dirname(authFile), {
    recursive: true,
  });

  await page.goto("/auth/login");

  const emailInput = page.locator('input[type="email"]');

  const passwordInput = page.locator('input[type="password"]');

  await expect(emailInput).toBeVisible();

  await emailInput.fill(email);

  await passwordInput.fill(password);

  await passwordInput.press("Enter");

  await page.waitForURL((url) => !url.pathname.startsWith("/auth/"), {
    timeout: 20000,
  });

  await expect(page).not.toHaveURL(/\/auth\/login/);

  await page.context().storageState({
    path: authFile,
  });

  /*
   * Extra verification so the setup
   * itself fails if user.json was
   * somehow not created.
   */
  if (!fs.existsSync(authFile)) {
    throw new Error(`Authentication state was not created at ${authFile}`);
  }
});
