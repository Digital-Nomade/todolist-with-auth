import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AddTodoButton } from "./AddTodoButton";

describe("AddTodoButton", () => {
  afterEach(cleanup);

  it("renders the add todo control with wave decoration", () => {
    render(<AddTodoButton onClick={vi.fn()} />);

    const button = screen.getByRole("button", { name: "Add todo" });
    expect(button).toHaveAttribute("id", "add-todo-button");
    expect(button.querySelector(".add-todo-button__wave")).toBeInTheDocument();
  });

  it("calls onClick when pressed", () => {
    const onClick = vi.fn();
    render(<AddTodoButton onClick={onClick} />);

    fireEvent.click(screen.getByRole("button", { name: "Add todo" }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
