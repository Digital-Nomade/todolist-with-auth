"use client";

import { useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { toTodo } from "./mappers";
import { createTodoRemoteClient } from "./remote";
import { createTodoService } from "./todoService";

function useService() {
  const dispatch = useAppDispatch();
  const userId = useAppSelector(state => state.auth.user?.id ?? null);

  return useMemo(() => {
    if (!userId) return null;
    return createTodoService(userId, dispatch, createTodoRemoteClient(dispatch));
  }, [dispatch, userId]);
}

export function useOfflineTodos() {
  const state = useAppSelector(current => current.offlineTodos);
  const service = useService();
  const data = useMemo(() => state.todos.map(toTodo), [state.todos]);

  return {
    data: {
      data,
      first: data.length ? 1 : 0,
      last: data.length,
      limit: data.length,
      total: data.length,
    },
    error: state.error,
    isLoading: !state.hydrated,
    refresh: () => service?.refresh(),
  };
}

export function useOfflineTodo(localId?: string) {
  return useAppSelector(state => {
    const todo = state.offlineTodos.todos.find(candidate => candidate.localId === localId);
    return todo ? toTodo(todo) : undefined;
  });
}

export function useOfflineTodoMutations() {
  const service = useService();

  return {
    createTodo: service?.create,
    deleteTodo: service?.delete,
    updateTodo: service?.update,
  };
}

export function useOfflineTodoSettings() {
  const state = useAppSelector(current => current.offlineTodos);
  const service = useService();

  return {
    ...state,
    disableLocalOnly: service?.disableLocalOnly,
    enableLocalOnly: service?.enableLocalOnly,
    retrySync: service?.sync,
  };
}
