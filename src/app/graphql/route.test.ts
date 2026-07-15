import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

function createNextRequest({
  body = "{}",
  headers = {},
  origin = "http://localhost:3001",
}: {
  body?: string;
  headers?: Record<string, string>;
  origin?: string;
} = {}) {
  const url = new URL("http://localhost:3001/graphql");

  return {
    headers: new Headers({
      "content-type": "application/json",
      origin,
      ...headers,
    }),
    nextUrl: url,
    signal: new AbortController().signal,
    text: async () => body,
  } as unknown as NextRequest;
}

describe("graphql route", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects cross-origin requests", async () => {
    const response = await POST(createNextRequest({
      origin: "http://evil.example",
    }));

    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({
      errors: [{ extensions: { code: "CROSS_ORIGIN_REQUEST" } }],
    });
  });

  it("proxies same-origin requests to the backend", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{"data":{"me":null}}', {
      headers: { "content-type": "application/json" },
      status: 200,
    }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(createNextRequest({
      body: JSON.stringify({ query: "{ me { id } }" }),
      headers: { authorization: "Bearer access-token" },
    }));

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledOnce();
    const forwardedHeaders = fetchMock.mock.calls[0][1].headers as Headers;
    expect(forwardedHeaders.get("authorization")).toBe("Bearer access-token");
  });

  it("returns a proxy-unavailable error when the backend is down", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    const response = await POST(createNextRequest());

    expect(response.status).toBe(502);
    expect(await response.json()).toMatchObject({
      errors: [{ extensions: { code: "GRAPHQL_PROXY_UNAVAILABLE" } }],
    });
  });
});
