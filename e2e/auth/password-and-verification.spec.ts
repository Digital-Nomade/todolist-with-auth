import { test, expect } from "@playwright/test";
import { installGraphqlMock } from "../fixtures/graphql-mock";
import { appAlert } from "../helpers/alerts";

test.describe("forgot password", () => {
  test.beforeEach(async ({ page }) => {
    await installGraphqlMock(page);
  });

  test("shows the same success message for any email", async ({ page }) => {
    await page.goto("/forgot-password");

    await page.getByLabel("email").fill("nobody@example.com");
    await page.getByRole("button", { name: /send reset link/i }).click();

    await expect(page.getByText(
      "If an account exists for that email, a password reset link has been sent.",
    )).toBeVisible();
  });

  test("returns to login", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.getByRole("link", { name: "Back to login" }).click();
    await expect(page).toHaveURL("/login");
  });
});

test.describe("check email", () => {
  test.beforeEach(async ({ page }) => {
    await installGraphqlMock(page);
  });

  test("shows the destination email and resends verification", async ({ page }) => {
    await page.goto("/check-email?email=person@example.com");

    await expect(page.getByText("person@example.com")).toBeVisible();
    await page.getByRole("button", { name: /resend verification/i }).click();
    await expect(page.getByRole("status")).toHaveText("A new verification email has been sent.");
  });

  test("warns when resending without an email query parameter", async ({ page }) => {
    await page.goto("/check-email");
    await page.getByRole("button", { name: /resend verification/i }).click();

    await expect(page.getByRole("status")).toHaveText(
      "Return to registration and provide your email address.",
    );
  });
});

test.describe("verify email", () => {
  test.beforeEach(async ({ page }) => {
    await installGraphqlMock(page);
  });

  test("verifies a valid token", async ({ page }) => {
    await page.goto("/verify-email?token=valid-verify-token");

    await expect(page.getByRole("heading", { name: "Email verified" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Continue to login" })).toBeVisible();
  });

  test("shows an invalid state and allows retry", async ({ page }) => {
    await installGraphqlMock(page, { verifyToken: "invalid" });
    await page.goto("/verify-email?token=bad-token");

    await expect(page.getByRole("heading", { name: "Invalid verification link" })).toBeVisible();
    await page.getByRole("button", { name: /retry/i }).click();
    await expect(page.getByRole("heading", { name: "Invalid verification link" })).toBeVisible();
  });

  test("treats a missing token as invalid", async ({ page }) => {
    await page.goto("/verify-email");

    await expect(page.getByRole("heading", { name: "Invalid verification link" })).toBeVisible();
  });
});

test.describe("reset password", () => {
  test.beforeEach(async ({ page }) => {
    await installGraphqlMock(page);
  });

  test("updates the password with a valid token", async ({ page }) => {
    await page.goto("/reset-password?token=valid-reset-token");

    await page.getByLabel("new password", { exact: true }).fill("new-password");
    await page.getByLabel("confirm password").fill("new-password");
    await page.getByRole("button", { name: /update password/i }).click();

    await expect(page.getByText("Password updated successfully.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Continue to login" })).toBeVisible();
  });

  test("shows an error for an invalid token", async ({ page }) => {
    await installGraphqlMock(page, { resetToken: "invalid" });
    await page.goto("/reset-password?token=bad-token");

    await page.getByLabel("new password", { exact: true }).fill("new-password");
    await page.getByLabel("confirm password").fill("new-password");
    await page.getByRole("button", { name: /update password/i }).click();

    await expect(appAlert(page)).toHaveText(
      "This reset link is invalid or has expired.",
    );
  });

  test("blocks submission when the reset token is missing", async ({ page }) => {
    await page.goto("/reset-password");

    await page.getByLabel("new password", { exact: true }).fill("new-password");
    await page.getByLabel("confirm password").fill("new-password");
    await page.getByRole("button", { name: /update password/i }).click();

    await expect(appAlert(page)).toHaveText("This reset link is invalid.");
  });
});
