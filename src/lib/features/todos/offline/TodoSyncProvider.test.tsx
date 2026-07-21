import { cleanup, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sessionRestored } from "@/lib/features/auth/authSlice";
import { makeStore } from "@/lib/store";
import { connectivityChanged, offlineStoreHydrated } from "./offlineSlice";
import { TodoSyncProvider } from "./TodoSyncProvider";

const mocks = vi.hoisted(() => ({
  createTodoRemoteClient: vi.fn(),
  createTodoService: vi.fn(),
  initialize: vi.fn(),
  invalidateTags: vi.fn(),
  refresh: vi.fn(),
  subscribeToTodoChanges: vi.fn(),
  sync: vi.fn(),
  unsubscribe: vi.fn(),
}));

vi.mock("./remote", () => ({
  createTodoRemoteClient: mocks.createTodoRemoteClient,
}));

vi.mock("./todoService", () => ({
  createTodoService: mocks.createTodoService,
}));

vi.mock("../todoSubscription", () => ({
  subscribeToTodoChanges: mocks.subscribeToTodoChanges,
}));

vi.mock("../todoApi", () => ({
  todoApi: {
    util: {
      invalidateTags: mocks.invalidateTags.mockImplementation((tags: unknown) => ({
        type: "todoApi/invalidateTags",
        payload: tags,
      })),
    },
  },
}));

vi.mock("./syncEngine", () => ({
  cancelTodoSync: vi.fn(),
}));

const activeUser = {
  email: "person@example.com",
  id: "6fffb4d8-ae0a-42bc-8154-80a118b36644",
  status: "ACTIVE",
  username: "person",
} as const;

describe("TodoSyncProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      value: true,
    });
    mocks.initialize.mockResolvedValue(undefined);
    mocks.refresh.mockResolvedValue(undefined);
    mocks.createTodoService.mockReturnValue({
      initialize: mocks.initialize,
      refresh: mocks.refresh,
      sync: mocks.sync,
    });
    mocks.subscribeToTodoChanges.mockReturnValue(mocks.unsubscribe);
  });

  afterEach(cleanup);

  it("replays queued writes and refetches todos when the browser returns online", async () => {
    const store = makeStore();
    store.dispatch(sessionRestored(activeUser as never));

    render(
      <Provider store={store}>
        <TodoSyncProvider><p>App</p></TodoSyncProvider>
      </Provider>,
    );
    await waitFor(() => expect(mocks.initialize).toHaveBeenCalledOnce());

    window.dispatchEvent(new Event("online"));

    expect(mocks.sync).toHaveBeenCalledOnce();
    await waitFor(() => expect(mocks.refresh).toHaveBeenCalledOnce());
  });

  it("starts the subscription when hydrated and online", async () => {
    const store = makeStore();
    store.dispatch(sessionRestored(activeUser as never));
    store.dispatch(offlineStoreHydrated({
      lastSyncAt: null,
      localOnly: false,
      queue: [],
      todos: [],
      userId: activeUser.id,
    }));

    render(
      <Provider store={store}>
        <TodoSyncProvider><p>App</p></TodoSyncProvider>
      </Provider>,
    );

    await waitFor(() => expect(mocks.subscribeToTodoChanges).toHaveBeenCalledOnce());
    const handlers = mocks.subscribeToTodoChanges.mock.calls[0][0];

    handlers.onConnected();
    expect(mocks.refresh).toHaveBeenCalledOnce();
    expect(mocks.invalidateTags).toHaveBeenCalledWith([{ type: "todos", id: "LIST" }]);
  });

  it("does not start the subscription while offline", async () => {
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      value: false,
    });
    const store = makeStore();
    store.dispatch(connectivityChanged(false));
    store.dispatch(sessionRestored(activeUser as never));
    store.dispatch(offlineStoreHydrated({
      lastSyncAt: null,
      localOnly: false,
      queue: [],
      todos: [],
      userId: activeUser.id,
    }));

    render(
      <Provider store={store}>
        <TodoSyncProvider><p>App</p></TodoSyncProvider>
      </Provider>,
    );

    await waitFor(() => expect(mocks.initialize).toHaveBeenCalledOnce());
    expect(mocks.subscribeToTodoChanges).not.toHaveBeenCalled();
  });
});
