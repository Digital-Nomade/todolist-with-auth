import { print } from "graphql";
import { createClient } from "graphql-ws";
import {
  TodoChangedDocument,
  type TodoChangedSubscription,
} from "@/gql/graphql";
import {
  getAccessToken,
  subscribeToAccessTokenChanges,
} from "@/lib/auth/session";

const defaultWebSocketUrl = "ws://localhost:3773/graphql";

export interface TodoSubscriptionHandlers {
  onConnected: () => void;
  onDisconnected?: () => void;
  onError?: (error: unknown) => void;
  onTodoChanged: (event: TodoChangedSubscription["todoChanged"]) => void;
}

function canRetrySubscription(): boolean {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}

export function subscribeToTodoChanges({
  onConnected,
  onDisconnected,
  onError,
  onTodoChanged,
}: TodoSubscriptionHandlers) {
  const client = createClient({
    connectionParams: () => {
      const accessToken = getAccessToken();
      return accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : {};
    },
    on: {
      connected: onConnected,
      closed: onDisconnected,
    },
    lazy: true,
    retryAttempts: Infinity,
    shouldRetry: () => canRetrySubscription(),
    url: process.env.NEXT_PUBLIC_GRAPHQL_WS_URL ?? defaultWebSocketUrl,
  });

  const unsubscribe = client.subscribe<TodoChangedSubscription>(
    { query: print(TodoChangedDocument) },
    {
      complete: () => undefined,
      error: error => {
        onError?.(error);
      },
      next: result => {
        if (result.data?.todoChanged) {
          onTodoChanged(result.data.todoChanged);
        }
      },
    },
  );
  const unsubscribeFromTokenChanges = subscribeToAccessTokenChanges(() => {
    client.terminate();
  });

  return () => {
    unsubscribeFromTokenChanges();
    unsubscribe();
    void client.dispose();
  };
}
