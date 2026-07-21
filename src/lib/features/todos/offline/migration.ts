import type { Todo } from "@/types/Todo.type";
import { fromServerTodo } from "./mappers";
import type { LocalOnlyMigrationJournal, LocalTodoRecord, UserOfflineStore } from "./types";

function normalizedChecksumPayload(todos: Pick<Todo, "id" | "updatedAt">[]) {
  return [...todos]
    .sort((left, right) => left.id.localeCompare(right.id))
    .map(todo => `${todo.id}:${todo.updatedAt}`)
    .join("|");
}

export async function computeMigrationChecksum(
  todos: Pick<Todo, "id" | "updatedAt">[],
) {
  const payload = normalizedChecksumPayload(todos);
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(payload),
  );
  return Array.from(new Uint8Array(digest))
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function migrationTodosToLocal(todos: Todo[]): LocalTodoRecord[] {
  return todos.map(todo => ({
    ...fromServerTodo(todo),
    localId: todo.id,
  }));
}

export function finalizeLocalOnlyStore(
  store: UserOfflineStore,
  snapshot: LocalTodoRecord[],
): UserOfflineStore {
  return {
    ...store,
    baselineSnapshot: [],
    localOnly: true,
    migrationJournal: null,
    queue: [],
    todos: snapshot.map(todo => ({
      ...todo,
      localId: todo.localId,
      serverId: null,
      syncStatus: "local_only",
    })),
  };
}

export function createPreparedJournal(
  migration: {
    checksum: string;
    expiresAt: string;
    migrationId: string;
    todoCount: number;
    todos: Todo[];
  },
  snapshot: LocalTodoRecord[],
): LocalOnlyMigrationJournal {
  return {
    checksum: migration.checksum,
    committedAt: null,
    expiresAt: migration.expiresAt,
    migrationId: migration.migrationId,
    preparedAt: new Date().toISOString(),
    snapshot,
    status: "prepared",
    todoCount: migration.todoCount,
  };
}

export function hasPendingMigrationCommit(journal: LocalOnlyMigrationJournal | null) {
  return journal?.status === "prepared" || journal?.status === "committing";
}

export function getMigrationErrorCode(error: unknown) {
  const apiError = error as {
    code?: string;
    data?: { code?: string };
    error?: { code?: string };
    errors?: Array<{ extensions?: { code?: string } }>;
  };

  return apiError.code
    ?? apiError.data?.code
    ?? apiError.error?.code
    ?? apiError.errors?.[0]?.extensions?.code;
}

export function isMigrationExpiredError(error: unknown) {
  return getMigrationErrorCode(error) === "MIGRATION_EXPIRED";
}

export function isMigrationNotFoundError(error: unknown) {
  return getMigrationErrorCode(error) === "MIGRATION_NOT_FOUND";
}
