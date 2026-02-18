import { expect, test } from "@playwright/test";

test.describe("smoke tests", () => {
  test("homepage loads successfully", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Relay");
  });

  test("no console errors on homepage", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    expect(errors).toHaveLength(0);
  });
});

test.describe("auth pages", () => {
  test("login page renders with form fields", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h1")).toContainText("Sign in to Relay");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("register page renders with form fields", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator("h1")).toContainText("Create your account");
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: /create account/i })).toBeVisible();
  });

  test("login page links to register", async ({ page }) => {
    await page.goto("/login");
    const createLink = page.getByRole("link", { name: /create one/i });
    await expect(createLink).toBeVisible();
    await createLink.click();
    await expect(page).toHaveURL(/\/register/);
  });

  test("register page links to login", async ({ page }) => {
    await page.goto("/register");
    const signInLink = page.getByRole("link", { name: /sign in/i });
    await expect(signInLink).toBeVisible();
    await signInLink.click();
    await expect(page).toHaveURL(/\/login/);
  });
});
