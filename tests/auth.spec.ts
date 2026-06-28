/**
 * E2E tests for the authentication system.
 *
 * Covers:
 *   - Login happy paths (agent + admin)
 *   - Login error paths (bad credentials, empty fields)
 *   - Password eye-toggle
 *   - Authorization / redirect behaviour (unauthenticated + role-based)
 *   - Sign-out flow
 *   - Self-registration blocked
 */
import { test, expect, request } from "@playwright/test";
import path from "path";

const AGENT_AUTH_FILE = path.join("tests", ".auth", "agent.json");
const ADMIN_AUTH_FILE = path.join("tests", ".auth", "admin.json");

// ---------------------------------------------------------------------------
// Login — valid credentials
//
// We avoid duplicate form-logins here to stay under Better Auth's rate limit
// (10 requests per 60-second window). The setup project already proved that
// both accounts accept valid credentials by logging in and saving a session.
// Test 1 verifies the full form→redirect→welcome flow for one account.
// Test 2 verifies the dashboard renders correctly for the admin role by
// reusing the saved admin session (a different but equally valid assertion).
// ---------------------------------------------------------------------------
test.describe("Login — valid credentials (agent)", () => {
  test.use({ storageState: { cookies: [], origins: [] } }); // start unauthenticated

  test("1. valid agent credentials → redirects to /dashboard and shows welcome message", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByLabel("Email").waitFor({ state: "visible" });
    await page.getByLabel("Email").fill("agent@ticketapp.com");
    await page.locator("#password").fill("Agent@123456");
    await page.getByRole("button", { name: "Sign in" }).click();

    await page.waitForURL("**/dashboard", { timeout: 10000 });
    await expect(page.getByText("Welcome back, Agent.")).toBeVisible();
  });
});

test.describe("Login — valid credentials (admin session)", () => {
  // Reuse saved admin session to avoid triggering the rate limiter again.
  // The setup project already validated that admin credentials work on the form.
  test.use({ storageState: ADMIN_AUTH_FILE });

  test("2. admin session lands on /dashboard and shows correct welcome message", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL("/dashboard");
    await expect(page.getByText("Welcome back, Admin.")).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Login — error paths
// ---------------------------------------------------------------------------
test.describe("Login — error paths", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").waitFor({ state: "visible" });
  });

  test("3. invalid email → shows 'Invalid email or password.' error", async ({
    page,
  }) => {
    await page.getByLabel("Email").fill("nobody@nowhere.com");
    await page.locator("#password").fill("SomePassword1!");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByText("Invalid email or password.")).toBeVisible();
    // Must stay on /login
    expect(page.url()).toContain("/login");
  });

  test("4. invalid password → shows 'Invalid email or password.' error", async ({
    page,
  }) => {
    await page.getByLabel("Email").fill("agent@ticketapp.com");
    await page.locator("#password").fill("WrongPassword99!");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByText("Invalid email or password.")).toBeVisible();
    expect(page.url()).toContain("/login");
  });

  test("5. empty email → shows zod validation error", async ({ page }) => {
    // Leave email blank, fill only password, then submit
    await page.locator("#password").fill("Agent@123456");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(
      page.getByText("Enter a valid email address")
    ).toBeVisible();
    expect(page.url()).toContain("/login");
  });

  test("6. empty password → shows zod validation error", async ({ page }) => {
    await page.getByLabel("Email").fill("agent@ticketapp.com");
    // Leave password blank
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByText("Password is required")).toBeVisible();
    expect(page.url()).toContain("/login");
  });
});

// ---------------------------------------------------------------------------
// Password eye-toggle
// ---------------------------------------------------------------------------
test.describe("Password eye-toggle", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("7. clicking eye button toggles password input type between password and text", async ({
    page,
  }) => {
    await page.goto("/login");

    const passwordInput = page.locator("#password");
    const showBtn = page.getByRole("button", { name: "Show password" });
    const hideBtn = page.getByRole("button", { name: "Hide password" });

    // Initially the field is a password input (masked)
    await expect(passwordInput).toHaveAttribute("type", "password");
    // "Show password" button should be visible, "Hide password" should not
    await expect(showBtn).toBeVisible();
    await expect(hideBtn).not.toBeVisible();

    // Click to reveal
    await showBtn.click();
    await expect(passwordInput).toHaveAttribute("type", "text");
    await expect(hideBtn).toBeVisible();
    await expect(showBtn).not.toBeVisible();

    // Click to hide again
    await hideBtn.click();
    await expect(passwordInput).toHaveAttribute("type", "password");
    await expect(showBtn).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Authorization / redirects — unauthenticated
// ---------------------------------------------------------------------------
test.describe("Authorization — unauthenticated redirects", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("8. unauthenticated visit to /dashboard → redirected to /login with callbackUrl", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await page.waitForURL(/\/login/);

    expect(page.url()).toContain("/login");
    expect(page.url()).toContain("callbackUrl");
  });

  test("9. unauthenticated visit to /users → redirected to /login", async ({
    page,
  }) => {
    await page.goto("/users");
    await page.waitForURL(/\/login/);

    expect(page.url()).toContain("/login");
  });
});

// ---------------------------------------------------------------------------
// Authorization — role-based access
// ---------------------------------------------------------------------------
test.describe("Authorization — role-based access (agent)", () => {
  test.use({ storageState: AGENT_AUTH_FILE });

  test("10. agent visits /users → redirected to /dashboard", async ({
    page,
  }) => {
    await page.goto("/users");
    await page.waitForURL("/dashboard");

    await expect(page.getByText("Welcome back, Agent.")).toBeVisible();
  });
});

test.describe("Authorization — role-based access (admin)", () => {
  test.use({ storageState: ADMIN_AUTH_FILE });

  test("11. admin visits /users → sees 'Users' heading (access granted)", async ({
    page,
  }) => {
    await page.goto("/users");

    // Should NOT be redirected
    await expect(page).toHaveURL("/users");
    await expect(
      page.getByRole("heading", { name: "Users" })
    ).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Sign-out
// ---------------------------------------------------------------------------
test.describe("Sign-out", () => {
  test.use({ storageState: AGENT_AUTH_FILE });

  test("12. signing out → redirected to /login and /dashboard no longer accessible", async ({
    page,
  }) => {
    // Start on dashboard to confirm we are authenticated
    await page.goto("/dashboard");
    await expect(page.getByText("Welcome back, Agent.")).toBeVisible();

    // Click the sign-out button in the header
    await page.getByRole("button", { name: "Sign out" }).click();
    await page.waitForURL("/login");
    expect(page.url()).toContain("/login");

    // Try to navigate back — should be redirected again
    await page.goto("/dashboard");
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain("/login");
  });
});

// ---------------------------------------------------------------------------
// Self-registration blocked
// ---------------------------------------------------------------------------
test.describe("Self-registration blocked", () => {
  test("13. POST to /api/auth/sign-up/email returns an error (signup disabled)", async ({}) => {
    // Use a fresh API request context (no session cookies)
    const apiContext = await request.newContext({
      baseURL: "http://localhost:3000",
    });

    const response = await apiContext.post("/api/auth/sign-up/email", {
      data: {
        name: "Hacker",
        email: "hacker@example.com",
        password: "Hacker@123456",
      },
      headers: { "Content-Type": "application/json" },
    });

    // Better Auth returns 4xx when sign-up is disabled
    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(response.status()).toBeLessThan(600);

    await apiContext.dispose();
  });
});
