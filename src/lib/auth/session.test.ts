import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearSession,
  getAccessToken,
  getAccessTokenExpiresAt,
  getRefreshToken,
  getSessionMetadata,
  setSession,
} from "./session";

describe("session storage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
    clearSession();
  });

  it("keeps access, refresh, and expiry metadata together", () => {
    vi.spyOn(Date, "now").mockReturnValue(1_000);
    setSession({
      accessToken: "access-1",
      expiresIn: 900,
      refreshToken: "refresh-1",
    });

    expect(getAccessToken()).toBe("access-1");
    expect(getAccessTokenExpiresAt()).toBe(901_000);
    expect(getRefreshToken()).toBe("refresh-1");
    expect(getSessionMetadata()).toEqual({
      accessToken: "access-1",
      expiresIn: 900,
      refreshToken: "refresh-1",
    });
    expect(window.localStorage.getItem("todo-auth.session")).not.toContain("access-1");
    vi.restoreAllMocks();
  });

  it("does not swap the access token when refresh persistence fails", () => {
    setSession({
      accessToken: "access-old",
      expiresIn: 10,
      refreshToken: "refresh-old",
    });
    const setItem = vi.spyOn(Storage.prototype, "setItem")
      .mockImplementationOnce(() => {
        throw new DOMException("Storage full", "QuotaExceededError");
      });

    expect(() => setSession({
      accessToken: "access-new",
      expiresIn: 20,
      refreshToken: "refresh-new",
    })).toThrow();
    expect(getAccessToken()).toBe("access-old");
    expect(getRefreshToken()).toBe("refresh-old");

    setItem.mockRestore();
  });

  it("replaces both tokens during rotation", () => {
    setSession({
      accessToken: "access-old",
      expiresIn: 10,
      refreshToken: "refresh-old",
    });
    setSession({
      accessToken: "access-new",
      expiresIn: 20,
      refreshToken: "refresh-new",
    });

    expect(getSessionMetadata()).toEqual({
      accessToken: "access-new",
      expiresIn: 20,
      refreshToken: "refresh-new",
    });
  });
});
