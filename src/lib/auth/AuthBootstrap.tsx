"use client";

import { useEffect, type ReactNode } from "react";
import { refreshSessionOnce } from "@/lib/api";
import { getAccessTokenExpiresAt } from "@/lib/auth/session";
import {
  initializationFinished,
  sessionCleared,
  sessionRestored,
} from "@/lib/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";

const MAX_REFRESH_AHEAD_MS = 60_000;

export function AuthBootstrap({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const initialized = useAppSelector(state => state.auth.initialized);

  useEffect(() => {
    let active = true;
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;

    const scheduleRefresh = () => {
      const scheduledExpiry = getAccessTokenExpiresAt();
      if (!active || !scheduledExpiry) return;

      const remaining = Math.max(0, scheduledExpiry - Date.now());
      const refreshAhead = Math.min(
        MAX_REFRESH_AHEAD_MS,
        Math.max(1_000, remaining * 0.1),
      );

      refreshTimer = setTimeout(() => {
        if (!active) return;

        // A reactive refresh may already have rotated the token.
        if (getAccessTokenExpiresAt() !== scheduledExpiry) {
          scheduleRefresh();
          return;
        }

        void refreshSessionOnce()
          .then(payload => {
            if (!active) return;
            if (payload) {
              dispatch(sessionRestored(payload.user));
              scheduleRefresh();
            } else {
              dispatch(sessionCleared());
            }
          })
          .catch(() => {
            if (active) dispatch(sessionCleared());
          });
      }, Math.max(0, remaining - refreshAhead));
    };

    void refreshSessionOnce()
      .then(payload => {
        if (!active) return;
        if (payload) {
          dispatch(sessionRestored(payload.user));
          scheduleRefresh();
        } else {
          dispatch(initializationFinished());
        }
      })
      .catch(() => {
        if (active) dispatch(initializationFinished());
      });

    return () => {
      active = false;
      if (refreshTimer) clearTimeout(refreshTimer);
    };
  }, [dispatch]);

  if (!initialized) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center text-danger-light">
        Restoring your session…
      </main>
    );
  }

  return children;
}
