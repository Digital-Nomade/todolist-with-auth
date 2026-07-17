import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeStore } from "@/lib/store";
import type { Todo } from "@/types/Todo.type";
import {
  applyTodoUpdate,
  createOperation,
  localCreate,
  updateOperation,
} from "./mappers";
import {
  readOfflineStore,
  updateOfflineStore,
  writeOfflineStore,
} from "./repository";
import type { TodoRemoteClient } from "./remote";
import { runTodoSync } from "./syncEngine";

describe("todo sync engine", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("crypto", {
      randomUUID: vi.fn()
        .mockReturnValueOnce("local-id")
        .mockReturnValueOnce("operation-id")
        .mockReturnValueOnce("stable-key"),
    });
  });

  it("shares one flight per user and reconciles a queued create", async () => {
    const local = localCreate({ description: "Offline", title: "Todo" }, false);
    const operation = createOperation(local);
    await writeOfflineStore({
      baselineSnapshot: null,
      lastSyncAt: null,
      localOnly: false,
      queue: [operation],
      todos: [local],
      userId: "user-1",
      version: 1,
    });
    let resolveCreate!: (todo: Todo) => void;
    const createPromise = new Promise<Todo>(resolve => {
      resolveCreate = resolve;
    });
    const remote: TodoRemoteClient = {
      create: vi.fn(() => createPromise),
      delete: vi.fn(),
      listAll: vi.fn(),
      update: vi.fn(),
    };
    const store = makeStore();

    const first = runTodoSync("user-1", remote, store.dispatch);
    const second = runTodoSync("user-1", remote, store.dispatch);
    expect(first).toBe(second);

    resolveCreate({
      createdAt: local.createdAt,
      description: local.description,
      done: false,
      dueTo: null,
      id: "server-id",
      reminderOn: null,
      title: local.title,
      updatedAt: local.updatedAt,
    });
    await first;

    expect(remote.create).toHaveBeenCalledOnce();
    expect(remote.create).toHaveBeenCalledWith(operation.input, "stable-key");
    await expect(readOfflineStore("user-1")).resolves.toMatchObject({
      queue: [],
      todos: [{ localId: "local-id", serverId: "server-id", syncStatus: "synced" }],
    });
  });

  it("preserves an edit made while a create is in flight", async () => {
    const local = localCreate({ description: "Original", title: "Todo" }, false);
    const operation = createOperation(local);
    await writeOfflineStore({
      baselineSnapshot: null,
      lastSyncAt: null,
      localOnly: false,
      queue: [operation],
      todos: [local],
      userId: "user-1",
      version: 1,
    });
    let resolveCreate!: (todo: Todo) => void;
    const remote: TodoRemoteClient = {
      create: vi.fn(() => new Promise<Todo>(resolve => {
        resolveCreate = resolve;
      })),
      delete: vi.fn(),
      listAll: vi.fn(),
      update: vi.fn((_id, input) => Promise.resolve({
        ...local,
        ...input,
        id: "server-id",
      })),
    };
    const store = makeStore();
    const sync = runTodoSync("user-1", remote, store.dispatch);
    await vi.waitFor(() => expect(remote.create).toHaveBeenCalledOnce());
    vi.mocked(crypto.randomUUID).mockReturnValue("follow-up-operation");
    await updateOfflineStore("user-1", current => ({
      ...current,
      queue: [
        ...current.queue,
        updateOperation(local.localId, { description: "Latest" }),
      ],
      todos: current.todos.map(todo =>
        applyTodoUpdate(todo, { description: "Latest" }, false)),
    }));

    resolveCreate({ ...local, id: "server-id" });
    await sync;

    expect(remote.update).toHaveBeenCalledWith(
      "server-id",
      expect.objectContaining({ description: "Latest" }),
    );
    await expect(readOfflineStore("user-1")).resolves.toMatchObject({
      queue: [],
      todos: [{ description: "Latest", serverId: "server-id", syncStatus: "synced" }],
    });
  });
});
