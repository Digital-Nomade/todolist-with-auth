import { describe, expect, it } from "vitest";
import { isTodoUnavailableError } from "./todoApi";

describe("isTodoUnavailableError", () => {
  it("returns true for not-found and forbidden GraphQL errors", () => {
    expect(isTodoUnavailableError({ code: "NOT_FOUND", errors: [], status: 200 })).toBe(true);
    expect(isTodoUnavailableError({ code: "TODO_NOT_FOUND", errors: [], status: 200 })).toBe(true);
    expect(isTodoUnavailableError({ code: "FORBIDDEN", errors: [], status: 200 })).toBe(true);
    expect(isTodoUnavailableError({ code: "GRAPHQL_ERROR", errors: [], status: 404 })).toBe(true);
  });

  it("returns false for unrelated errors", () => {
    expect(isTodoUnavailableError({ code: "BAD_USER_INPUT", errors: [], status: 200 })).toBe(false);
    expect(isTodoUnavailableError(null)).toBe(false);
    expect(isTodoUnavailableError("network")).toBe(false);
  });
});
