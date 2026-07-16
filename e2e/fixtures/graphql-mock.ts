import type { Page, Route } from "@playwright/test";
import {
  activeUser,
  authPayload,
  credentials,
  pendingUser,
  profile,
  seedTodos,
  suspendedUser,
  type TodoRecord,
} from "./test-data";

type GraphqlBody = {
  query: string;
  variables?: Record<string, unknown>;
};

export type GraphqlMockOptions = {
  todos?: TodoRecord[];
  profile?: typeof profile;
  loginScenario?: "active" | "invalid" | "pending" | "suspended";
  registerScenario?: "success" | "conflict";
  verifyCode?: "valid" | "invalid" | "rate-limited";
  resetToken?: "valid" | "invalid";
  changePasswordScenario?: "success" | "invalid";
  refreshScenario?: "active" | "invalid";
};

function getOperationName(query: string) {
  const match = query.match(/\b(?:mutation|query)\s+(\w+)/);
  return match?.[1] ?? null;
}

function graphqlSuccess(data: Record<string, unknown>) {
  return {
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ data }),
  };
}

function graphqlError(code: string, message: string, status = 200) {
  return {
    status,
    contentType: "application/json",
    body: JSON.stringify({
      errors: [{ extensions: { code }, message }],
    }),
  };
}

function paginatedTodos(todos: TodoRecord[]) {
  return {
    data: todos,
    first: 1,
    last: todos.length,
    limit: 10,
    total: todos.length,
  };
}

export async function installGraphqlMock(page: Page, options: GraphqlMockOptions = {}) {
  const state = {
    todos: [...(options.todos ?? seedTodos)],
    profile: { ...(options.profile ?? profile) },
    loginScenario: options.loginScenario ?? "active",
    registerScenario: options.registerScenario ?? "success",
    verifyCode: options.verifyCode ?? "valid",
    resetToken: options.resetToken ?? "valid",
    changePasswordScenario: options.changePasswordScenario ?? "success",
    refreshScenario: options.refreshScenario ?? "active",
  };

  await page.route("**/graphql", async (route: Route) => {
    const request = route.request();
    const body = request.postDataJSON() as GraphqlBody;
    const operation = getOperationName(body.query);

    switch (operation) {
      case "Login": {
        const input = body.variables?.input as { identifier: string; password: string };
        if (
          state.loginScenario === "invalid"
          || input.password !== credentials.active.password
          || (input.identifier === credentials.invalid.identifier && input.password === credentials.invalid.password)
        ) {
          return route.fulfill(graphqlError("INVALID_CREDENTIALS", "Invalid credentials"));
        }
        if (input.identifier === credentials.pending.identifier) {
          return route.fulfill(graphqlSuccess({ login: authPayload(pendingUser) }));
        }
        if (input.identifier === credentials.suspended.identifier) {
          return route.fulfill(graphqlSuccess({ login: authPayload(suspendedUser) }));
        }
        return route.fulfill(graphqlSuccess({ login: authPayload(activeUser) }));
      }

      case "CreateUser": {
        if (state.registerScenario === "conflict") {
          return route.fulfill(graphqlError("CONFLICT", "Email already registered"));
        }
        return route.fulfill(graphqlSuccess({
          createUser: { message: "Check your inbox" },
        }));
      }

      case "RefreshToken": {
        if (state.refreshScenario === "invalid") {
          return route.fulfill(graphqlError("UNAUTHENTICATED", "Invalid refresh token"));
        }
        return route.fulfill(graphqlSuccess({ refreshToken: authPayload(activeUser) }));
      }

      case "Logout":
        return route.fulfill(graphqlSuccess({ logout: { message: "Signed out" } }));

      case "LogoutAll":
        return route.fulfill(graphqlSuccess({ logoutAll: { message: "Signed out everywhere" } }));

      case "RequestPasswordReset":
        return route.fulfill(graphqlSuccess({
          requestPasswordReset: { message: "Reset email sent" },
        }));

      case "ResetPassword": {
        const input = body.variables?.input as { token: string; newPassword: string };
        if (state.resetToken === "invalid" || input.token !== "valid-reset-token") {
          return route.fulfill(graphqlError("INVALID_RESET_TOKEN", "Invalid reset token"));
        }
        return route.fulfill(graphqlSuccess({
          resetPassword: { message: "Password reset" },
        }));
      }

      case "ResendVerificationEmail":
        return route.fulfill(graphqlSuccess({
          resendVerificationEmail: { message: "Verification email sent" },
        }));

      case "VerifyEmail": {
        const input = body.variables?.input as { email: string; code: string };
        if (state.verifyCode === "rate-limited") {
          return route.fulfill(graphqlError("TOO_MANY_REQUESTS", "Too many attempts"));
        }
        if (state.verifyCode === "invalid" || !["123456", "012345"].includes(input.code)) {
          return route.fulfill(graphqlError("UNAUTHENTICATED", "Invalid or expired code"));
        }
        return route.fulfill(graphqlSuccess({ verifyEmail: state.profile }));
      }

      case "Me":
        return route.fulfill(graphqlSuccess({ me: state.profile }));

      case "UpdateProfile": {
        const input = body.variables?.input as Partial<typeof profile>;
        state.profile = {
          ...state.profile,
          ...input,
          updatedAt: new Date().toISOString(),
        };
        return route.fulfill(graphqlSuccess({ updateProfile: state.profile }));
      }

      case "ChangePassword": {
        const input = body.variables?.input as { currentPassword: string; newPassword: string };
        if (
          state.changePasswordScenario === "invalid"
          || input.currentPassword !== credentials.active.password
        ) {
          return route.fulfill(graphqlError("INVALID_CREDENTIALS", "Invalid current password"));
        }
        return route.fulfill(graphqlSuccess({ changePassword: state.profile }));
      }

      case "Todos":
        return route.fulfill(graphqlSuccess({ todos: paginatedTodos(state.todos) }));

      case "CreateTodo": {
        const input = body.variables?.input as {
          title: string;
          description: string;
          dueTo?: string | null;
          reminderOn?: string | null;
        };
        const created: TodoRecord = {
          id: "new-todo-id",
          title: input.title,
          description: input.description,
          done: false,
          dueTo: input.dueTo ?? null,
          reminderOn: input.reminderOn ?? null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        state.todos = [created, ...state.todos];
        return route.fulfill(graphqlSuccess({ createTodo: created }));
      }

      case "UpdateTodo": {
        const id = body.variables?.id as string;
        const input = body.variables?.input as Partial<TodoRecord>;
        const index = state.todos.findIndex(todo => todo.id === id);
        if (index === -1) {
          return route.fulfill(graphqlError("NOT_FOUND", "Todo not found", 404));
        }
        state.todos[index] = {
          ...state.todos[index],
          ...input,
          updatedAt: new Date().toISOString(),
        };
        return route.fulfill(graphqlSuccess({ updateTodo: state.todos[index] }));
      }

      default:
        return route.fulfill(graphqlError("NOT_IMPLEMENTED", `Unhandled operation: ${operation}`));
    }
  });

  return state;
}

export async function seedAuthenticatedSession(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("todo-auth.session", JSON.stringify({
      refreshToken: "e2e-refresh-token",
    }));
  });
}
