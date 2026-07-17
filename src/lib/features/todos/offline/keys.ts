export const OFFLINE_TODOS_VERSION = 1 as const;
export const OFFLINE_TODOS_KEY_PREFIX = "offline.todos.v1:";

export function offlineTodosKey(userId: string) {
  return `${OFFLINE_TODOS_KEY_PREFIX}${userId}`;
}
