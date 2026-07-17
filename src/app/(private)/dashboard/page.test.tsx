import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
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
  useOfflineTodos: vi.fn(),
}));

vi.mock("@/lib/features/todos/offline/hooks", () => ({
  useOfflineTodos: () => mocks.useOfflineTodos(),
}));

describe("dashboard page", () => {
  afterEach(cleanup);

  it("shows a loading state", () => {
    mocks.useOfflineTodos.mockReturnValue({
      data: { data: [] },
      isLoading: true,
    });
    render(<DashboardPage />);
    expect(screen.getByText("Loading todos…")).toBeInTheDocument();
  });

  it("renders the todo list and detail panel", () => {
    mocks.useOfflineTodos.mockReturnValue({
      data: { data: sampleTodos, first: 1, last: 3, limit: 10, total: 3 },
      error: null,
      isLoading: false,
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
    });
    render(<DashboardPage />);

    fireEvent.click(screen.getByRole("button", { name: "Write release notes" }));

    expect(screen.getByText(`Selected: ${sampleTodos[1].title}`)).toBeInTheDocument();
  });
});
