import { expect, test } from "@playwright/test";

test("user can like, favorite and comment on a blog", async ({ page }) => {
  const timestamp = Date.now();

  const title = `E2E Interaction ${timestamp}`;

  const content = "Temporary blog for NELO interaction testing.";

  const comment = `E2E comment ${timestamp}`;

  let blogUrl: string | null = null;

  try {
    /*
     * CREATE TEMPORARY BLOG
     */
    await page.goto("/create/blog");

    await page.getByLabel("Title").fill(title);

    const editor = page.locator(".ProseMirror");

    await expect(editor).toBeVisible();

    await editor.fill(content);

    await page.getByLabel("Hashtags").fill("#e2etest #interaction");

    await page
      .getByRole("button", {
        name: "Publish Blog",
      })
      .click();

    await page.waitForURL(/\/blogs\/[0-9a-f-]+$/, {
      timeout: 15000,
    });

    blogUrl = page.url();

    await expect(
      page.getByRole("heading", {
        name: title,
      }),
    ).toBeVisible();

    /*
     * LIKE
     */

    const likeButton = page.getByTitle("Like");

    await expect(likeButton).toBeVisible();

    const initialLikeText = await likeButton.locator("span").textContent();

    const initialLikeCount = Number(initialLikeText ?? "0");

    await likeButton.click();

    const unlikeButton = page.getByTitle("Unlike");

    await expect(unlikeButton).toBeVisible();

    await expect(unlikeButton.locator("span")).toHaveText(
      String(initialLikeCount + 1),
    );

    /*
     * FAVORITE
     */

    const favoriteButton = page.getByTitle("Add to favorites");

    await expect(favoriteButton).toBeVisible();

    await favoriteButton.click();

    await expect(page.getByTitle("Remove from favorites")).toBeVisible();

    /*
     * COMMENTS
     */

    await page.getByTitle("Comments").click();

    const commentInput = page.getByPlaceholder("Write a comment...");

    await expect(commentInput).toBeVisible();

    await commentInput.fill(comment);

    await page.getByTitle("Post comment").click();

    await expect(
      page.getByText(comment, {
        exact: true,
      }),
    ).toBeVisible();

    /*
     * TEST COMMENT DELETE
     */

    await page.getByTitle("Delete comment").click();

    await expect(
      page.getByText(comment, {
        exact: true,
      }),
    ).toHaveCount(0);

    /*
     * Toggle like back off.
     */

    await page.getByTitle("Unlike").click();

    await expect(page.getByTitle("Like")).toBeVisible();

    /*
     * Toggle favorite back off.
     */

    await page.getByTitle("Remove from favorites").click();

    await expect(page.getByTitle("Add to favorites")).toBeVisible();
  } finally {
    /*
     * CLEANUP
     *
     * Even if one interaction assertion
     * fails, try to remove the temporary
     * blog so automated tests do not fill
     * NELO with test content.
     */
    if (blogUrl) {
      await page.goto(blogUrl);

      const manageButton = page.getByRole("button", {
        name: "Manage post",
      });

      if (await manageButton.isVisible().catch(() => false)) {
        await manageButton.click();

        const deleteButton = page.getByRole("button", {
          name: "Delete",
        });

        if (await deleteButton.isVisible().catch(() => false)) {
          await deleteButton.click();

          const confirmButton = page.getByRole("button", {
            name: "Delete Post",
          });

          if (await confirmButton.isVisible().catch(() => false)) {
            await confirmButton.click();

            await page
              .waitForURL(/\/blogs$/, {
                timeout: 15000,
              })
              .catch(() => {});
          }
        }
      }
    }
  }
});
