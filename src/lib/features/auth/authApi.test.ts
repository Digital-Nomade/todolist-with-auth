import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  getSessionMetadata,
  setSession,
} from "@/lib/auth/session";
import { makeStore } from "@/lib/store";
import { authApi } from "./authApi";
import { sessionRestored } from "./authSlice";

const activeUser = {
  email: "person@example.com",
  emailVerifiedAt: "2026-01-01T00:00:00.000Z",
  id: "6fffb4d8-ae0a-42bc-8154-80a118b36644",
  status: "ACTIVE",
  username: "person",
};

const profile = {
  ...activeUser,
  birthdate: "1990-01-01T00:00:00.000Z",
  createdAt: "2026-01-01T00:00:00.000Z",
  lastName: "Example",
  name: "Pat",
  profilePicture: null,
  updatedAt: "2026-01-01T00:00:00.000Z",
};

function response(payload: object, status = 200) {
  return Promise.resolve(new Response(JSON.stringify(payload), {
    headers: { "content-type": "application/json" },
    status,
  }));
}

function fetchMock() {
  return vi.mocked(fetch);
}

function requestAt(index: number) {
  const [, init] = fetchMock().mock.calls[index];
  return {
    body: JSON.parse(String(init?.body)) as {
      query: string;
      variables?: Record<string, unknown>;
    },
    headers: new Headers(init?.headers),
  };
}

describe("authApi", () => {
  beforeEach(() => {
    clearSession();
    window.localStorage.clear();
    window.history.replaceState(null, "", "/");
    vi.stubGlobal("fetch", vi.fn());
  });

  it("consumes registration message and sends registration variables", async () => {
    fetchMock().mockImplementationOnce(() =>
      response({ data: { createUser: { message: "Check your inbox" } } }));
    const store = makeStore();
    const input = {
      birthdate: "1990-01-01T00:00:00.000Z",
      email: "person@example.com",
      lastName: "Example",
      name: "Pat",
      password: "password123",
      profilePicture: null,
      username: "person",
    };

    const result = await store.dispatch(authApi.endpoints.registerUser.initiate(input)).unwrap();

    expect(result.message).toBe("Check your inbox");
    expect(requestAt(0).body.variables).toEqual({ input });
  });

  it("logs in with identifier and stores complete token metadata", async () => {
    fetchMock().mockImplementationOnce(() => response({
      data: {
        login: {
          accessToken: "access-login",
          expiresIn: 3600,
          id: "auth-id",
          refreshToken: "refresh-login",
          user: activeUser,
        },
      },
    }));
    const store = makeStore();

    await store.dispatch(authApi.endpoints.loginUser.initiate({
      identifier: "person",
      password: "password123",
    })).unwrap();

    expect(requestAt(0).body.variables).toEqual({
      input: { identifier: "person", password: "password123" },
    });
    expect(getSessionMetadata()).toEqual({
      accessToken: "access-login",
      expiresIn: 3600,
      refreshToken: "refresh-login",
    });
  });

  it("passes verification and password-reset inputs without leaking account existence", async () => {
    fetchMock()
      .mockImplementationOnce(() => response({ data: { verifyEmail: profile } }))
      .mockImplementationOnce(() => response({
        errors: [{ extensions: { code: "NOT_FOUND" }, message: "unknown" }],
      }))
      .mockImplementationOnce(() => response({
        data: { resetPassword: { message: "Password reset" } },
      }));
    const store = makeStore();

    await store.dispatch(authApi.endpoints.verifyEmail.initiate("query-token")).unwrap();
    await expect(store.dispatch(
      authApi.endpoints.requestPasswordReset.initiate("nobody@example.com"),
    ).unwrap()).rejects.toMatchObject({ code: "NOT_FOUND" });
    await store.dispatch(authApi.endpoints.resetPassword.initiate({
      newPassword: "new-password",
      token: "reset-token",
    })).unwrap();

    expect(requestAt(0).body.variables).toEqual({ input: { token: "query-token" } });
    expect(requestAt(1).body.variables).toEqual({
      input: { email: "nobody@example.com" },
    });
    expect(requestAt(2).body.variables).toEqual({
      input: { newPassword: "new-password", token: "reset-token" },
    });
  });

  it("clears the session after logout even when the API fails", async () => {
    setSession({ accessToken: "access", expiresIn: 20, refreshToken: "refresh" });
    fetchMock().mockImplementationOnce(() => response({
      errors: [{ extensions: { code: "INTERNAL_SERVER_ERROR" }, message: "offline" }],
    }));
    const store = makeStore();
    store.dispatch(sessionRestored(activeUser as never));

    await expect(store.dispatch(authApi.endpoints.logout.initiate()).unwrap()).rejects.toBeDefined();

    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
    expect(store.getState().auth.isAuthenticated).toBe(false);
    expect(requestAt(0).body.variables).toEqual({ refreshToken: "refresh" });
  });

  it("sends current/new password and clears the successful session", async () => {
    setSession({ accessToken: "access", expiresIn: 20, refreshToken: "refresh" });
    fetchMock().mockImplementationOnce(() => response({
      data: { changePassword: profile },
    }));
    const store = makeStore();
    store.dispatch(sessionRestored(activeUser as never));

    await store.dispatch(authApi.endpoints.changePassword.initiate({
      currentPassword: "current-password",
      newPassword: "new-password",
    })).unwrap();

    expect(requestAt(0).body.variables).toEqual({
      input: {
        currentPassword: "current-password",
        newPassword: "new-password",
      },
    });
    expect(getAccessToken()).toBeNull();
    expect(store.getState().auth.isAuthenticated).toBe(false);
  });

  it("limits profile updates to editable fields", async () => {
    fetchMock().mockImplementationOnce(() => response({
      data: { updateProfile: profile },
    }));
    const store = makeStore();

    await store.dispatch(authApi.endpoints.updateProfile.initiate({
      birthdate: profile.birthdate,
      lastName: "Updated",
      name: "Pat",
      profilePicture: null,
    })).unwrap();

    const input = (requestAt(0).body.variables as { input: Record<string, unknown> }).input;
    expect(input).not.toHaveProperty("email");
    expect(input).not.toHaveProperty("username");
  });
});
