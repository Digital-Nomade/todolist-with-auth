import { test, expect } from "@playwright/test";
import { installGraphqlMock, seedAuthenticatedSession } from "../fixtures/graphql-mock";
import { loginAsActiveUser } from "../helpers/auth";

test.describe("route guards", () => {
  test.beforeEach(async ({ page }) => {
    await installGraphqlMock(page);
  });

  test("redirects guests away from private routes", async ({ page }) => {
    await page.goto("/home");
    await expect(page).toHaveURL("/login");

    await page.goto("/dashboard");
    await expect(page).toHaveURL("/login");

    await page.goto("/profile");
    await expect(page).toHaveURL("/login");
  });

  test("redirects active users away from auth routes", async ({ page }) => {
    await loginAsActiveUser(page);

    await page.goto("/login");
    await expect(page).toHaveURL("/home");

    await page.goto("/signup");
    await expect(page).toHaveURL("/home");
  });

  test("restores an active session from a stored refresh token", async ({ page }) => {
    await installGraphqlMock(page);
    await seedAuthenticatedSession(page);
    await page.goto("/home");

    await expect(page.getByText(/Welcome person/)).toBeVisible();
    await expect(page.getByText("Review priorities with the team.")).toBeVisible();
  });

  test("sends guests to login when refresh restoration fails", async ({ page }) => {
    await installGraphqlMock(page, { refreshScenario: "invalid" });
    await seedAuthenticatedSession(page);

    await page.goto("/home");
    await expect(page).toHaveURL("/login");
  });
});

test.describe("logout", () => {
  test.beforeEach(async ({ page }) => {
    await installGraphqlMock(page);
  });

  test("logs out from the header", async ({ page }) => {
    await loginAsActiveUser(page);

    await page.getByRole("button", { name: /logout/i }).click();
    await expect(page).toHaveURL("/login");
  });
});
