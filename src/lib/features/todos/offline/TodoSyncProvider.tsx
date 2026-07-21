"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { connectivityChanged, offlineStoreReset } from "./offlineSlice";
import { createTodoRemoteClient } from "./remote";
import { createTodoService } from "./todoService";
import { cancelTodoSync } from "./syncEngine";
import { subscribeToTodoChanges } from "../todoSubscription";
import { todoApi } from "../todoApi";
import type { AppDispatch } from "@/lib/store";

const invalidateTodoListCache = (dispatch: AppDispatch) => {
  dispatch(todoApi.util.invalidateTags([{ type: "todos", id: "LIST" }]));
};

export function TodoSyncProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const { hydrated, isOnline, localOnly } = useAppSelector(state => state.offlineTodos);
  const activeUserId = user?.status === "ACTIVE" ? user.id : null;
  const previousUserId = useRef<string | null>(null);
  const service = useMemo(
    () => activeUserId
      ? createTodoService(activeUserId, dispatch, createTodoRemoteClient(dispatch))
      : null,
    [activeUserId, dispatch],
  );

  useEffect(() => {
    if (previousUserId.current !== activeUserId) {
      if (previousUserId.current) cancelTodoSync(previousUserId.current);
      dispatch(offlineStoreReset());
      previousUserId.current = activeUserId;
    }
    if (service) void service.initialize();
  }, [activeUserId, dispatch, service]);

  useEffect(() => {
    const updateConnectivity = () => {
      dispatch(connectivityChanged(navigator.onLine));
    };
    const reconcileWhenOnline = () => {
      updateConnectivity();
      service?.sync();
      void service?.refresh().catch(() => undefined);
    };
    const syncWhenActive = () => {
      if (document.visibilityState === "visible") service?.sync();
    };
    const syncOnFocus = () => service?.sync();

    updateConnectivity();
    window.addEventListener("online", reconcileWhenOnline);
    window.addEventListener("offline", updateConnectivity);
    window.addEventListener("focus", syncOnFocus);
    document.addEventListener("visibilitychange", syncWhenActive);

    return () => {
      window.removeEventListener("online", reconcileWhenOnline);
      window.removeEventListener("offline", updateConnectivity);
      window.removeEventListener("focus", syncOnFocus);
      document.removeEventListener("visibilitychange", syncWhenActive);
    };
  }, [dispatch, service]);

  useEffect(() => {
    if (!service || !hydrated || localOnly || !isOnline) return;

    let refreshTimer: ReturnType<typeof setTimeout> | null = null;
    const refresh = () => {
      void service.refresh().catch(() => undefined);
    };
    const refreshAfterMutationSettles = () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => {
        refresh();
        invalidateTodoListCache(dispatch);
      }, 300);
    };
    const unsubscribe = subscribeToTodoChanges({
      onConnected: () => {
        refresh();
        invalidateTodoListCache(dispatch);
      },
      onTodoChanged: refreshAfterMutationSettles,
      onError: error => {
        console.error("Todo subscription failed", error);
      },
    });

    return () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      unsubscribe();
    };
  }, [dispatch, hydrated, isOnline, localOnly, service]);

  return children;
}
