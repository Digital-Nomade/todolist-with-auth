import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeStore } from "@/lib/store";
import type { Todo } from "@/types/Todo.type";
import { computeMigrationChecksum } from "./migration";
import { readOfflineStore } from "./repository";
import type { TodoRemoteClient } from "./remote";
import { createTodoService } from "./todoService";

vi.mock("./migration", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./migration")>();
  return {
    ...actual,
    computeMigrationChecksum: vi.fn(actual.computeMigrationChecksum),
  };
});

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
    cancelLocalOnlyMigration: vi.fn().mockResolvedValue(undefined),
    commitLocalOnlyMigration: vi.fn().mockResolvedValue({
      committedAt: "2026-07-01T00:00:01.000Z",
      deletedCount: 1,
      migrationId: "migration-1",
    }),
    create: vi.fn().mockResolvedValue(serverTodo),
    delete: vi.fn().mockResolvedValue(undefined),
    listAll: vi.fn().mockResolvedValue([serverTodo]),
    prepareLocalOnlyMigration: vi.fn().mockResolvedValue({
      checksum: "abc123",
      expiresAt: "2026-07-02T00:00:00.000Z",
      migrationId: "migration-1",
      todoCount: 1,
      todos: [serverTodo],
    }),
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
    const randomUUID = vi.fn()
      .mockReturnValueOnce("local-id")
      .mockReturnValueOnce("operation-id")
      .mockReturnValueOnce("idempotency-key");
    vi.stubGlobal("crypto", {
      ...globalThis.crypto,
      randomUUID,
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
    vi.mocked(computeMigrationChecksum).mockResolvedValue("abc123");
    vi.mocked(client.prepareLocalOnlyMigration).mockResolvedValue({
      checksum: "abc123",
      expiresAt: "2026-07-02T00:00:00.000Z",
      migrationId: "migration-1",
      todoCount: 1,
      todos: [serverTodo],
    });
    const store = makeStore();
    const service = createTodoService("user-1", store.dispatch, client);

    await service.enableLocalOnly();
    await service.create({ description: "Device", title: "Local" });
    const persisted = await readOfflineStore("user-1");

    expect(client.prepareLocalOnlyMigration).toHaveBeenCalledOnce();
    expect(client.commitLocalOnlyMigration).toHaveBeenCalledWith("migration-1");
    expect(client.create).not.toHaveBeenCalled();
    expect(persisted.localOnly).toBe(true);
    expect(persisted.baselineSnapshot).toEqual([]);
    expect(persisted.queue).toEqual([]);
    expect(persisted.todos[0]).toMatchObject({
      serverId: null,
      syncStatus: "local_only",
    });
  });

  it("resumes a prepared migration commit after reload", async () => {
    setOnline(true);
    const client = remote();
    const store = makeStore();
    const service = createTodoService("user-1", store.dispatch, client);
    const snapshot = [{
      createdAt: serverTodo.createdAt,
      description: serverTodo.description,
      done: serverTodo.done,
      dueTo: serverTodo.dueTo,
      localId: serverTodo.id,
      reminderOn: serverTodo.reminderOn,
      serverId: serverTodo.id,
      syncStatus: "synced" as const,
      title: serverTodo.title,
      updatedAt: serverTodo.updatedAt,
    }];

    localStorage.setItem(
      "offline.todos.v1:user-1",
      JSON.stringify({
        baselineSnapshot: null,
        lastSyncAt: null,
        localOnly: false,
        migrationJournal: {
          checksum: "ignored",
          committedAt: null,
          expiresAt: "2099-01-01T00:00:00.000Z",
          migrationId: "migration-1",
          preparedAt: "2026-07-01T00:00:00.000Z",
          snapshot,
          status: "prepared",
          todoCount: 1,
        },
        queue: [],
        todos: [],
        userId: "user-1",
        version: 2,
      }),
    );

    await service.initialize();

    expect(client.commitLocalOnlyMigration).toHaveBeenCalledWith("migration-1");
    await expect(readOfflineStore("user-1")).resolves.toMatchObject({
      localOnly: true,
      migrationJournal: null,
      todos: [{ serverId: null, syncStatus: "local_only" }],
    });
  });

  it("retries commit for an expired journal before cancelling", async () => {
    setOnline(true);
    const client = remote();
    const store = makeStore();
    const service = createTodoService("user-1", store.dispatch, client);
    const snapshot = [{
      createdAt: serverTodo.createdAt,
      description: serverTodo.description,
      done: serverTodo.done,
      dueTo: null,
      localId: serverTodo.id,
      reminderOn: serverTodo.reminderOn,
      serverId: serverTodo.id,
      syncStatus: "synced" as const,
      title: serverTodo.title,
      updatedAt: serverTodo.updatedAt,
    }];

    localStorage.setItem(
      "offline.todos.v1:user-1",
      JSON.stringify({
        baselineSnapshot: null,
        lastSyncAt: null,
        localOnly: false,
        migrationJournal: {
          checksum: "ignored",
          committedAt: null,
          expiresAt: "2020-01-01T00:00:00.000Z",
          migrationId: "migration-1",
          preparedAt: "2026-07-01T00:00:00.000Z",
          snapshot,
          status: "prepared",
          todoCount: 1,
        },
        queue: [],
        todos: [],
        userId: "user-1",
        version: 2,
      }),
    );

    await service.initialize();

    expect(client.commitLocalOnlyMigration).toHaveBeenCalledWith("migration-1");
    expect(client.cancelLocalOnlyMigration).not.toHaveBeenCalled();
    await expect(readOfflineStore("user-1")).resolves.toMatchObject({
      localOnly: true,
      migrationJournal: null,
    });
  });

  it("abandons an expired journal when commit is rejected", async () => {
    setOnline(true);
    const client = remote();
    vi.mocked(client.commitLocalOnlyMigration).mockRejectedValue({
      data: { code: "MIGRATION_EXPIRED" },
    });
    const store = makeStore();
    const service = createTodoService("user-1", store.dispatch, client);

    localStorage.setItem(
      "offline.todos.v1:user-1",
      JSON.stringify({
        baselineSnapshot: null,
        lastSyncAt: null,
        localOnly: false,
        migrationJournal: {
          checksum: "ignored",
          committedAt: null,
          expiresAt: "2020-01-01T00:00:00.000Z",
          migrationId: "migration-1",
          preparedAt: "2026-07-01T00:00:00.000Z",
          snapshot: [{
            createdAt: serverTodo.createdAt,
            description: serverTodo.description,
            done: serverTodo.done,
            dueTo: null,
            localId: serverTodo.id,
            reminderOn: serverTodo.reminderOn,
            serverId: serverTodo.id,
            syncStatus: "synced",
            title: serverTodo.title,
            updatedAt: serverTodo.updatedAt,
          }],
          status: "prepared",
          todoCount: 1,
        },
        queue: [],
        todos: [],
        userId: "user-1",
        version: 2,
      }),
    );

    await service.initialize();

    expect(client.commitLocalOnlyMigration).toHaveBeenCalledWith("migration-1");
    expect(client.cancelLocalOnlyMigration).toHaveBeenCalledWith("migration-1");
    await expect(readOfflineStore("user-1")).resolves.toMatchObject({
      localOnly: false,
      migrationJournal: null,
    });
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
    expect(client.prepareLocalOnlyMigration).not.toHaveBeenCalled();
  });
});
