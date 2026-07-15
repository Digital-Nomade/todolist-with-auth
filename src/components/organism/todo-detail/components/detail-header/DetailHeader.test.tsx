import { render, screen } from "@testing-library/react";
import { useAnimate } from "framer-motion";
import { describe, expect, it, vi } from "vitest";
import { DetailHeader } from "./DetailHeader";
import type { Todo } from "@/types/Todo.type";

const todos: Todo[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    title: "First task",
    description: "One",
    done: false,
    dueTo: "2026-07-20T18:00:00.000Z",
    reminderOn: "2026-07-20T09:00:00.000Z",
    createdAt: "2026-07-10T12:00:00.000Z",
    updatedAt: "2026-07-10T12:00:00.000Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    title: "Second task",
    description: "Two",
    done: false,
    dueTo: null,
    reminderOn: null,
    createdAt: "2026-07-11T12:00:00.000Z",
    updatedAt: "2026-07-11T12:00:00.000Z",
  },
];

function DetailHeaderHarness({
  todoIndex = 0,
  onNavigate = vi.fn(),
}: {
  todoIndex?: number;
  onNavigate?: ReturnType<typeof vi.fn>;
}) {
  const [todoTitle] = useAnimate<HTMLHeadingElement>();
  const [previousButtonScope] = useAnimate<HTMLDivElement>();
  const [nextButtonScope] = useAnimate<HTMLDivElement>();

  return (
    <DetailHeader
      todoTitle={todoTitle}
      previousButtonScope={previousButtonScope}
      nextButtonScope={nextButtonScope}
      currentTodo={todos[todoIndex]}
      todoIndex={todoIndex}
      todos={todos}
      handleTodoNavigation={onNavigate}
    />
  );
}

describe("DetailHeader", () => {
  it("renders the current todo title and due date", () => {
    render(<DetailHeaderHarness />);

    expect(screen.getByRole("heading", { name: "First task" })).toBeInTheDocument();
    expect(screen.getByText(/Due to:/)).toBeInTheDocument();
    expect(screen.getByText(/Reminder on:/)).toBeInTheDocument();
  });

  it("disables previous navigation on the first todo", () => {
    render(<DetailHeaderHarness todoIndex={0} />);

    const buttons = screen.getAllByRole("button");
    expect(buttons[0]).toBeDisabled();
    expect(buttons[1]).not.toBeDisabled();
  });

});
