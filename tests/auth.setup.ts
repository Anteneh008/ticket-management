/**
 * Auth setup — runs once before all chromium tests.
 * Logs in as agent and as admin, then saves their storage states
 * to tests/.auth/ so the main test suite can reuse them without
 * hitting the login form on every test.
 */
import { test as setup, expect } from "@playwright/test";

const AGENT_AUTH_FILE = "tests/.auth/agent.json";
const ADMIN_AUTH_FILE = "tests/.auth/admin.json";

async function loginAs(page: any, email: string, password: string) {
  await page.goto("/login");
  // Wait for the email input to be ready — confirms React has hydrated
  await page.getByLabel("Email").waitFor({ state: "visible" });
  await page.getByLabel("Email").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/dashboard", { timeout: 10000 });
  await expect(page.getByText("Welcome back,")).toBeVisible();
}

setup("authenticate as agent", async ({ page }) => {
  await loginAs(page, "agent@ticketapp.com", "Agent@123456");
  await page.context().storageState({ path: AGENT_AUTH_FILE });
});

setup("authenticate as admin", async ({ page }) => {
  await loginAs(page, "admin@ticketapp.com", "Admin@123456");
  await page.context().storageState({ path: ADMIN_AUTH_FILE });
});
