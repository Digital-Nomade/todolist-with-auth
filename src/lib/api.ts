import type { TypedDocumentNode } from "@graphql-typed-document-node/core";
import {
  createApi,
  type BaseQueryFn,
} from "@reduxjs/toolkit/query/react";
import { print } from "graphql";
import {
  RefreshTokenDocument,
  type RefreshTokenMutation,
} from "@/gql/graphql";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  setSession,
} from "@/lib/auth/session";
import { sessionCleared } from "@/lib/features/auth/authSlice";

type AuthMode = "protected" | "public" | "refresh";

export interface GraphqlRequest {
  auth?: AuthMode;
  document: TypedDocumentNode<object, never>;
  idempotencyKey?: string;
  variables?: object;
}

interface GraphqlErrorPayload {
  extensions?: {
    code?: string;
    [key: string]: unknown;
  };
  message: string;
  path?: Array<number | string>;
}

interface GraphqlResponse<Data> {
  data?: Data;
  errors?: GraphqlErrorPayload[];
}

export interface GraphqlApiError {
  code: string;
  errors: GraphqlErrorPayload[];
  status: number | "FETCH_ERROR";
}

export function redirectToLogin() {
  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.history.replaceState(null, "", "/login");
    window.dispatchEvent(new PopStateEvent("popstate"));
  }
}

const endpoint = "/graphql";
let refreshInFlight: Promise<RefreshTokenMutation["refreshToken"] | null> | null = null;

function normalizeError(
  errors: GraphqlErrorPayload[],
  status: GraphqlApiError["status"],
): GraphqlApiError {
  return {
    code: errors[0]?.extensions?.code ?? "GRAPHQL_ERROR",
    errors,
    status,
  };
}

async function execute<Data>(
  request: GraphqlRequest,
): Promise<
  | { data: Data }
  | { error: GraphqlApiError }
> {
  const headers = new Headers({ "content-type": "application/json" });
  const token = request.auth === "protected" ? getAccessToken() : null;

  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }

  if (request.idempotencyKey) {
    headers.set("idempotency-key", request.idempotencyKey);
  }

  let response: Response;

  try {
    response = await fetch(endpoint, {
      body: JSON.stringify({
        query: print(request.document),
        variables: request.variables,
      }),
      headers,
      method: "POST",
    });
  } catch {
    return {
      error: normalizeError(
        [
          {
            extensions: { code: "FETCH_ERROR" },
            message: "Unable to reach the GraphQL endpoint.",
          },
        ],
        "FETCH_ERROR",
      ),
    };
  }

  let payload: GraphqlResponse<Data>;

  try {
    payload = (await response.json()) as GraphqlResponse<Data>;
  } catch {
    return {
      error: normalizeError(
        [
          {
            extensions: { code: "INVALID_GRAPHQL_RESPONSE" },
            message: "The GraphQL endpoint returned invalid JSON.",
          },
        ],
        response.status,
      ),
    };
  }

  if (payload.errors?.length) {
    return { error: normalizeError(payload.errors, response.status) };
  }

  if (!response.ok || payload.data === undefined) {
    return {
      error: normalizeError(
        [
          {
            extensions: { code: `HTTP_${response.status}` },
            message: "The GraphQL request failed.",
          },
        ],
        response.status,
      ),
    };
  }

  return { data: payload.data };
}

function isAuthenticationError(error: GraphqlApiError) {
  return error.errors.some(
    ({ extensions }) => extensions?.code === "UNAUTHENTICATED",
  );
}

export async function refreshSession() {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    clearSession();
    return null;
  }

  const result = await execute<RefreshTokenMutation>({
    auth: "refresh",
    document: RefreshTokenDocument,
    variables: { input: { refreshToken } },
  });

  if ("error" in result) {
    clearSession();
    return null;
  }

  if (result.data.refreshToken.user.status !== "ACTIVE") {
    clearSession();
    return null;
  }

  try {
    setSession(result.data.refreshToken);
  } catch {
    clearSession();
    return null;
  }

  return result.data.refreshToken;
}

export function refreshSessionOnce() {
  if (!refreshInFlight) {
    refreshInFlight = refreshSession().finally(() => {
      refreshInFlight = null;
    });
  }

  return refreshInFlight;
}

export const graphqlBaseQuery: BaseQueryFn<
  GraphqlRequest,
  unknown,
  GraphqlApiError
> = async (request, { dispatch }) => {
  const normalizedRequest = {
    ...request,
    auth: request.auth ?? "protected",
  } satisfies GraphqlRequest;
  const attemptedAccessToken =
    normalizedRequest.auth === "protected" ? getAccessToken() : null;
  const firstResult = await execute(normalizedRequest);

  if (
    "data" in firstResult ||
    normalizedRequest.auth !== "protected" ||
    !isAuthenticationError(firstResult.error)
  ) {
    return firstResult;
  }

  // Another failed operation may already have rotated the session while this
  // request was in flight. Retry with that access token instead of rotating
  // the new refresh token a second time.
  const currentAccessToken = getAccessToken();
  if (currentAccessToken && currentAccessToken !== attemptedAccessToken) {
    return execute(normalizedRequest);
  }

  if (!(await refreshSessionOnce())) {
    clearSession();
    dispatch(sessionCleared());
    redirectToLogin();
    return firstResult;
  }

  return execute(normalizedRequest);
};

export const api = createApi({
  keepUnusedDataFor: 0,
  refetchOnReconnect: true,
  reducerPath: "YouDoMuchMoreAPI",
  tagTypes: [
    "user",
    "todos",
  ],
  baseQuery: graphqlBaseQuery,
  endpoints: () => ({})
});
