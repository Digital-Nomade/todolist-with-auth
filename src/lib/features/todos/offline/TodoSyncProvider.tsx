"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { connectivityChanged, offlineStoreReset } from "./offlineSlice";
import { createTodoRemoteClient } from "./remote";
import { createTodoService } from "./todoService";
import { cancelTodoSync } from "./syncEngine";

export function TodoSyncProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
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
      const isOnline = navigator.onLine;
      dispatch(connectivityChanged(isOnline));
      if (isOnline) service?.sync();
    };
    const syncWhenActive = () => {
      if (document.visibilityState === "visible") service?.sync();
    };
    const syncOnFocus = () => service?.sync();

    updateConnectivity();
    window.addEventListener("online", updateConnectivity);
    window.addEventListener("offline", updateConnectivity);
    window.addEventListener("focus", syncOnFocus);
    document.addEventListener("visibilitychange", syncWhenActive);

    return () => {
      window.removeEventListener("online", updateConnectivity);
      window.removeEventListener("offline", updateConnectivity);
      window.removeEventListener("focus", syncOnFocus);
      document.removeEventListener("visibilitychange", syncWhenActive);
    };
  }, [dispatch, service]);

  return children;
}
