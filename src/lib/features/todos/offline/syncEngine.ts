import type { AppDispatch } from "@/lib/store";
import type { AddTodo } from "@/types/Todo.type";
import { fromServerTodo, updateOperation } from "./mappers";
import {
  offlineStoreHydrated,
  syncFailed,
  syncStarted,
  syncStopped,
} from "./offlineSlice";
import { readOfflineStore, updateOfflineStore } from "./repository";
import type { TodoRemoteClient } from "./remote";
import type { QueuedOperation } from "./types";

const flights = new Map<string, Promise<void>>();
const generations = new Map<string, number>();
const RETRYABLE_CODES = new Set([
  "FETCH_ERROR",
  "GRAPHQL_PROXY_UNAVAILABLE",
  "INTERNAL_SERVER_ERROR",
  "TOO_MANY_REQUESTS",
]);

function errorCode(error: unknown) {
  if (!error || typeof error !== "object") return "UNKNOWN";
  return (error as { code?: string }).code ?? "UNKNOWN";
}

function retryable(error: unknown) {
  const code = errorCode(error);
  const status = (error as { status?: number | string })?.status;
  return RETRYABLE_CODES.has(code)
    || status === "FETCH_ERROR"
    || (typeof status === "number" && status >= 500);
}

function sleep(ms: number) {
  return new Promise(resolve => window.setTimeout(resolve, ms));
}

async function executeOperation(
  operation: QueuedOperation,
  remote: TodoRemoteClient,
) {
  if (operation.type === "CREATE") {
    const { done, ...createInput } = operation.input;
    let created = await remote.create(createInput satisfies AddTodo, operation.idempotencyKey);
    if (done) {
      created = await remote.update(created.id, { done: true });
    }
    return created;
  }
  if (operation.type === "UPDATE") {
    return operation;
  }
  await remote.delete(operation.serverId);
  return null;
}

async function processOperation(
  userId: string,
  operation: QueuedOperation,
  remote: TodoRemoteClient,
) {
  if (operation.type === "UPDATE") {
    const store = await readOfflineStore(userId);
    const todo = store.todos.find(candidate => candidate.localId === operation.localId);
    if (!todo?.serverId) {
      throw Object.assign(new Error("Todo has not been created remotely."), {
        code: "UNSYNCED_DEPENDENCY",
      });
    }
    return remote.update(todo.serverId, operation.input);
  }
  return executeOperation(operation, remote);
}

async function run(
  userId: string,
  remote: TodoRemoteClient,
  dispatch: AppDispatch,
  generation: number,
) {
  const cancelled = () => (generations.get(userId) ?? 0) !== generation;
  dispatch(syncStarted());

  try {
    while (true) {
      if (cancelled()) return;
      const store = await readOfflineStore(userId);
      if (store.localOnly || store.queue.length === 0) break;
      const operation = store.queue[0];
      let result: Awaited<ReturnType<typeof processOperation>> | undefined;
      let lastError: unknown;

      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          if (cancelled()) return;
          result = await processOperation(userId, operation, remote);
          if (cancelled()) return;
          lastError = undefined;
          break;
        } catch (error) {
          lastError = error;
          if (errorCode(error) === "UNAUTHENTICATED" || !retryable(error) || attempt === 2) {
            break;
          }
          await sleep(250 * (2 ** attempt));
        }
      }

      if (lastError) {
        if (cancelled()) return;
        const code = errorCode(lastError);
        const failed = await updateOfflineStore(userId, current => ({
          ...current,
          todos: current.todos.map(todo =>
            todo.localId === operation.localId
              ? { ...todo, syncStatus: "failed" as const }
              : todo),
        }));
        dispatch(offlineStoreHydrated(failed));
        dispatch(syncFailed(
          code === "UNAUTHENTICATED"
            ? "Sign in again to continue syncing todos."
            : "Some todo changes could not be synced. Retry when you are online.",
        ));
        return;
      }

      const updated = await updateOfflineStore(userId, current => {
        const queued = current.queue.find(candidate => candidate.id === operation.id);
        const operationUnchanged = JSON.stringify(queued) === JSON.stringify(operation);
        const serverTodo = result && "id" in result && "title" in result
          ? result
          : null;

        if (operation.type === "CREATE" && serverTodo && !queued) {
          return {
            ...current,
            lastSyncAt: new Date().toISOString(),
            queue: [
              ...current.queue,
              {
                createdAt: new Date().toISOString(),
                id: crypto.randomUUID(),
                localId: operation.localId,
                serverId: serverTodo.id,
                type: "DELETE" as const,
              },
            ],
          };
        }

        if (operation.type === "CREATE" && serverTodo && !operationUnchanged) {
          const localTodo = current.todos.find(todo => todo.localId === operation.localId);
          if (!localTodo) return current;
          return {
            ...current,
            lastSyncAt: new Date().toISOString(),
            queue: [
              ...current.queue.filter(candidate => candidate.id !== operation.id),
              updateOperation(operation.localId, {
                description: localTodo.description,
                done: localTodo.done,
                dueTo: localTodo.dueTo,
                reminderOn: localTodo.reminderOn,
                title: localTodo.title,
              }),
            ],
            todos: current.todos.map(todo =>
              todo.localId === operation.localId
                ? { ...todo, serverId: serverTodo.id, syncStatus: "pending" as const }
                : todo),
          };
        }

        if (!operationUnchanged) {
          return current;
        }

        return {
          ...current,
          lastSyncAt: new Date().toISOString(),
          queue: current.queue.filter(candidate => candidate.id !== operation.id),
          todos: operation.type === "DELETE"
            ? current.todos.filter(todo => todo.localId !== operation.localId)
            : current.todos.map(todo =>
              todo.localId === operation.localId && serverTodo
                ? { ...fromServerTodo(serverTodo), localId: todo.localId }
                : todo),
        };
      });
      if (cancelled()) return;
      dispatch(offlineStoreHydrated(updated));
    }
  } finally {
    if (!cancelled()) dispatch(syncStopped());
  }
}

export function runTodoSync(
  userId: string,
  remote: TodoRemoteClient,
  dispatch: AppDispatch,
) {
  const existing = flights.get(userId);
  if (existing) return existing;

  const generation = generations.get(userId) ?? 0;
  const flight = run(userId, remote, dispatch, generation).finally(() => {
    flights.delete(userId);
  });
  flights.set(userId, flight);
  return flight;
}

export function cancelTodoSync(userId: string) {
  generations.set(userId, (generations.get(userId) ?? 0) + 1);
  flights.delete(userId);
}

export function cancelAllTodoSync() {
  for (const userId of flights.keys()) {
    cancelTodoSync(userId);
  }
}
