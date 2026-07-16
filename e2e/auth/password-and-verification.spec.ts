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

test.describe("email confirmation code", () => {
  test.beforeEach(async ({ page }) => {
    await installGraphqlMock(page);
  });

  test("shows the destination email and resends a code", async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem("todo-auth.verification-email", "person@example.com");
      window.sessionStorage.setItem("todo-auth.verification-message", "Check your inbox");
    });

    await page.goto("/check-email");

    await expect(page.getByRole("status")).toHaveText("Check your inbox");
    await expect(page.getByText(/p\*\*\*@example\.com/)).toBeVisible();
    await page.getByRole("button", { name: /resend code/i }).click();
    await expect(page.getByText(
      "Verification email sent Any previous code is no longer valid.",
    )).toBeVisible();
    await expect(page.getByRole("button", { name: /resend code in/i })).toBeDisabled();
  });

  test("verifies a six-digit code and navigates to login", async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem("todo-auth.verification-email", "person@example.com");
    });

    await page.goto("/check-email");
    await page.getByLabel("Verification code").fill("123456");
    await page.getByRole("button", { name: /verify code/i }).click();

    await expect(page).toHaveURL("/login");
    await expect(page.evaluate(() => window.sessionStorage.getItem("todo-auth.verification-email"))).resolves.toBeNull();
  });

  test("preserves leading zeroes in the submitted code", async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem("todo-auth.verification-email", "person@example.com");
    });

    await page.goto("/check-email");
    await page.getByLabel("Verification code").fill("012345");
    await page.getByRole("button", { name: /verify code/i }).click();

    await expect(page).toHaveURL("/login");
  });

  test("shows a safe error for invalid or expired codes", async ({ page }) => {
    await installGraphqlMock(page, { verifyCode: "invalid" });
    await page.addInitScript(() => {
      window.sessionStorage.setItem("todo-auth.verification-email", "person@example.com");
    });

    await page.goto("/check-email");
    await page.getByLabel("Verification code").fill("123456");
    await page.getByRole("button", { name: /verify code/i }).click();

    await expect(page.getByRole("status")).toHaveText("Invalid or expired code.");
  });

  test("offers a recovery path when the email is unavailable", async ({ page }) => {
    await page.goto("/check-email");

    await expect(page.getByRole("heading", { name: "Confirm your email" })).toBeVisible();
    await page.getByLabel("email").fill("person@example.com");
    await page.getByRole("button", { name: /continue/i }).click();
    await expect(page.getByText(/p\*\*\*@example\.com/)).toBeVisible();
  });

  test("redirects legacy verify-email links to the code screen", async ({ page }) => {
    await page.goto("/verify-email?token=legacy-token");
    await expect(page).toHaveURL("/check-email");
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
