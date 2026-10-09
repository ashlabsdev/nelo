import { expect, test } from "@playwright/test";

test("user can create, edit and delete a blog", async ({ page }) => {
  const timestamp = Date.now();

  const originalTitle = `E2E Blog ${timestamp}`;

  const updatedTitle = `${originalTitle} Updated`;

  const originalContent =
    "This blog was created by the NELO automated test suite.";

  const updatedContent =
    "This blog was updated by the NELO automated test suite.";

  /*
   * CREATE
   */
  await page.goto("/create/blog");

  await expect(page).toHaveURL(/\/create\/blog/);

  await page.getByLabel("Title").fill(originalTitle);

  /*
   * TipTap editor.
   *
   * We use the ProseMirror class because
   * BlogEditor currently has no explicit
   * aria-label.
   */
  const editor = page.locator(".ProseMirror");

  await expect(editor).toBeVisible();

  await editor.click();

  await editor.fill(originalContent);

  await page.getByLabel("Hashtags").fill("#e2etest #nelo");

  await page
    .getByRole("button", {
      name: "Publish Blog",
    })
    .click();

  /*
   * BlogForm redirects to:
   *
   * /blogs/{postId}
   */
  await page.waitForURL(/\/blogs\/[0-9a-f-]+$/, {
    timeout: 15000,
  });

  const blogUrl = page.url();

  await expect(
    page.getByRole("heading", {
      name: originalTitle,
    }),
  ).toBeVisible();

  await expect(
    page.getByText(originalContent, {
      exact: false,
    }),
  ).toBeVisible();

  /*
   * EDIT
   */
  await page
    .getByRole("button", {
      name: "Manage post",
    })
    .click();

  await page
    .getByRole("link", {
      name: "Edit",
    })
    .click();

  await expect(page).toHaveURL(/\/blogs\/[0-9a-f-]+\/edit$/);

  const titleInput = page.getByLabel("Title");

  await titleInput.fill(updatedTitle);

  const editEditor = page.locator(".ProseMirror");

  await expect(editEditor).toBeVisible();

  await editEditor.click();

  await editEditor.fill(updatedContent);

  await page
    .getByRole("button", {
      name: "Save Changes",
    })
    .click();

  /*
   * Edit returns to blog detail page.
   */
  await page.waitForURL(blogUrl, {
    timeout: 15000,
  });

  await expect(
    page.getByRole("heading", {
      name: updatedTitle,
    }),
  ).toBeVisible();

  await expect(
    page.getByText(updatedContent, {
      exact: false,
    }),
  ).toBeVisible();

  /*
   * DELETE
   */
  await page
    .getByRole("button", {
      name: "Manage post",
    })
    .click();

  await page
    .getByRole("button", {
      name: "Delete",
    })
    .click();

  await expect(page.getByText("Delete this post?")).toBeVisible();

  await page
    .getByRole("button", {
      name: "Delete Post",
    })
    .click();

  await page.waitForURL(/\/blogs$/, {
    timeout: 15000,
  });

  await expect(page).toHaveURL(/\/blogs$/);

  /*
   * The deleted post should no longer
   * exist in the feed.
   */
  await expect(
    page.getByRole("heading", {
      name: updatedTitle,
    }),
  ).toHaveCount(0);
});
