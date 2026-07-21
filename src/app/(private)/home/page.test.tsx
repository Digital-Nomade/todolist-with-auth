import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import HomePage from "./page";
import { sampleTodos } from "@/stories/fixtures/todos";

const mocks = vi.hoisted(() => ({
  useOfflineTodos: vi.fn(),
  deleteTodo: vi.fn(),
  updateTodo: vi.fn(),
}));

vi.mock("framer-motion", () => ({
  useAnimate: () => [{ current: null }, vi.fn().mockResolvedValue(undefined)],
}));

vi.mock("@/lib/features/todos/offline/hooks", () => ({
  useOfflineTodos: () => mocks.useOfflineTodos(),
  useOfflineTodoMutations: () => ({
    deleteTodo: mocks.deleteTodo,
    updateTodo: mocks.updateTodo,
  }),
}));

describe("home page", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows a loading state", () => {
    mocks.useOfflineTodos.mockReturnValue({
      data: { data: [] },
      isLoading: true,
    });
    render(<HomePage />);
    expect(screen.getByText("Loading todos…")).toBeInTheDocument();
  });

  it("shows an error state", () => {
    mocks.useOfflineTodos.mockReturnValue({
      data: { data: [] },
      error: "offline error",
      isLoading: false,
    });
    render(<HomePage />);
    expect(screen.getByText("Unable to load todos.")).toBeInTheDocument();
  });

  it("shows an empty state when there are no todos", () => {
    mocks.useOfflineTodos.mockReturnValue({
      data: { data: [], first: 0, last: 0, limit: 10, total: 0 },
      error: null,
      isLoading: false,
    });
    render(<HomePage />);

    expect(screen.getByRole("heading", { name: "No todos yet" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /delete/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /check/i })).not.toBeInTheDocument();
  });

  it("renders todo actions when todos are available", () => {
    mocks.useOfflineTodos.mockReturnValue({
      data: {
        data: sampleTodos,
        first: 1,
        last: sampleTodos.length,
        limit: 10,
        total: sampleTodos.length,
      },
      error: null,
      isLoading: false,
    });
    render(<HomePage />);

    expect(screen.getByRole("heading", { name: sampleTodos[0].title })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /check/i })).toBeInTheDocument();
  });
});
