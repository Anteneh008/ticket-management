import { chromium } from "@playwright/test";

const OUT = "C:/Users/MSI/AppData/Local/Temp/claude";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

page.on("console", msg => { if (msg.type() === "error") console.error("PAGE ERROR:", msg.text()); });
page.on("response", res => {
  if (res.url().includes("/api/auth")) console.log("AUTH API:", res.status(), res.url());
});

// 1. Login page
await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
await page.waitForSelector('button[type="submit"]:not([disabled])');
await page.screenshot({ path: `${OUT}/01-login.png` });
console.log("1. Login page ready");

// 2. Fill and submit as agent
await page.fill('input[type="email"]', "agent@ticketapp.com");
await page.fill('input[type="password"]', "Agent@123456");
await page.click('button[type="submit"]');

// Wait for either navigation OR an error to appear
try {
  await page.waitForURL("**/dashboard", { timeout: 6000 });
  console.log("2. Navigated to dashboard");
} catch {
  const errorText = await page.textContent("body");
  console.log("2. Still at login. URL:", page.url());
  console.log("   Error on page:", errorText.includes("Invalid") ? "Invalid email or password" : "no error text");
}

await page.screenshot({ path: `${OUT}/02-after-submit.png` });
await page.waitForTimeout(1000);

// 3. If we're on dashboard, screenshot it
if (page.url().includes("dashboard")) {
  await page.screenshot({ path: `${OUT}/03-dashboard.png` });
  console.log("3. Dashboard:", page.url());

  // 4. Test admin-only /users as agent
  await page.goto("http://localhost:3000/users");
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${OUT}/04-users-as-agent.png` });
  console.log("4. /users as agent redirected to:", page.url());

  // 5. Log out, log in as admin
  await page.context().clearCookies();
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await page.waitForSelector('button[type="submit"]:not([disabled])');
  await page.fill('input[type="email"]', "admin@ticketapp.com");
  await page.fill('input[type="password"]', "Admin@123456");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard", { timeout: 6000 });
  console.log("5. Admin logged in:", page.url());

  await page.goto("http://localhost:3000/users");
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${OUT}/05-users-as-admin.png` });
  console.log("6. /users as admin:", page.url());
}

await browser.close();
