import { describe, expect, it } from "vitest";
import type { Todo } from "@/types/Todo.type";
import {
  computeMigrationChecksum,
  createPreparedJournal,
  finalizeLocalOnlyStore,
  getMigrationErrorCode,
  isMigrationExpiredError,
  migrationTodosToLocal,
} from "./migration";
import { createEmptyStore } from "./mappers";

const todo: Todo = {
  createdAt: "2026-07-01T00:00:00.000Z",
  description: "One",
  done: false,
  dueTo: null,
  id: "550e8400-e29b-41d4-a716-446655440002",
  reminderOn: null,
  title: "Second",
  updatedAt: "2026-07-01T00:00:00.000Z",
};

describe("local-only migration helpers", () => {
  it("computes a stable checksum regardless of todo order", async () => {
    const first = {
      ...todo,
      id: "550e8400-e29b-41d4-a716-446655440001",
      updatedAt: "2026-07-01T00:00:00.000Z",
    };
    const second = todo;

    await expect(computeMigrationChecksum([second, first])).resolves.toBe(
      await computeMigrationChecksum([first, second]),
    );
  });

  it("finalizes local-only storage with empty baseline and cleared server ids", () => {
    const store = createEmptyStore("user-1");
    const snapshot = migrationTodosToLocal([todo]);
    const finalized = finalizeLocalOnlyStore(store, snapshot);

    expect(finalized.localOnly).toBe(true);
    expect(finalized.baselineSnapshot).toEqual([]);
    expect(finalized.migrationJournal).toBeNull();
    expect(finalized.todos[0]).toMatchObject({
      localId: todo.id,
      serverId: null,
      syncStatus: "local_only",
    });
  });

  it("creates a prepared journal from a migration payload", () => {
    const snapshot = migrationTodosToLocal([todo]);
    const journal = createPreparedJournal({
      checksum: "checksum",
      expiresAt: "2026-07-02T00:00:00.000Z",
      migrationId: "migration-1",
      todoCount: 1,
      todos: [todo],
    }, snapshot);

    expect(journal).toMatchObject({
      migrationId: "migration-1",
      snapshot,
      status: "prepared",
      todoCount: 1,
    });
  });

  it("reads migration error codes from GraphQL error shapes", () => {
    expect(getMigrationErrorCode({ data: { code: "MIGRATION_EXPIRED" } }))
      .toBe("MIGRATION_EXPIRED");
    expect(isMigrationExpiredError({
      errors: [{ extensions: { code: "MIGRATION_EXPIRED" } }],
    })).toBe(true);
  });
});
