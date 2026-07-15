import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import HomePage from "./page";

vi.mock("@/components/organism/todo-detail/TodoDetail", () => ({
  TodoDetail: () => <div>Todo detail panel</div>,
}));

const mocks = vi.hoisted(() => ({
  useListTodosQuery: vi.fn(),
}));

vi.mock("@/lib/features/todos/todoApi", () => ({
  useListTodosQuery: () => mocks.useListTodosQuery(),
}));

describe("home page", () => {
  afterEach(cleanup);

  it("shows a loading state", () => {
    mocks.useListTodosQuery.mockReturnValue({ isLoading: true });
    render(<HomePage />);
    expect(screen.getByText("Loading todos…")).toBeInTheDocument();
  });

  it("shows an error state", () => {
    mocks.useListTodosQuery.mockReturnValue({ isError: true });
    render(<HomePage />);
    expect(screen.getByText("Unable to load todos.")).toBeInTheDocument();
  });

  it("renders the todo detail panel when data is available", () => {
    mocks.useListTodosQuery.mockReturnValue({
      data: { data: [], first: 0, last: 0, limit: 10, total: 0 },
      isError: false,
      isLoading: false,
    });
    render(<HomePage />);
    expect(screen.getByText("Todo detail panel")).toBeInTheDocument();
  });
});
