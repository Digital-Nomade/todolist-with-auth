import { offlineTodosKey } from "./keys";
import { compactQueue, createEmptyStore } from "./mappers";
import type { UserOfflineStore } from "./types";

const writeChains = new Map<string, Promise<unknown>>();

function storageAvailable() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function isStore(value: unknown, userId: string): value is UserOfflineStore {
  if (!value || typeof value !== "object") return false;
  const store = value as Partial<UserOfflineStore>;
  const version = store.version ?? 1;
  return (version === 1 || version === 2)
    && store.userId === userId
    && typeof store.localOnly === "boolean"
    && Array.isArray(store.todos)
    && Array.isArray(store.queue)
    && (store.baselineSnapshot === null || Array.isArray(store.baselineSnapshot))
    && (store.lastSyncAt === null || typeof store.lastSyncAt === "string")
    && (store.migrationJournal === undefined
      || store.migrationJournal === null
      || typeof store.migrationJournal === "object");
}

function normalizeStore(store: UserOfflineStore): UserOfflineStore {
  return {
    ...store,
    migrationJournal: store.migrationJournal ?? null,
    queue: compactQueue(store.queue),
    version: 2,
  };
}

function readUnserialized(userId: string): UserOfflineStore {
  if (!storageAvailable()) return createEmptyStore(userId);

  const raw = localStorage.getItem(offlineTodosKey(userId));
  if (!raw) return createEmptyStore(userId);

  try {
    const parsed: unknown = JSON.parse(raw);
    return isStore(parsed, userId)
      ? normalizeStore(parsed)
      : createEmptyStore(userId);
  } catch {
    return createEmptyStore(userId);
  }
}

function writeUnserialized(store: UserOfflineStore) {
  if (!storageAvailable()) return;
  localStorage.setItem(offlineTodosKey(store.userId), JSON.stringify(store));
}

function serialize<T>(userId: string, task: () => T | Promise<T>): Promise<T> {
  const previous = writeChains.get(userId) ?? Promise.resolve();
  const next = previous.catch(() => undefined).then(task);
  writeChains.set(userId, next);
  return next.finally(() => {
    if (writeChains.get(userId) === next) {
      writeChains.delete(userId);
    }
  });
}

export async function readOfflineStore(userId: string) {
  const pending = writeChains.get(userId);
  if (pending) await pending.catch(() => undefined);
  return readUnserialized(userId);
}

export async function writeOfflineStore(store: UserOfflineStore) {
  return serialize(store.userId, () => {
    const normalized = { ...store, queue: compactQueue(store.queue) };
    writeUnserialized(normalized);
    return normalized;
  });
}

export async function updateOfflineStore(
  userId: string,
  update: (store: UserOfflineStore) => UserOfflineStore,
) {
  return serialize(userId, () => {
    const next = update(readUnserialized(userId));
    const normalized = {
      ...next,
      migrationJournal: next.migrationJournal ?? null,
      queue: compactQueue(next.queue),
      userId,
      version: 2 as const,
    };
    writeUnserialized(normalized);
    return normalized;
  });
}

export function removeOfflineStore(userId: string) {
  if (!storageAvailable()) return;
  localStorage.removeItem(offlineTodosKey(userId));
}
