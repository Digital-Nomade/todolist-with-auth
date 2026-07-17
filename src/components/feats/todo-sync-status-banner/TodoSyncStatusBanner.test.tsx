import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TodoSyncStatusBanner } from "./TodoSyncStatusBanner";

const mocks = vi.hoisted(() => ({
  settings: {
    error: null as string | null,
    isOnline: true,
    isSyncing: false,
    localOnly: false,
    pendingCount: 0,
    retrySync: vi.fn(),
  },
}));

vi.mock("@/lib/features/todos/offline/hooks", () => ({
  useOfflineTodoSettings: () => mocks.settings,
}));

describe("TodoSyncStatusBanner", () => {
  afterEach(() => {
    cleanup();
    Object.assign(mocks.settings, {
      error: null,
      isOnline: true,
      isSyncing: false,
      localOnly: false,
      pendingCount: 0,
    });
  });

  it("shows local-only status", () => {
    mocks.settings.localOnly = true;
    render(<TodoSyncStatusBanner />);
    expect(screen.getByTestId("todo-sync-status-banner")).toHaveTextContent(
      "Local only — todos stay on this device",
    );
  });

  it("shows offline pending changes", () => {
    mocks.settings.isOnline = false;
    mocks.settings.pendingCount = 2;
    render(<TodoSyncStatusBanner />);
    expect(screen.getByTestId("todo-sync-status-banner")).toHaveTextContent(
      "Offline — 2 changes will sync when you reconnect.",
    );
  });
});
