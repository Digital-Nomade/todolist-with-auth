import type { AppDispatch } from "@/lib/store";
import type { AddTodo, Todo, UpdateTodo } from "@/types/Todo.type";
import {
  applyTodoUpdate,
  createOperation,
  deleteOperation,
  deriveQueueFromBaseline,
  fromServerTodo,
  localCreate,
  updateOperation,
} from "./mappers";
import {
  computeMigrationChecksum,
  createPreparedJournal,
  finalizeLocalOnlyStore,
  hasPendingMigrationCommit,
  isMigrationExpiredError,
  isMigrationNotFoundError,
  migrationTodosToLocal,
} from "./migration";
import { offlineStoreHydrated } from "./offlineSlice";
import { readOfflineStore, updateOfflineStore } from "./repository";
import type { TodoRemoteClient } from "./remote";
import { runTodoSync } from "./syncEngine";
import type { LocalOnlyMigrationJournal, LocalTodoRecord, UserOfflineStore } from "./types";

function online() {
  return typeof navigator === "undefined" || navigator.onLine;
}

export function isRetryableTodoError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const { code, status } = error as { code?: string; status?: number | string };
  return status === "FETCH_ERROR"
    || (typeof status === "number" && status >= 500)
    || code === "FETCH_ERROR"
    || code === "GRAPHQL_PROXY_UNAVAILABLE"
    || code === "INTERNAL_SERVER_ERROR"
    || code === "TOO_MANY_REQUESTS";
}

function mirrorServerTodos(
  store: UserOfflineStore,
  serverTodos: Todo[],
  preserveAfter?: number,
): UserOfflineStore {
  const pending = store.todos.filter(todo => todo.syncStatus !== "synced");
  const recentSynced = preserveAfter
    ? store.todos.filter(todo =>
      todo.syncStatus === "synced" && Date.parse(todo.updatedAt) >= preserveAfter)
    : [];
  const pendingServerIds = new Set(pending.map(todo => todo.serverId).filter(Boolean));
  const preservedServerIds = new Set(
    recentSynced.map(todo => todo.serverId).filter(Boolean),
  );
  const deletedServerIds = new Set(
    store.queue
      .filter(operation => operation.type === "DELETE")
      .map(operation => operation.serverId),
  );
  return {
    ...store,
    todos: [
      ...pending,
      ...recentSynced,
      ...serverTodos
        .filter(todo =>
          !pendingServerIds.has(todo.id)
          && !preservedServerIds.has(todo.id)
          && !deletedServerIds.has(todo.id))
        .map(fromServerTodo),
    ],
  };
}

async function persist(
  userId: string,
  dispatch: AppDispatch,
  update: (store: UserOfflineStore) => UserOfflineStore,
) {
  const store = await updateOfflineStore(userId, update);
  dispatch(offlineStoreHydrated(store));
  return store;
}

async function commitPreparedMigration(
  userId: string,
  dispatch: AppDispatch,
  remote: TodoRemoteClient,
  journal: LocalOnlyMigrationJournal,
) {
  await persist(userId, dispatch, current => ({
    ...current,
    migrationJournal: {
      ...journal,
      status: "committing",
    },
  }));

  await remote.commitLocalOnlyMigration(journal.migrationId);

  return persist(userId, dispatch, current =>
    finalizeLocalOnlyStore(current, journal.snapshot));
}

async function abandonPreparedMigration(
  userId: string,
  dispatch: AppDispatch,
  remote: TodoRemoteClient,
  migrationId: string,
) {
  await remote.cancelLocalOnlyMigration(migrationId).catch(() => undefined);
  return persist(userId, dispatch, current => ({
    ...current,
    migrationJournal: null,
  }));
}

async function resumePendingMigration(
  userId: string,
  dispatch: AppDispatch,
  remote: TodoRemoteClient,
  store: UserOfflineStore,
) {
  const journal = store.migrationJournal;
  if (!journal || !hasPendingMigrationCommit(journal)) return store;

  try {
    return await commitPreparedMigration(userId, dispatch, remote, journal);
  } catch (error) {
    if (isMigrationExpiredError(error) || isMigrationNotFoundError(error)) {
      return abandonPreparedMigration(
        userId,
        dispatch,
        remote,
        journal.migrationId,
      );
    }

    throw error;
  }
}

export function createTodoService(
  userId: string,
  dispatch: AppDispatch,
  remote: TodoRemoteClient,
) {
  const sync = () => {
    if (online()) void runTodoSync(userId, remote, dispatch);
  };

  return {
    async initialize() {
      const stored = await readOfflineStore(userId);
      dispatch(offlineStoreHydrated(stored));

      if (hasPendingMigrationCommit(stored.migrationJournal) && online()) {
        await resumePendingMigration(userId, dispatch, remote, stored);
        return;
      }

      if (!stored.localOnly && online()) {
        const fetchStartedAt = Date.now();
        try {
          const serverTodos = await remote.listAll();
          const mirrored = await persist(
            userId,
            dispatch,
            current => mirrorServerTodos(current, serverTodos, fetchStartedAt),
          );
          if (mirrored.queue.length) sync();
        } catch {
          sync();
        }
      }
    },

    async refresh() {
      const store = await readOfflineStore(userId);
      if (store.localOnly || !online()) return store;
      const serverTodos = await remote.listAll();
      return persist(
        userId,
        dispatch,
        current => mirrorServerTodos(current, serverTodos),
      );
    },

    async create(input: AddTodo) {
      const store = await readOfflineStore(userId);
      const local = localCreate(input, store.localOnly);

      if (!store.localOnly && online()) {
        const operation = createOperation(local);
        try {
          const created = await remote.create(input, operation.idempotencyKey);
          await persist(userId, dispatch, current => ({
            ...current,
            todos: [
              {
                ...fromServerTodo(created),
                localId: local.localId,
              },
              ...current.todos,
            ],
          }));
          return local.localId;
        } catch (error) {
          if (!isRetryableTodoError(error)) throw error;
          await persist(userId, dispatch, current => ({
            ...current,
            queue: [...current.queue, operation],
            todos: [{ ...local, syncStatus: "pending" }, ...current.todos],
          }));
          sync();
          return local.localId;
        }
      }

      await persist(userId, dispatch, current => ({
        ...current,
        queue: current.localOnly
          ? current.queue
          : [...current.queue, createOperation(local)],
        todos: [local, ...current.todos],
      }));
      sync();
      return local.localId;
    },

    async update(localId: string, input: UpdateTodo["input"]) {
      const store = await readOfflineStore(userId);
      const todo = store.todos.find(candidate => candidate.localId === localId);
      if (!todo) throw new Error("Todo not found.");

      const hasQueuedChange = store.queue.some(
        operation => operation.localId === localId,
      );
      if (!store.localOnly && online() && todo.serverId && !hasQueuedChange) {
        try {
          const updated = await remote.update(todo.serverId, input);
          await persist(userId, dispatch, current => ({
            ...current,
            todos: current.todos.map(candidate =>
              candidate.localId === localId
                ? { ...fromServerTodo(updated), localId }
                : candidate),
          }));
          return;
        } catch (error) {
          if (!isRetryableTodoError(error)) throw error;
        }
      }

      await persist(userId, dispatch, current => ({
        ...current,
        queue: current.localOnly
          ? current.queue
          : [...current.queue, updateOperation(localId, input)],
        todos: current.todos.map(candidate =>
          candidate.localId === localId
            ? applyTodoUpdate(candidate, input, current.localOnly)
            : candidate),
      }));
      sync();
    },

    async delete(localId: string) {
      const store = await readOfflineStore(userId);
      const todo = store.todos.find(candidate => candidate.localId === localId);
      if (!todo) return;

      const hasQueuedChange = store.queue.some(
        operation => operation.localId === localId,
      );
      if (!store.localOnly && online() && todo.serverId && !hasQueuedChange) {
        try {
          await remote.delete(todo.serverId);
          await persist(userId, dispatch, current => ({
            ...current,
            todos: current.todos.filter(candidate => candidate.localId !== localId),
          }));
          return;
        } catch (error) {
          if (!isRetryableTodoError(error)) throw error;
        }
      }

      await persist(userId, dispatch, current => {
        const operation = deleteOperation(todo);
        return {
          ...current,
          queue: current.localOnly
            ? current.queue
            : operation
              ? [...current.queue, operation]
              : current.queue.filter(candidate => candidate.localId !== localId),
          todos: current.todos.filter(candidate => candidate.localId !== localId),
        };
      });
      sync();
    },

    async enableLocalOnly() {
      if (!online()) {
        throw new Error("Connect to the internet before enabling local-only mode.");
      }
      const currentStore = await readOfflineStore(userId);
      if (currentStore.queue.length > 0) {
        throw new Error(
          "Wait for pending todo changes to sync before enabling local-only mode.",
        );
      }
      if (hasPendingMigrationCommit(currentStore.migrationJournal)) {
        return resumePendingMigration(userId, dispatch, remote, currentStore);
      }

      let preparedMigrationId: string | null = null;
      let journalPersisted = false;

      try {
        const prepared = await remote.prepareLocalOnlyMigration();
        preparedMigrationId = prepared.migrationId;
        const checksum = await computeMigrationChecksum(prepared.todos);
        if (checksum !== prepared.checksum) {
          throw new Error("Migration snapshot checksum mismatch.");
        }

        const snapshot = migrationTodosToLocal(prepared.todos);
        const journal = createPreparedJournal(prepared, snapshot);
        await persist(userId, dispatch, current => ({
          ...current,
          migrationJournal: journal,
        }));
        journalPersisted = true;

        return commitPreparedMigration(userId, dispatch, remote, journal);
      } catch (error) {
        if (preparedMigrationId && !journalPersisted) {
          await remote.cancelLocalOnlyMigration(preparedMigrationId).catch(() => undefined);
        }
        throw error;
      }
    },

    async disableLocalOnly() {
      const updated = await persist(userId, dispatch, current => {
        const queue = deriveQueueFromBaseline(
          current.baselineSnapshot ?? [],
          current.todos,
        );
        return {
          ...current,
          baselineSnapshot: null,
          localOnly: false,
          queue,
          todos: current.todos.map((todo): LocalTodoRecord => ({
            ...todo,
            syncStatus: queue.some(operation => operation.localId === todo.localId)
              ? "pending"
              : "synced",
          })),
        };
      });
      sync();
      return updated;
    },

    sync,
  };
}
