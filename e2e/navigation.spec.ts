import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("home page loads with branding", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=PredictorAtlas").first()).toBeVisible();
  });

  test("navigate to Predictions page", async ({ page }) => {
    await page.goto("/");
    await page.click('a[href="/predictions"]');
    await expect(page).toHaveURL("/predictions");
  });

  test("navigate to About page", async ({ page }) => {
    await page.goto("/");
    await page.click('a[href="/about"]');
    await expect(page).toHaveURL("/about");
  });

  test("Sign In button is visible when not authenticated", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Sign In").first()).toBeVisible();
  });
});
