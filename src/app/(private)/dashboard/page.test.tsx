import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DashboardPage from "./page";
import { sampleTodos } from "@/stories/fixtures/todos";

vi.mock("@/components/feats/dashboard/todos-list/TodosList", () => ({
  TodosList: ({
    handleSelectTodo,
    todos,
  }: {
    handleSelectTodo: (todo: (typeof sampleTodos)[number]) => void;
    todos: typeof sampleTodos;
  }) => (
    <div>
      {todos.map((todo) => (
        <button key={todo.id} type="button" onClick={() => handleSelectTodo(todo)}>
          {todo.title}
        </button>
      ))}
    </div>
  ),
}));

vi.mock("@/components/organism", () => ({
  TodoDetail: ({ selectedTodo }: { selectedTodo?: { title: string } }) => (
    <div>Selected: {selectedTodo?.title}</div>
  ),
}));

const mocks = vi.hoisted(() => ({
  searchTerm: "",
  useOfflineTodos: vi.fn(),
  useSearchTodosQuery: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(
    mocks.searchTerm ? { search: mocks.searchTerm } : {},
  ),
}));

vi.mock("@/lib/features/todos/offline/hooks", () => ({
  useOfflineTodos: () => mocks.useOfflineTodos(),
}));

vi.mock("@/lib/features/todos/todoApi", () => ({
  useSearchTodosQuery: (request: unknown) => mocks.useSearchTodosQuery(request),
}));

describe("dashboard page", () => {
  beforeEach(() => {
    mocks.useSearchTodosQuery.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
    });
  });

  afterEach(() => {
    cleanup();
    mocks.searchTerm = "";
    mocks.useSearchTodosQuery.mockReset();
    mocks.useSearchTodosQuery.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
    });
  });

  it("shows a loading state", () => {
    mocks.useOfflineTodos.mockReturnValue({
      data: { data: [] },
      isLoading: true,
      localOnly: false,
    });
    render(<DashboardPage />);
    expect(screen.getByText("Loading todos…")).toBeInTheDocument();
  });

  it("renders the todo list and detail panel", () => {
    mocks.useOfflineTodos.mockReturnValue({
      data: { data: sampleTodos, first: 1, last: 3, limit: 10, total: 3 },
      error: null,
      isLoading: false,
      localOnly: false,
    });
    render(<DashboardPage />);

    expect(screen.getByText("Plan sprint backlog")).toBeInTheDocument();
    expect(screen.getByText(`Selected: ${sampleTodos[0].title}`)).toBeInTheDocument();
  });

  it("updates the selected todo when a list item is clicked", () => {
    mocks.useOfflineTodos.mockReturnValue({
      data: { data: sampleTodos, first: 1, last: 3, limit: 10, total: 3 },
      error: null,
      isLoading: false,
      localOnly: false,
    });
    render(<DashboardPage />);

    fireEvent.click(screen.getByRole("button", { name: "Write release notes" }));

    expect(screen.getByText(`Selected: ${sampleTodos[1].title}`)).toBeInTheDocument();
  });

  it("filters local-only todos without querying the server", () => {
    mocks.searchTerm = "release";
    mocks.useOfflineTodos.mockReturnValue({
      data: { data: sampleTodos, first: 1, last: 3, limit: 10, total: 3 },
      error: null,
      isLoading: false,
      localOnly: true,
    });

    render(<DashboardPage />);

    expect(screen.getByText("Write release notes")).toBeInTheDocument();
    expect(screen.queryByText("Plan sprint backlog")).not.toBeInTheDocument();
  });
});
