import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeStore } from "@/lib/store";
import { isTodoUnavailableError, todoApi } from "./todoApi";

const todo = {
  createdAt: "2026-01-01T00:00:00.000Z",
  description: "Buy fruit",
  done: false,
  dueTo: null,
  id: "a18c8296-2e47-40ce-a88b-fdd53ce19f03",
  reminderOn: null,
  title: "Groceries",
  updatedAt: "2026-01-02T00:00:00.000Z",
};

describe("isTodoUnavailableError", () => {
  it("returns true for not-found and forbidden GraphQL errors", () => {
    expect(isTodoUnavailableError({ code: "NOT_FOUND", errors: [], status: 200 })).toBe(true);
    expect(isTodoUnavailableError({ code: "TODO_NOT_FOUND", errors: [], status: 200 })).toBe(true);
    expect(isTodoUnavailableError({ code: "FORBIDDEN", errors: [], status: 200 })).toBe(true);
    expect(isTodoUnavailableError({ code: "GRAPHQL_ERROR", errors: [], status: 404 })).toBe(true);
  });

  it("returns false for unrelated errors", () => {
    expect(isTodoUnavailableError({ code: "BAD_USER_INPUT", errors: [], status: 200 })).toBe(false);
    expect(isTodoUnavailableError(null)).toBe(false);
    expect(isTodoUnavailableError("network")).toBe(false);
  });
});

describe("searchTodos", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      data: {
        searchTodos: {
          data: [todo],
          first: 1,
          last: 1,
          limit: 20,
          total: 1,
        },
      },
    }), {
      headers: { "content-type": "application/json" },
      status: 200,
    })));
  });

  it("trims the term and sends pagination as GraphQL variables", async () => {
    const store = makeStore();

    const result = await store.dispatch(todoApi.endpoints.searchTodos.initiate({
      pagination: { currentPage: 2, limit: 20, total: true },
      term: "  groceries  ",
    })).unwrap();

    const [, init] = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(String(init?.body)) as {
      query: string;
      variables: Record<string, unknown>;
    };

    expect(body.query).toContain("query SearchTodos");
    expect(body.variables).toEqual({
      pagination: {
        currentPage: 2,
        limit: 20,
        orderBy: "DESC",
        total: true,
      },
      term: "groceries",
    });
    expect(result.data).toEqual([todo]);
  });
});
