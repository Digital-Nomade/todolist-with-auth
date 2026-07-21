import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { TodoEmptyState } from "./TodoEmptyState";

describe("TodoEmptyState", () => {
  afterEach(cleanup);

  it("renders the default empty state copy", () => {
    render(<TodoEmptyState />);

    expect(screen.getByRole("heading", { name: "No todos yet" })).toBeInTheDocument();
    expect(screen.getByText(/Tap the \+ button above/i)).toBeInTheDocument();
  });

  it("supports custom title and description", () => {
    render(
      <TodoEmptyState
        title="All clear"
        description="Nothing scheduled for now."
      />,
    );

    expect(screen.getByRole("heading", { name: "All clear" })).toBeInTheDocument();
    expect(screen.getByText("Nothing scheduled for now.")).toBeInTheDocument();
  });
});
