import { describe, expect, it } from "vitest";
import authReducer, {
  initializationFinished,
  sessionCleared,
  sessionRestored,
} from "./authSlice";

const activeUser = {
  email: "person@example.com",
  emailVerifiedAt: "2026-01-01T00:00:00.000Z",
  id: "6fffb4d8-ae0a-42bc-8154-80a118b36644",
  status: "ACTIVE" as const,
  username: "person",
};

describe("authSlice", () => {
  it("restores an active session", () => {
    const state = authReducer(undefined, sessionRestored(activeUser));

    expect(state.initialized).toBe(true);
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(activeUser);
  });

  it("keeps pending verification users unauthenticated", () => {
    const state = authReducer(undefined, sessionRestored({
      ...activeUser,
      status: "PENDING_VERIFICATION",
    }));

    expect(state.isAuthenticated).toBe(false);
    expect(state.user?.status).toBe("PENDING_VERIFICATION");
  });

  it("clears the session", () => {
    const cleared = authReducer(
      {
        initialized: true,
        isAuthenticated: true,
        user: activeUser,
      },
      sessionCleared(),
    );

    expect(cleared.isAuthenticated).toBe(false);
    expect(cleared.user).toBeNull();
    expect(cleared.initialized).toBe(true);
  });

  it("marks initialization complete without a user", () => {
    const state = authReducer(undefined, initializationFinished());

    expect(state.initialized).toBe(true);
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });
});
