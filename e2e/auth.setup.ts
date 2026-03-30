import { test as setup } from "@playwright/test";

const TEST_EMAIL = process.env.TEST_USER_EMAIL || "";
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || "";
const STORAGE_STATE_PATH = "e2e/.auth/user.json";

setup("authenticate", async ({ page }) => {
  if (!TEST_EMAIL || !TEST_PASSWORD) {
    console.warn(
      "No TEST_USER_EMAIL/TEST_USER_PASSWORD set. Skipping auth setup. " +
      "Tests that require authentication will need to handle login manually."
    );
    return;
  }

  await page.goto("/");

  await page.waitForSelector('[data-amplify-authenticator]', { timeout: 10000 }).catch(() => {
    console.log("Authenticator not found - may already be authenticated");
  });

  const emailInput = page.locator('input[name="username"]');
  const passwordInput = page.locator('input[name="password"]');

  if (await emailInput.isVisible()) {
    await emailInput.fill(TEST_EMAIL);
    await passwordInput.fill(TEST_PASSWORD);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL("/", { timeout: 15000 });
  }

  await page.context().storageState({ path: STORAGE_STATE_PATH });
});
