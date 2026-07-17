import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeStore } from "@/lib/store";
import type { Todo } from "@/types/Todo.type";
import { readOfflineStore } from "./repository";
import type { TodoRemoteClient } from "./remote";
import { createTodoService } from "./todoService";

const serverTodo: Todo = {
  createdAt: "2026-07-01T00:00:00.000Z",
  description: "Remote",
  done: false,
  dueTo: null,
  id: "server-1",
  reminderOn: null,
  title: "Todo",
  updatedAt: "2026-07-01T00:00:00.000Z",
};

function remote(): TodoRemoteClient {
  return {
    create: vi.fn().mockResolvedValue(serverTodo),
    delete: vi.fn().mockResolvedValue(undefined),
    listAll: vi.fn().mockResolvedValue([serverTodo]),
    update: vi.fn().mockResolvedValue(serverTodo),
  };
}

function setOnline(value: boolean) {
  Object.defineProperty(navigator, "onLine", {
    configurable: true,
    value,
  });
}

describe("offline todo service", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("crypto", {
      randomUUID: vi.fn()
        .mockReturnValueOnce("local-id")
        .mockReturnValueOnce("operation-id")
        .mockReturnValueOnce("idempotency-key"),
    });
  });

  it("mirrors successful online reads and creates", async () => {
    setOnline(true);
    const client = remote();
    const store = makeStore();
    const service = createTodoService("user-1", store.dispatch, client);

    await service.initialize();
    await service.create({ description: "Remote", title: "Todo" });

    expect(client.create).toHaveBeenCalledWith(
      { description: "Remote", title: "Todo" },
      "idempotency-key",
    );
    expect((await readOfflineStore("user-1")).todos[0]).toMatchObject({
      serverId: "server-1",
      syncStatus: "synced",
    });
  });

  it("saves and queues an offline create immediately", async () => {
    setOnline(false);
    const client = remote();
    const store = makeStore();
    const service = createTodoService("user-1", store.dispatch, client);

    await service.initialize();
    const localId = await service.create({ description: "Offline", title: "Todo" });
    const persisted = await readOfflineStore("user-1");

    expect(localId).toBe("local-id");
    expect(client.create).not.toHaveBeenCalled();
    expect(persisted.todos[0]).toMatchObject({
      localId: "local-id",
      syncStatus: "pending",
    });
    expect(persisted.queue[0]).toMatchObject({
      idempotencyKey: "idempotency-key",
      type: "CREATE",
    });
  });

  it("cancels a queued create when the local todo is deleted", async () => {
    setOnline(false);
    const store = makeStore();
    const service = createTodoService("user-1", store.dispatch, remote());

    const localId = await service.create({ description: "Offline", title: "Todo" });
    await service.delete(localId);

    await expect(readOfflineStore("user-1")).resolves.toMatchObject({
      queue: [],
      todos: [],
    });
  });

  it("does not queue semantic online errors", async () => {
    setOnline(true);
    const client = remote();
    vi.mocked(client.create).mockRejectedValue({
      code: "BAD_USER_INPUT",
      status: 200,
    });
    const store = makeStore();
    const service = createTodoService("user-1", store.dispatch, client);

    await expect(service.create({ description: "", title: "" })).rejects.toMatchObject({
      code: "BAD_USER_INPUT",
    });
    await expect(readOfflineStore("user-1")).resolves.toMatchObject({
      queue: [],
      todos: [],
    });
  });

  it("keeps local-only writes off the network and queue", async () => {
    setOnline(true);
    const client = remote();
    const store = makeStore();
    const service = createTodoService("user-1", store.dispatch, client);

    await service.enableLocalOnly();
    await service.create({ description: "Device", title: "Local" });
    const persisted = await readOfflineStore("user-1");

    expect(client.create).not.toHaveBeenCalled();
    expect(persisted.localOnly).toBe(true);
    expect(persisted.queue).toEqual([]);
    expect(persisted.todos[0].syncStatus).toBe("local_only");
  });

  it("does not enable local-only mode while cloud changes are pending", async () => {
    setOnline(false);
    const store = makeStore();
    const client = remote();
    const service = createTodoService("user-1", store.dispatch, client);
    await service.create({ description: "Pending", title: "Todo" });
    setOnline(true);

    await expect(service.enableLocalOnly()).rejects.toThrow(
      "Wait for pending todo changes to sync",
    );
    expect(client.listAll).not.toHaveBeenCalled();
  });
});
