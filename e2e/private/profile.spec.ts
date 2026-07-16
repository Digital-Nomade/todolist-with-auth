import { test, expect } from "@playwright/test";
import { installGraphqlMock } from "../fixtures/graphql-mock";
import { credentials } from "../fixtures/test-data";
import { loginAsActiveUser } from "../helpers/auth";
import { appAlert } from "../helpers/alerts";

test.describe("profile", () => {
  test.beforeEach(async ({ page }) => {
    await installGraphqlMock(page);
    await loginAsActiveUser(page);
    await page.goto("/profile");
    await expect(page.getByRole("heading", { name: "Profile" })).toBeVisible();
  });

  test("updates editable profile fields", async ({ page }) => {
    await page.getByLabel("name", { exact: true }).fill("Updated Pat");
    await page.getByLabel("last name").fill("Updated Example");
    await page.getByRole("button", { name: /save profile/i }).click();

    await expect(page.getByRole("status")).toHaveText("Profile updated.");
  });

  test("navigates to change password", async ({ page }) => {
    await page.getByRole("link", { name: "Change password" }).click();
    await expect(page).toHaveURL("/change-password");
    await expect(page.getByRole("heading", { name: "Change password" })).toBeVisible();
  });

  test("signs out from all devices", async ({ page }) => {
    await page.getByRole("button", { name: /sign out all devices/i }).click();
    await expect(page).toHaveURL("/login");
  });
});

test.describe("change password", () => {
  test("changes the password and returns to login", async ({ page }) => {
    await installGraphqlMock(page);
    await loginAsActiveUser(page);
    await page.goto("/change-password");

    await page.getByLabel("current password").fill(credentials.active.password);
    await page.getByLabel("new password", { exact: true }).fill("new-password");
    await page.getByLabel("confirm new password").fill("new-password");
    await page.getByRole("button", { name: /change password/i }).click();

    await expect(page).toHaveURL("/login");
  });

  test("shows an error for an invalid current password", async ({ page }) => {
    await installGraphqlMock(page, { changePasswordScenario: "invalid" });
    await loginAsActiveUser(page);
    await page.goto("/change-password");

    await page.getByLabel("current password").fill("wrong-password");
    await page.getByLabel("new password", { exact: true }).fill("new-password");
    await page.getByLabel("confirm new password").fill("new-password");
    await page.getByRole("button", { name: /change password/i }).click();

    await expect(appAlert(page)).toHaveText(
      "The identifier or password is incorrect.",
    );
    await expect(page).toHaveURL("/change-password");
  });
});
