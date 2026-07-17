"use client";

import { useOfflineTodoSettings } from "@/lib/features/todos/offline/hooks";

function pendingLabel(count: number) {
  return `${count} change${count === 1 ? "" : "s"}`;
}

export function TodoSyncStatusBanner() {
  const {
    error,
    isOnline,
    isSyncing,
    localOnly,
    pendingCount,
    retrySync,
  } = useOfflineTodoSettings();

  let message: string | null = null;
  if (localOnly) {
    message = "Local only — todos stay on this device until you turn local-only mode off.";
  } else if (!isOnline && pendingCount > 0) {
    message = `Offline — ${pendingLabel(pendingCount)} will sync when you reconnect.`;
  } else if (isSyncing) {
    message = "Syncing changes in the background…";
  } else if (error) {
    message = error;
  } else if (pendingCount > 0) {
    message = `${pendingLabel(pendingCount)} pending sync.`;
  }

  if (!message) return null;

  return (
    <aside
      aria-live="polite"
      data-testid="todo-sync-status-banner"
      className="flex items-center justify-center gap-4 bg-primary-dark px-4 py-2 text-center text-danger-light"
    >
      <span>{message}</span>
      {error && retrySync && (
        <button type="button" className="underline" onClick={retrySync}>
          Retry
        </button>
      )}
    </aside>
  );
}
