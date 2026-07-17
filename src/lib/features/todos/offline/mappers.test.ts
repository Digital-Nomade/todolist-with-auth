import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LocalTodoRecord, QueuedOperation } from "./types";
import {
  compactQueue,
  createOperation,
  deriveQueueFromBaseline,
  updateOperation,
} from "./mappers";

const todo: LocalTodoRecord = {
  createdAt: "2026-07-01T00:00:00.000Z",
  description: "Original",
  done: false,
  dueTo: null,
  localId: "local-1",
  reminderOn: null,
  serverId: "server-1",
  syncStatus: "synced",
  title: "Todo",
  updatedAt: "2026-07-01T00:00:00.000Z",
};

describe("offline todo mappers", () => {
  beforeEach(() => {
    vi.stubGlobal("crypto", { randomUUID: vi.fn(() => "generated-id") });
  });

  it("folds repeated updates into a queued create", () => {
    const pending = { ...todo, dueTo: "2026-08-01T00:00:00.000Z", serverId: null };
    const create = createOperation(pending);
    const queue = compactQueue([
      create,
      updateOperation(todo.localId, { title: "Updated" }),
      updateOperation(todo.localId, { done: true, dueTo: null }),
    ]);

    expect(queue).toHaveLength(1);
    expect(queue[0]).toMatchObject({
      input: { done: true, dueTo: null, title: "Updated" },
      type: "CREATE",
    });
  });

  it("drops a create followed by delete", () => {
    const create = createOperation({ ...todo, serverId: null });
    const remove: QueuedOperation = {
      createdAt: "2026-07-01T00:00:01.000Z",
      id: "delete-1",
      localId: todo.localId,
      serverId: "temporary",
      type: "DELETE",
    };

    expect(compactQueue([create, remove])).toEqual([]);
  });

  it("derives create, update, and delete operations from a baseline", () => {
    const changed = { ...todo, description: "Changed" };
    const deleted = { ...todo, localId: "local-2", serverId: "server-2" };
    const created = { ...todo, localId: "local-3", serverId: null };

    const queue = deriveQueueFromBaseline(
      [todo, deleted],
      [changed, created],
    );

    expect(queue.map(operation => operation.type).sort()).toEqual([
      "CREATE",
      "DELETE",
      "UPDATE",
    ]);
  });
});
