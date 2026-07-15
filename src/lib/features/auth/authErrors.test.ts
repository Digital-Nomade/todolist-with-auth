import { describe, expect, it } from "vitest";
import { safeAuthError } from "./authErrors";

describe("safeAuthError", () => {
  it("maps known GraphQL extension codes to safe messages", () => {
    expect(safeAuthError(
      { data: { code: "INVALID_CREDENTIALS", errors: [], status: 200 } },
      "fallback",
    )).toBe("The identifier or password is incorrect.");
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
});
