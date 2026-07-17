import { describe, expect, it } from "vitest";
import {
  getVerificationEmailFromError,
  isEmailNotVerifiedError,
  isForbiddenError,
  isUnverifiedLoginError,
  loginErrorMessage,
  safeAuthError,
  verificationErrorMessage,
} from "./authErrors";

describe("safeAuthError", () => {
  it("maps known GraphQL extension codes to safe messages", () => {
    expect(safeAuthError(
      { data: { code: "INVALID_CREDENTIALS", errors: [], status: 200 } },
      "fallback",
    )).toBe("Invalid credentials. Please try again.");
  });

  it("falls back when the code is unknown", () => {
    expect(safeAuthError(
      { data: { code: "INTERNAL_SERVER_ERROR", errors: [], status: 500 } },
      "Something went wrong.",
    )).toBe("Something went wrong.");
  });

  it("reads nested RTK Query error shapes", () => {
    expect(safeAuthError(
      { error: { code: "EMAIL_NOT_VERIFIED", errors: [], status: 403 } },
      "fallback",
    )).toBe("Verify your email before signing in.");
  });

  it("detects email-not-verified errors and reads the email extension", () => {
    const error = {
      errors: [{
        extensions: {
          code: "EMAIL_NOT_VERIFIED",
          email: "Pending@Example.com",
        },
      }],
    };

    expect(isEmailNotVerifiedError(error)).toBe(true);
    expect(isForbiddenError(error)).toBe(false);
    expect(isUnverifiedLoginError(error)).toBe(true);
    expect(getVerificationEmailFromError(error)).toBe("pending@example.com");
  });

  it("maps login errors to safe messages", () => {
    expect(loginErrorMessage({ data: { code: "UNAUTHENTICATED" } })).toBe(
      "Invalid credentials. Please try again.",
    );
    expect(loginErrorMessage({ data: { code: "FORBIDDEN" } })).toBe(
      "This account is not available. Verify your email or contact support.",
    );
    expect(loginErrorMessage({ data: { code: "TOO_MANY_REQUESTS" } })).toBe(
      "Too many attempts. Please wait a moment and try again.",
    );
  });

  it("maps verification GraphQL codes to safe messages", () => {
    expect(verificationErrorMessage({
      code: "UNAUTHENTICATED",
      errors: [],
      status: 200,
    })).toBe("Invalid or expired code.");
    expect(verificationErrorMessage({
      code: "TOO_MANY_REQUESTS",
      errors: [],
      status: 200,
    })).toBe("Too many attempts. Please wait a moment and try again.");
    expect(verificationErrorMessage({
      code: "BAD_USER_INPUT",
      errors: [],
      status: 200,
    })).toBe("Enter a valid email and six-digit code.");
  });
});
