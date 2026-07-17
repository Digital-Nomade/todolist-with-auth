import { createHash, randomUUID } from "node:crypto";
import type { TodoRecord } from "./test-data";

export interface MockMigrationState {
  checksum: string;
  committedAt: string | null;
  expiresAt: string;
  migrationId: string;
  todos: TodoRecord[];
}

export function computeMigrationChecksum(
  todos: Pick<TodoRecord, "id" | "updatedAt">[],
) {
  const payload = [...todos]
    .sort((left, right) => left.id.localeCompare(right.id))
    .map(todo => `${todo.id}:${todo.updatedAt}`)
    .join("|");
  return createHash("sha256").update(payload).digest("hex");
}

export function createMockMigration(todos: TodoRecord[]): MockMigrationState {
  const snapshot = todos.map(todo => ({ ...todo }));
  return {
    checksum: computeMigrationChecksum(snapshot),
    committedAt: null,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    migrationId: randomUUID(),
    todos: snapshot,
  };
}
