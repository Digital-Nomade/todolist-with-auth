import type { AddTodo, Todo, UpdateTodo } from "@/types/Todo.type";
import type {
  LocalTodoRecord,
  QueuedCreateOperation,
  QueuedOperation,
  UserOfflineStore,
} from "./types";

function operationId() {
  return crypto.randomUUID();
}

function now() {
  return new Date().toISOString();
}

export function createEmptyStore(userId: string): UserOfflineStore {
  return {
    baselineSnapshot: null,
    lastSyncAt: null,
    localOnly: false,
    queue: [],
    todos: [],
    userId,
    version: 1,
  };
}

export function fromServerTodo(todo: Todo): LocalTodoRecord {
  return {
    createdAt: todo.createdAt,
    description: todo.description,
    done: todo.done,
    dueTo: todo.dueTo,
    localId: todo.id,
    reminderOn: todo.reminderOn,
    serverId: todo.id,
    syncStatus: "synced",
    title: todo.title,
    updatedAt: todo.updatedAt,
  };
}

export function toTodo(todo: LocalTodoRecord): Todo {
  return {
    createdAt: todo.createdAt,
    description: todo.description,
    done: todo.done,
    dueTo: todo.dueTo,
    id: todo.localId,
    reminderOn: todo.reminderOn,
    title: todo.title,
    updatedAt: todo.updatedAt,
  };
}

export function localCreate(input: AddTodo, localOnly: boolean): LocalTodoRecord {
  const timestamp = now();
  return {
    ...input,
    createdAt: timestamp,
    done: false,
    dueTo: input.dueTo ?? null,
    localId: crypto.randomUUID(),
    reminderOn: input.reminderOn ?? null,
    serverId: null,
    syncStatus: localOnly ? "local_only" : "pending",
    updatedAt: timestamp,
  };
}

export function applyTodoUpdate(
  todo: LocalTodoRecord,
  input: UpdateTodo["input"],
  localOnly: boolean,
): LocalTodoRecord {
  return {
    ...todo,
    description: input.description ?? todo.description,
    done: input.done ?? todo.done,
    dueTo: input.dueTo === undefined ? todo.dueTo : input.dueTo,
    reminderOn: input.reminderOn === undefined ? todo.reminderOn : input.reminderOn,
    syncStatus: localOnly ? "local_only" : "pending",
    title: input.title ?? todo.title,
    updatedAt: now(),
  };
}

export function createOperation(todo: LocalTodoRecord): QueuedCreateOperation {
  return {
    createdAt: now(),
    id: operationId(),
    idempotencyKey: crypto.randomUUID(),
    input: {
      description: todo.description,
      dueTo: todo.dueTo,
      reminderOn: todo.reminderOn,
      title: todo.title,
    },
    localId: todo.localId,
    type: "CREATE",
  };
}

export function updateOperation(
  localId: string,
  input: UpdateTodo["input"],
): QueuedOperation {
  return {
    createdAt: now(),
    id: operationId(),
    input,
    localId,
    type: "UPDATE",
  };
}

export function deleteOperation(todo: LocalTodoRecord): QueuedOperation | null {
  if (!todo.serverId) return null;
  return {
    createdAt: now(),
    id: operationId(),
    localId: todo.localId,
    serverId: todo.serverId,
    type: "DELETE",
  };
}

export function compactQueue(queue: QueuedOperation[]): QueuedOperation[] {
  const compacted: QueuedOperation[] = [];

  for (const operation of queue) {
    const createIndex = compacted.findIndex(
      candidate => candidate.localId === operation.localId && candidate.type === "CREATE",
    );
    const updateIndex = compacted.findIndex(
      candidate => candidate.localId === operation.localId && candidate.type === "UPDATE",
    );

    if (operation.type === "CREATE") {
      compacted.push(operation);
      continue;
    }

    if (operation.type === "UPDATE") {
      if (createIndex >= 0) {
        const create = compacted[createIndex];
        if (create.type === "CREATE") {
          const normalizedInput = {
            ...(typeof operation.input.description === "string"
              ? { description: operation.input.description }
              : {}),
            ...(typeof operation.input.done === "boolean"
              ? { done: operation.input.done }
              : {}),
            ...(operation.input.dueTo !== undefined
              ? { dueTo: operation.input.dueTo }
              : {}),
            ...(operation.input.reminderOn !== undefined
              ? { reminderOn: operation.input.reminderOn }
              : {}),
            ...(typeof operation.input.title === "string"
              ? { title: operation.input.title }
              : {}),
          };
          compacted[createIndex] = {
            ...create,
            input: { ...create.input, ...normalizedInput },
          };
        }
      } else if (updateIndex >= 0) {
        const update = compacted[updateIndex];
        if (update.type === "UPDATE") {
          compacted[updateIndex] = {
            ...update,
            input: { ...update.input, ...operation.input },
          };
        }
      } else {
        compacted.push(operation);
      }
      continue;
    }

    if (createIndex >= 0) {
      const withoutCreatedTodo = compacted.filter(
        candidate => candidate.localId !== operation.localId,
      );
      compacted.length = 0;
      compacted.push(...withoutCreatedTodo);
      continue;
    }

    const withoutOlderChanges = compacted.filter(
      candidate => candidate.localId !== operation.localId,
    );
    compacted.length = 0;
    compacted.push(...withoutOlderChanges, operation);
  }

  return compacted;
}

function comparable(todo: LocalTodoRecord) {
  return {
    description: todo.description,
    done: todo.done,
    dueTo: todo.dueTo,
    reminderOn: todo.reminderOn,
    title: todo.title,
  };
}

export function deriveQueueFromBaseline(
  baseline: LocalTodoRecord[],
  current: LocalTodoRecord[],
): QueuedOperation[] {
  const baselineByServerId = new Map(
    baseline.filter(todo => todo.serverId).map(todo => [todo.serverId, todo]),
  );
  const currentByServerId = new Map(
    current.filter(todo => todo.serverId).map(todo => [todo.serverId, todo]),
  );
  const queue: QueuedOperation[] = [];

  for (const todo of current) {
    if (!todo.serverId) {
      queue.push(createOperation(todo));
      continue;
    }

    const original = baselineByServerId.get(todo.serverId);
    if (original && JSON.stringify(comparable(original)) !== JSON.stringify(comparable(todo))) {
      queue.push(updateOperation(todo.localId, comparable(todo)));
    }
  }

  for (const todo of baseline) {
    if (todo.serverId && !currentByServerId.has(todo.serverId)) {
      const operation = deleteOperation(todo);
      if (operation) queue.push(operation);
    }
  }

  return compactQueue(queue);
}
