"use client";

import { useEffect, type ReactNode } from "react";
import { refreshSessionOnce } from "@/lib/api";
import { initializationFinished, sessionRestored } from "@/lib/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";

export function AuthBootstrap({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const initialized = useAppSelector(state => state.auth.initialized);

  useEffect(() => {
    let active = true;

    void refreshSessionOnce()
      .then(payload => {
        if (!active) return;
        if (payload) {
          dispatch(sessionRestored(payload.user));
        } else {
          dispatch(initializationFinished());
        }
      })
      .catch(() => {
        if (active) dispatch(initializationFinished());
      });

    return () => {
      active = false;
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
