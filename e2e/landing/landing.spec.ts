import { test, expect } from "@playwright/test";
import { installGraphqlMock } from "../fixtures/graphql-mock";

test.describe("landing page", () => {
  test.beforeEach(async ({ page }) => {
    await installGraphqlMock(page);
  });

  test("shows the brand and auth navigation links", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "You Do!" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign Up" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
  });

  test("navigates to signup and login", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "Sign Up" }).click();
    await expect(page).toHaveURL("/signup");
    await expect(page.getByRole("heading", { name: "Create account" })).toBeVisible();

    await page.goto("/");
    await page.getByRole("link", { name: "Login" }).click();
    await expect(page).toHaveURL("/login");
    await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
  });
});
