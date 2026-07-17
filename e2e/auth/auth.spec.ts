import { test, expect } from "@playwright/test";
import { installGraphqlMock } from "../fixtures/graphql-mock";
import { credentials } from "../fixtures/test-data";
import { loginAsActiveUser } from "../helpers/auth";
import { appAlert } from "../helpers/alerts";

test.describe("login", () => {
  test("signs in an active user and redirects to home", async ({ page }) => {
    await installGraphqlMock(page);
    await loginAsActiveUser(page);
    await expect(page.getByText("Review priorities with the team.")).toBeVisible();
  });

  test("shows a safe error for invalid credentials", async ({ page }) => {
    await installGraphqlMock(page, { loginScenario: "invalid" });

    await page.goto("/login");
    await page.getByLabel("email or username").fill(credentials.active.identifier);
    await page.getByLabel("password").fill(credentials.invalid.password);
    await page.getByRole("button", { name: /login/i }).click();

    await expect(appAlert(page)).toHaveText(
      "Invalid credentials. Please try again.",
    );
    await expect(page).toHaveURL("/login");
  });

  test("redirects pending verification users to check-email", async ({ page }) => {
    await installGraphqlMock(page);
    await page.goto("/login");
    await page.getByLabel("email or username").fill(credentials.pending.identifier);
    await page.getByLabel("password").fill(credentials.pending.password);
    await page.getByRole("button", { name: /login/i }).click();

    await expect(page).toHaveURL("/check-email");
    await expect(page.getByRole("heading", { name: "Confirm your email" })).toBeVisible();
  });

  test("redirects forbidden email logins to check-email", async ({ page }) => {
    await installGraphqlMock(page, { loginScenario: "forbidden-unverified" });
    await page.goto("/login");
    await page.getByLabel("email or username").fill("pending@example.com");
    await page.getByLabel("password").fill(credentials.pending.password);
    await page.getByRole("button", { name: /login/i }).click();

    await expect(page).toHaveURL("/check-email");
    await expect(page.getByRole("heading", { name: "Confirm your email" })).toBeVisible();
    await expect(page.getByText(/p\*\*\*@example\.com/)).toBeVisible();
    await expect(page.getByRole("status")).toHaveText("Confirm your email to sign in.");
  });

  test("shows a forbidden message for unverified username logins", async ({ page }) => {
    await installGraphqlMock(page, { loginScenario: "forbidden-unverified" });
    await page.goto("/login");
    await page.getByLabel("email or username").fill(credentials.pending.identifier);
    await page.getByLabel("password").fill(credentials.pending.password);
    await page.getByRole("button", { name: /login/i }).click();

    await expect(page).toHaveURL("/login");
    await expect(appAlert(page)).toHaveText(
      "This account is not available. Verify your email or contact support.",
    );
  });

  test("shows a suspended account message", async ({ page }) => {
    await installGraphqlMock(page);
    await page.goto("/login");
    await page.getByLabel("email or username").fill(credentials.suspended.identifier);
    await page.getByLabel("password").fill(credentials.suspended.password);
    await page.getByRole("button", { name: /login/i }).click();

    await expect(appAlert(page)).toHaveText(
      "This account is suspended. Contact support for help.",
    );
    await expect(page).toHaveURL("/login");
  });

  test("links to forgot password and signup", async ({ page }) => {
    await installGraphqlMock(page);
    await page.goto("/login");

    await page.getByRole("link", { name: "Forgot password?" }).click();
    await expect(page).toHaveURL("/forgot-password");

    await page.goto("/login");
    await page.getByRole("link", { name: "Create account" }).click();
    await expect(page).toHaveURL("/signup");
  });
});

test.describe("signup", () => {
  test.beforeEach(async ({ page }) => {
    await installGraphqlMock(page);
  });

  test("creates an account and redirects to check-email", async ({ page }) => {
    await page.goto("/signup");

    await page.getByLabel("email").fill("new.user@example.com");
    await page.getByLabel("username").fill("newuser");
    await page.getByLabel("password", { exact: true }).fill("password123");
    await page.getByLabel("confirm password").fill("password123");
    await page.getByLabel("name", { exact: true }).fill("New");
    await page.getByLabel("last name").fill("User");
    await page.getByLabel("birthdate").fill("1990-05-15");
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page).toHaveURL("/check-email");
    await expect(page.getByRole("status")).toHaveText("Check your inbox");
    await expect(page.getByText(/n\*\*\*@example\.com/)).toBeVisible();
  });

  test("shows a registration error when the email is already taken", async ({ page }) => {
    await installGraphqlMock(page, { registerScenario: "conflict" });

    await page.goto("/signup");
    await page.getByLabel("email").fill("person@example.com");
    await page.getByLabel("username").fill("person");
    await page.getByLabel("password", { exact: true }).fill("password123");
    await page.getByLabel("confirm password").fill("password123");
    await page.getByLabel("name", { exact: true }).fill("Pat");
    await page.getByLabel("last name").fill("Example");
    await page.getByLabel("birthdate").fill("1990-01-01");
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(appAlert(page)).toBeVisible();
    await expect(page).toHaveURL("/signup");
  });
});
