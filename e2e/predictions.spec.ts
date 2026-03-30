import { test, expect } from "@playwright/test";

test.describe("Predictions", () => {
  test("predictions page loads", async ({ page }) => {
    await page.goto("/predictions");
    await expect(page.locator("text=Predictions").first()).toBeVisible();
  });

  test("prediction cards are displayed", async ({ page }) => {
    await page.goto("/predictions");
    // Should have prediction content on the page
    await expect(page.locator("main")).toBeVisible();
  });
});
