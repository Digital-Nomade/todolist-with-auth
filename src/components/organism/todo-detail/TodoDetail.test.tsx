import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TodoDetail } from "./TodoDetail";
import { sampleTodos } from "@/stories/fixtures/todos";

const mocks = vi.hoisted(() => ({
  updateTodo: vi.fn(),
}));

vi.mock("framer-motion", () => ({
  useAnimate: () => [{ current: null }, vi.fn().mockResolvedValue(undefined)],
}));

vi.mock("@/lib/features/todos/todoApi", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/features/todos/todoApi")>();
  return {
    ...actual,
    useUpdateTodoMutation: () => [mocks.updateTodo],
  };
});

describe("TodoDetail", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows an empty state when there are no todos", () => {
    render(<TodoDetail tIndex={0} />);

    expect(screen.getByText("You have no todos")).toBeInTheDocument();
  });

  it("renders the selected todo description", () => {
    render(
      <TodoDetail
        paginatedTodos={{ data: sampleTodos, first: 1, last: 3, limit: 10, total: 3 }}
        selectedTodo={sampleTodos[0]}
        tIndex={0}
      />,
    );

    expect(screen.getByText("Review priorities with the team.")).toBeInTheDocument();
    expect(screen.getByText(/created at:/i)).toBeInTheDocument();
  });

  it("marks a todo as done through the check action", async () => {
    const updatedTodo = { ...sampleTodos[0], done: true };
    mocks.updateTodo.mockReturnValue({ unwrap: () => Promise.resolve(updatedTodo) });

    render(
      <TodoDetail
        paginatedTodos={{ data: sampleTodos, first: 1, last: 3, limit: 10, total: 3 }}
        selectedTodo={sampleTodos[0]}
        tIndex={0}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /check/i }));

    await waitFor(() => expect(mocks.updateTodo).toHaveBeenCalledWith({
      id: sampleTodos[0].id,
      input: { done: true },
    }));
  });

  it("shows an unavailable message when the todo cannot be updated", async () => {
    mocks.updateTodo.mockReturnValue({
      unwrap: () => Promise.reject({ code: "NOT_FOUND" }),
    });

    render(
      <TodoDetail
        paginatedTodos={{ data: sampleTodos, first: 1, last: 3, limit: 10, total: 3 }}
        selectedTodo={sampleTodos[0]}
        tIndex={0}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /check/i }));

    expect(await screen.findByText("This todo is unavailable.")).toBeInTheDocument();
  });
});
