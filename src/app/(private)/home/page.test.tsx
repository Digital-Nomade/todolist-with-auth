import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import HomePage from "./page";

vi.mock("@/components/organism/todo-detail/TodoDetail", () => ({
  TodoDetail: () => <div>Todo detail panel</div>,
}));

const mocks = vi.hoisted(() => ({
  useOfflineTodos: vi.fn(),
}));

vi.mock("@/lib/features/todos/offline/hooks", () => ({
  useOfflineTodos: () => mocks.useOfflineTodos(),
}));

describe("home page", () => {
  afterEach(cleanup);

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

  it("renders the todo detail panel when data is available", () => {
    mocks.useOfflineTodos.mockReturnValue({
      data: { data: [], first: 0, last: 0, limit: 10, total: 0 },
      error: null,
      isLoading: false,
    });
    render(<HomePage />);
    expect(screen.getByText("Todo detail panel")).toBeInTheDocument();
  });
});
