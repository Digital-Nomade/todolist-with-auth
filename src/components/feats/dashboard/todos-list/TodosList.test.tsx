import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TodosList } from "./TodosList";
import type { Todo } from "@/types/Todo.type";

const todos: Todo[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    title: "Plan sprint backlog",
    description: "Review priorities",
    done: false,
    dueTo: "2026-07-20T18:00:00.000Z",
    reminderOn: null,
    createdAt: "2026-07-10T12:00:00.000Z",
    updatedAt: "2026-07-10T12:00:00.000Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    title: "Write release notes",
    description: "",
    done: true,
    dueTo: null,
    reminderOn: null,
    createdAt: "2026-07-11T12:00:00.000Z",
    updatedAt: "2026-07-12T12:00:00.000Z",
  },
];

describe("TodosList", () => {
  afterEach(cleanup);

  it("renders todos and highlights the selected item", () => {
    render(
      <TodosList
        todos={todos}
        selectedTodoId={todos[0].id}
        handleSelectTodo={vi.fn()}
      />,
    );

    expect(screen.getByText("Plan sprint ba...")).toBeInTheDocument();
    expect(screen.getByText("Write release ...")).toBeInTheDocument();
    expect(screen.getAllByRole("button")[0]).toHaveClass("border-danger-light");
  });

  it("calls the selection handler with the clicked todo", () => {
    const handleSelectTodo = vi.fn();
    render(
      <TodosList
        todos={todos}
        selectedTodoId={todos[0].id}
        handleSelectTodo={handleSelectTodo}
      />,
    );

    fireEvent.click(screen.getAllByRole("button")[1]);
    expect(handleSelectTodo).toHaveBeenCalledWith(todos[1]);
  });
});
