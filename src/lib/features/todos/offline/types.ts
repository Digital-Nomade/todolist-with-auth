import type { AddTodo, Todo, UpdateTodo } from "@/types/Todo.type";

export type TodoSyncStatus = "synced" | "pending" | "local_only" | "failed";

export interface LocalTodoRecord extends Omit<Todo, "id"> {
  localId: string;
  serverId: string | null;
  syncStatus: TodoSyncStatus;
}

interface QueueOperationBase {
  createdAt: string;
  id: string;
  localId: string;
}

export interface QueuedCreateOperation extends QueueOperationBase {
  idempotencyKey: string;
  input: AddTodo & { done?: boolean };
  type: "CREATE";
}

export interface QueuedUpdateOperation extends QueueOperationBase {
  input: UpdateTodo["input"];
  type: "UPDATE";
}

export interface QueuedDeleteOperation extends QueueOperationBase {
  serverId: string;
  type: "DELETE";
}

export type QueuedOperation =
  | QueuedCreateOperation
  | QueuedDeleteOperation
  | QueuedUpdateOperation;

export interface UserOfflineStore {
  baselineSnapshot: LocalTodoRecord[] | null;
  lastSyncAt: string | null;
  localOnly: boolean;
  queue: QueuedOperation[];
  todos: LocalTodoRecord[];
  userId: string;
  version: 1;
}

export interface OfflineTodosState {
  error: string | null;
  hydrated: boolean;
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncAt: string | null;
  localOnly: boolean;
  pendingCount: number;
  todos: LocalTodoRecord[];
  userId: string | null;
}
