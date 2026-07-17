import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { LocalTodoRecord, OfflineTodosState, UserOfflineStore } from "./types";

const initialState: OfflineTodosState = {
  error: null,
  hydrated: false,
  isOnline: true,
  isSyncing: false,
  lastSyncAt: null,
  localOnly: false,
  pendingCount: 0,
  todos: [],
  userId: null,
};

function pendingCount(store: Pick<UserOfflineStore, "queue">) {
  return store.queue.length;
}

export const offlineTodosSlice = createSlice({
  initialState,
  name: "offlineTodos",
  reducers: {
    connectivityChanged: (state, { payload }: PayloadAction<boolean>) => {
      state.isOnline = payload;
    },
    offlineStoreHydrated: (state, { payload }: PayloadAction<UserOfflineStore>) => {
      state.error = null;
      state.hydrated = true;
      state.lastSyncAt = payload.lastSyncAt;
      state.localOnly = payload.localOnly;
      state.pendingCount = pendingCount(payload);
      state.todos = payload.todos;
      state.userId = payload.userId;
    },
    offlineStoreReset: state => ({
      ...initialState,
      isOnline: state.isOnline,
    }),
    syncFailed: (state, { payload }: PayloadAction<string>) => {
      state.error = payload;
      state.isSyncing = false;
    },
    syncStarted: state => {
      state.error = null;
      state.isSyncing = true;
    },
    syncStopped: state => {
      state.isSyncing = false;
    },
    todosReplaced: (state, { payload }: PayloadAction<{
      pendingCount: number;
      todos: LocalTodoRecord[];
    }>) => {
      state.pendingCount = payload.pendingCount;
      state.todos = payload.todos;
    },
  },
});

export const {
  connectivityChanged,
  offlineStoreHydrated,
  offlineStoreReset,
  syncFailed,
  syncStarted,
  syncStopped,
  todosReplaced,
} = offlineTodosSlice.actions;

export default offlineTodosSlice.reducer;
