import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  clearVerificationFlowState,
  getRemainingResendCooldownMs,
  getVerificationEmail,
  getVerificationMessage,
  isValidVerificationCode,
  maskEmail,
  normalizeVerificationCode,
  resolveVerificationEmail,
  setResendCooldown,
  storeVerificationEmail,
  storeVerificationMessage,
  VERIFICATION_RESEND_COOLDOWN_MS,
} from "./verificationFlow";

describe("verificationFlow", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    clearVerificationFlowState();
  });

  it("stores and resolves the registration email without exposing it in URLs", () => {
    storeVerificationEmail("Person@Example.com");
    storeVerificationMessage("Check your inbox");

    expect(getVerificationEmail()).toBe("person@example.com");
    expect(getVerificationMessage()).toBe("Check your inbox");
    expect(resolveVerificationEmail(null)).toBe("person@example.com");
  });

  it("accepts exactly six digits and preserves leading zeroes as strings", () => {
    expect(normalizeVerificationCode("01a2b3c4567")).toBe("012345");
    expect(isValidVerificationCode("012345")).toBe(true);
    expect(isValidVerificationCode("12345")).toBe(false);
    expect(isValidVerificationCode("1234567")).toBe(false);
  });

  it("masks the destination email for display", () => {
    expect(maskEmail("person@example.com")).toBe("p***@example.com");
    expect(maskEmail("ab@example.com")).toBe("***@example.com");
  });

  it("tracks resend cooldown in session storage across lookups", () => {
    storeVerificationEmail("person@example.com");
    setResendCooldown("person@example.com", 30_000);

    const remaining = getRemainingResendCooldownMs("person@example.com");
    expect(remaining).toBeGreaterThan(0);
    expect(remaining).toBeLessThanOrEqual(30_000);
    expect(getRemainingResendCooldownMs("other@example.com")).toBe(0);
  });

  it("falls back to the query email only when session storage is empty", () => {
    expect(resolveVerificationEmail("query@example.com")).toBe("query@example.com");
    expect(getVerificationEmail()).toBe("query@example.com");
  });

  it("does not persist verification codes", () => {
    const keys = Object.keys(sessionStorage);
    expect(keys.some(key => key.includes("code"))).toBe(false);
    expect(VERIFICATION_RESEND_COOLDOWN_MS).toBeGreaterThan(0);
  });
});
