import { NextRequest } from "next/server";

const backendUrl =
  process.env.GRAPHQL_BACKEND_URL ?? "http://localhost:3773/graphql";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");

  if (origin && origin !== request.nextUrl.origin) {
    return Response.json(
      {
        errors: [
          {
            extensions: { code: "CROSS_ORIGIN_REQUEST" },
            message: "Cross-origin GraphQL requests are not allowed.",
          },
        ],
      },
      { status: 403 },
    );
  }

  const headers = new Headers({
    "content-type": request.headers.get("content-type") ?? "application/json",
  });
  const authorization = request.headers.get("authorization");
  const idempotencyKey = request.headers.get("idempotency-key");

  if (authorization) {
    headers.set("authorization", authorization);
  }

  if (idempotencyKey) {
    headers.set("idempotency-key", idempotencyKey);
  }

  try {
    const response = await fetch(backendUrl, {
      body: await request.text(),
      cache: "no-store",
      headers,
      method: "POST",
      signal: request.signal,
    });

    return new Response(response.body, {
      headers: {
        "content-type":
          response.headers.get("content-type") ?? "application/json",
      },
      status: response.status,
      statusText: response.statusText,
    });
  } catch {
    return Response.json(
      {
        errors: [
          {
            extensions: { code: "GRAPHQL_PROXY_UNAVAILABLE" },
            message: "The GraphQL service is unavailable.",
          },
        ],
      },
      { status: 502 },
    );
  }
}
