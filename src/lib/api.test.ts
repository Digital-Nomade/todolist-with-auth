import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearSession,
  getRefreshToken,
  setSession,
} from "@/lib/auth/session";
import { makeStore } from "@/lib/store";
import { authApi } from "@/lib/features/auth/authApi";
import { sessionRestored } from "@/lib/features/auth/authSlice";
import { todoApi } from "@/lib/features/todos/todoApi";
import { redirectToLogin } from "./api";

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

const todo = {
  createdAt: "2026-01-01T00:00:00.000Z",
  description: "Meaningful coverage",
  done: false,
  dueTo: null,
  id: "a18c8296-2e47-40ce-a88b-fdd53ce19f03",
  reminderOn: null,
  title: "Test GraphQL",
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

describe("redirectToLogin", () => {
  it("replaces history when the user is on a protected route", () => {
    window.history.replaceState(null, "", "/home");
    const listener = vi.fn();
    window.addEventListener("popstate", listener);

    redirectToLogin();

    expect(window.location.pathname).toBe("/login");
    expect(listener).toHaveBeenCalledOnce();

    window.removeEventListener("popstate", listener);
  });

  it("does nothing when already on the login page", () => {
    window.history.replaceState(null, "", "/login");
    const listener = vi.fn();
    window.addEventListener("popstate", listener);

    redirectToLogin();

    expect(listener).not.toHaveBeenCalled();

    window.removeEventListener("popstate", listener);
  });
});

describe("graphqlBaseQuery", () => {
  beforeEach(() => {
    clearSession();
    window.localStorage.clear();
    window.history.replaceState(null, "", "/");
    vi.stubGlobal("fetch", vi.fn());
  });

  it("finishes startup restoration without fetching or redirecting when no session exists", async () => {
    const { refreshSessionOnce } = await import("@/lib/api");

    await expect(refreshSessionOnce()).resolves.toBeNull();

    expect(fetchMock()).not.toHaveBeenCalled();
    expect(window.location.pathname).toBe("/");
  });

  it("attaches access tokens only to protected requests", async () => {
    setSession({ accessToken: "access-1", expiresIn: 30, refreshToken: "refresh-1" });
    fetchMock()
      .mockImplementationOnce(() => response({ data: { me: profile } }))
      .mockImplementationOnce(() => response({
        data: {
          refreshToken: {
            accessToken: "access-2",
            expiresIn: 60,
            id: "auth-id",
            refreshToken: "refresh-2",
            user: activeUser,
          },
        },
      }));
    const store = makeStore();

    await store.dispatch(authApi.endpoints.userProfile.initiate()).unwrap();
    const { refreshSession } = await import("@/lib/api");
    await refreshSession();

    expect(requestAt(0).headers.get("authorization")).toBe("Bearer access-1");
    expect(requestAt(1).headers.has("authorization")).toBe(false);
  });

  it("refreshes one UNAUTHENTICATED response and retries once with rotated tokens", async () => {
    setSession({ accessToken: "expired", expiresIn: 0, refreshToken: "refresh-old" });
    fetchMock()
      .mockImplementationOnce(() => response({
        errors: [{ extensions: { code: "UNAUTHENTICATED" }, message: "expired" }],
      }))
      .mockImplementationOnce(() => response({
        data: {
          refreshToken: {
            accessToken: "access-new",
            expiresIn: 600,
            id: "auth-id",
            refreshToken: "refresh-new",
            user: activeUser,
          },
        },
      }))
      .mockImplementationOnce(() => response({ data: { me: profile } }));
    const store = makeStore();

    await store.dispatch(authApi.endpoints.userProfile.initiate()).unwrap();

    expect(fetchMock()).toHaveBeenCalledTimes(3);
    expect(requestAt(1).headers.has("authorization")).toBe(false);
    expect(requestAt(2).headers.get("authorization")).toBe("Bearer access-new");
    expect(getRefreshToken()).toBe("refresh-new");
  });

  it("coalesces concurrent expired requests into exactly one refresh", async () => {
    setSession({ accessToken: "expired", expiresIn: 0, refreshToken: "refresh-old" });
    let protectedCalls = 0;
    fetchMock().mockImplementation((_url, init) => {
      const body = JSON.parse(String(init?.body)) as { query: string };
      if (body.query.includes("mutation RefreshToken")) {
        return response({
          data: {
            refreshToken: {
              accessToken: "access-new",
              expiresIn: 600,
              id: "auth-id",
              refreshToken: "refresh-new",
              user: activeUser,
            },
          },
        });
      }
      protectedCalls += 1;
      return protectedCalls <= 2
        ? response({
            errors: [{ extensions: { code: "UNAUTHENTICATED" }, message: "expired" }],
          })
        : response({ data: { todo } });
    });
    const store = makeStore();

    await Promise.all([
      store.dispatch(todoApi.endpoints.getTodo.initiate("todo-one")).unwrap(),
      store.dispatch(todoApi.endpoints.getTodo.initiate("todo-two")).unwrap(),
    ]);

    const refreshes = fetchMock().mock.calls.filter((_, index) =>
      requestAt(index).body.query.includes("mutation RefreshToken"));
    expect(refreshes).toHaveLength(1);
  });

  it("clears Redux/storage and redirects when refresh fails without recursion", async () => {
    setSession({ accessToken: "expired", expiresIn: 0, refreshToken: "bad-refresh" });
    fetchMock()
      .mockImplementationOnce(() => response({
        errors: [{ extensions: { code: "UNAUTHENTICATED" }, message: "expired" }],
      }))
      .mockImplementationOnce(() => response({
        errors: [{ extensions: { code: "UNAUTHENTICATED" }, message: "invalid refresh" }],
      }));
    const store = makeStore();
    store.dispatch(sessionRestored(activeUser as never));

    await expect(store.dispatch(authApi.endpoints.userProfile.initiate()).unwrap())
      .rejects.toMatchObject({ code: "UNAUTHENTICATED" });

    expect(fetchMock()).toHaveBeenCalledTimes(2);
    expect(getRefreshToken()).toBeNull();
    expect(store.getState().auth.isAuthenticated).toBe(false);
    expect(window.location.pathname).toBe("/login");
    expect(requestAt(1).headers.has("authorization")).toBe(false);
  });

  it("fails HTTP 200 GraphQL errors by extensions.code", async () => {
    fetchMock().mockImplementationOnce(() => response({
      errors: [{ extensions: { code: "FORBIDDEN" }, message: "no access" }],
    }));
    const store = makeStore();

    await expect(store.dispatch(todoApi.endpoints.getTodo.initiate("todo-id")).unwrap())
      .rejects.toMatchObject({ code: "FORBIDDEN", status: 200 });
  });

  it("keeps UUIDs as strings and invalidates the todo list after mutation", async () => {
    let listRequests = 0;
    fetchMock().mockImplementation((_url, init) => {
      const { query } = JSON.parse(String(init?.body)) as { query: string };
      if (query.includes("query Todos")) {
        listRequests += 1;
        return response({
          data: { todos: { data: [todo], first: 1, last: 1, limit: 10, total: 1 } },
        });
      }
      return response({ data: { createTodo: todo } });
    });
    const store = makeStore();
    const list = store.dispatch(todoApi.endpoints.listTodos.initiate());

    const first = await list.unwrap();
    expect(first.data[0].id).toBe(todo.id);
    expect(typeof first.data[0].id).toBe("string");

    await store.dispatch(todoApi.endpoints.createTodo.initiate({
      idempotencyKey: "stable-create-key",
      input: {
        description: todo.description,
        title: todo.title,
      },
    })).unwrap();

    await vi.waitFor(() => expect(listRequests).toBe(2));
    expect(requestAt(1).headers.get("idempotency-key")).toBe("stable-create-key");
    list.unsubscribe();
  });
});
