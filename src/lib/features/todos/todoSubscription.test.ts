import { beforeEach, describe, expect, it, vi } from "vitest";
import { setSession } from "@/lib/auth/session";
import { subscribeToTodoChanges } from "./todoSubscription";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  dispose: vi.fn(),
  subscribe: vi.fn(),
  terminate: vi.fn(),
  unsubscribe: vi.fn(),
}));

vi.mock("graphql-ws", () => ({
  createClient: mocks.createClient,
}));

describe("subscribeToTodoChanges", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.subscribe.mockReturnValue(mocks.unsubscribe);
    mocks.createClient.mockReturnValue({
      dispose: mocks.dispose,
      subscribe: mocks.subscribe,
      terminate: mocks.terminate,
    });
  });

  it("authenticates with the current access token and forwards todo events", () => {
    setSession({
      accessToken: "access-token",
      expiresIn: 900,
      refreshToken: "refresh-token",
    });
    const onConnected = vi.fn();
    const onDisconnected = vi.fn();
    const onError = vi.fn();
    const onTodoChanged = vi.fn();

    const cleanup = subscribeToTodoChanges({ onConnected, onDisconnected, onError, onTodoChanged });
    const options = mocks.createClient.mock.calls[0][0];
    const sink = mocks.subscribe.mock.calls[0][1];
    const event = {
      occurredAt: "2026-07-20T12:00:00.000Z",
      todo: null,
      todoId: "todo-id",
      type: "DELETED",
    };

    expect(options.connectionParams()).toEqual({
      Authorization: "Bearer access-token",
    });
    expect(options.shouldRetry()).toBe(true);
    options.on.connected();
    expect(onConnected).toHaveBeenCalledOnce();

    sink.next({ data: { todoChanged: event } });
    expect(onTodoChanged).toHaveBeenCalledWith(event);

    sink.error(new Error("subscription failed"));
    expect(onError).toHaveBeenCalledOnce();

    options.on.closed();
    expect(onDisconnected).toHaveBeenCalledOnce();

    setSession({
      accessToken: "rotated-access-token",
      expiresIn: 900,
      refreshToken: "rotated-refresh-token",
    });
    expect(mocks.terminate).toHaveBeenCalledOnce();
    expect(options.connectionParams()).toEqual({
      Authorization: "Bearer rotated-access-token",
    });

    cleanup();
    expect(mocks.unsubscribe).toHaveBeenCalledOnce();
    expect(mocks.dispose).toHaveBeenCalledOnce();
  });

  it("does not retry while the browser is offline", () => {
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      value: false,
    });

    subscribeToTodoChanges({
      onConnected: vi.fn(),
      onTodoChanged: vi.fn(),
    });

    expect(mocks.createClient.mock.calls[0][0].shouldRetry()).toBe(false);
  });
});
