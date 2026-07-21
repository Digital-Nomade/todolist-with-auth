import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import { createClient } from "graphql-ws";
import WebSocket from "ws";

const graphqlHttpUrl =
  process.env.LIVE_GRAPHQL_HTTP_URL ?? "http://localhost:3773/graphql";
const graphqlWsUrl =
  process.env.LIVE_GRAPHQL_WS_URL ?? "ws://localhost:3773/graphql";
const identifier = process.env.LIVE_E2E_IDENTIFIER;
const password = process.env.LIVE_E2E_PASSWORD;

interface GraphqlResponse<Data> {
  data?: Data;
  errors?: Array<{ message: string }>;
}

async function graphql<Data>(
  request: APIRequestContext,
  query: string,
  variables: Record<string, unknown>,
  accessToken?: string,
) {
  const response = await request.post(graphqlHttpUrl, {
    data: { query, variables },
    headers: accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : undefined,
  });
  expect(response.ok()).toBe(true);

  const payload = await response.json() as GraphqlResponse<Data>;
  expect(payload.errors, JSON.stringify(payload.errors)).toBeUndefined();
  expect(payload.data).toBeDefined();
  return payload.data!;
}

function waitForSubscriptionConnection(page: Page) {
  return new Promise<void>((resolve) => {
    page.on("websocket", socket => {
      if (!socket.url().endsWith("/graphql")) return;

      socket.on("framereceived", ({ payload }) => {
        try {
          const message = JSON.parse(String(payload)) as { type?: string };
          if (message.type === "connection_ack") resolve();
        } catch {
          // Ignore non-JSON protocol frames.
        }
      });
    });
  });
}

function subscribeToTodoUpdate(accessToken: string, todoId: string) {
  let markConnected: () => void = () => undefined;
  const connected = new Promise<void>(resolve => {
    markConnected = resolve;
  });
  const client = createClient({
    connectionParams: { Authorization: `Bearer ${accessToken}` },
    on: { connected: markConnected },
    retryAttempts: 0,
    url: graphqlWsUrl,
    webSocketImpl: WebSocket,
  });
  let unsubscribe: () => void = () => undefined;
  const event = new Promise<{
    todoChanged: { todo: { done: boolean } | null; todoId: string; type: string };
  }>((resolve, reject) => {
    unsubscribe = client.subscribe(
      {
        query: `subscription LiveE2ETodoChanged {
          todoChanged {
            type
            todoId
            todo {
              done
            }
          }
        }`,
      },
      {
        complete: () => reject(new Error("Subscription completed before update.")),
        error: reject,
        next: result => {
          const changed = result.data?.todoChanged as {
            todo: { done: boolean } | null;
            todoId: string;
            type: string;
          } | undefined;
          if (changed?.type === "UPDATED" && changed.todoId === todoId) {
            resolve({ todoChanged: changed });
          }
        },
      },
    );
  });

  return {
    connected,
    event,
    dispose: async () => {
      unsubscribe();
      await client.dispose();
    },
  };
}

test.describe("live real-time todo sync", () => {
  test.skip(
    !identifier || !password,
    "Set LIVE_E2E_IDENTIFIER and LIVE_E2E_PASSWORD for an ACTIVE backend user.",
  );

  test("syncs create, web check update, and delete across clients", async ({
    page,
    request,
  }) => {
    const login = await graphql<{
      login: { accessToken: string; refreshToken: string };
    }>(
      request,
      `mutation LiveE2ELogin($input: LoginInput!) {
        login(input: $input) {
          accessToken
          refreshToken
        }
      }`,
      { input: { identifier, password } },
    );
    const { accessToken, refreshToken } = login.login;
    const connectionReady = waitForSubscriptionConnection(page);
    const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const initialTitle = `Live realtime ${unique}`;
    let createdTodoId: string | null = null;

    await page.addInitScript(token => {
      window.localStorage.setItem(
        "todo-auth.session",
        JSON.stringify({ refreshToken: token }),
      );
    }, refreshToken);

    try {
      await page.goto("/dashboard");
      await expect(page).toHaveURL(/\/dashboard/);
      await connectionReady;

      const created = await graphql<{
        createTodo: { id: string; title: string };
      }>(
        request,
        `mutation LiveE2ECreateTodo($input: CreateTodo!) {
          createTodo(input: $input) {
            id
            title
          }
        }`,
        {
          input: {
            description: "Created by the live real-time Playwright test.",
            title: initialTitle,
          },
        },
        accessToken,
      );
      createdTodoId = created.createTodo.id;
      await expect(page.getByTitle(initialTitle)).toBeVisible();

      await page.getByTitle(initialTitle).click();
      const updateSubscription = subscribeToTodoUpdate(accessToken, createdTodoId);
      await updateSubscription.connected;

      await page.getByRole("button", { name: "check" }).click();
      const updateEvent = await updateSubscription.event;
      await updateSubscription.dispose();
      expect(updateEvent.todoChanged.todo?.done).toBe(true);

      const checked = await graphql<{
        todo: { done: boolean };
      }>(
        request,
        `query LiveE2ECheckedTodo($id: ID!) {
          todo(id: $id) {
            done
          }
        }`,
        { id: createdTodoId },
        accessToken,
      );
      expect(checked.todo.done).toBe(true);

      await graphql(
        request,
        `mutation LiveE2EDeleteTodo($id: ID!) {
          deleteTodo(id: $id)
        }`,
        { id: createdTodoId },
        accessToken,
      );
      createdTodoId = null;
      await expect(page.getByTitle(initialTitle)).toHaveCount(0);
    } finally {
      if (createdTodoId) {
        await graphql(
          request,
          `mutation LiveE2ECleanupTodo($id: ID!) {
            deleteTodo(id: $id)
          }`,
          { id: createdTodoId },
          accessToken,
        ).catch(() => undefined);
      }
    }
  });
});
