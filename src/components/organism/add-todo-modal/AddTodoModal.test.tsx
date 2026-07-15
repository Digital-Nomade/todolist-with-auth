import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AddTodoModal } from "./AddTodoModal";
import { renderWithProviders } from "@/test/renderWithProviders";

const mocks = vi.hoisted(() => ({
  createTodo: vi.fn(),
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<"div">) => <div {...props}>{children}</div>,
    form: ({ children, ...props }: React.ComponentProps<"form">) => <form {...props}>{children}</form>,
  },
  useAnimate: () => [{ current: null }, vi.fn().mockResolvedValue(undefined)],
}));

vi.mock("@nextui-org/react", () => ({
  DatePicker: ({ label }: { label: string }) => <div>{label}</div>,
}));

vi.mock("@/lib/features/todos/todoApi", () => ({
  useCreateTodoMutation: () => [mocks.createTodo],
}));

describe("AddTodoModal", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createTodo.mockReturnValue({ unwrap: () => Promise.resolve({ id: "todo-id" }) });
  });

  it("does not render when closed", () => {
    renderWithProviders(
      <AddTodoModal handleToggleModal={vi.fn()} isOpen={false} />,
    );

    expect(screen.queryByLabelText("New Todo")).not.toBeInTheDocument();
  });

  it("creates a todo and closes the modal", async () => {
    const handleToggleModal = vi.fn();
    renderWithProviders(
      <AddTodoModal handleToggleModal={handleToggleModal} isOpen />,
    );

    fireEvent.change(screen.getByLabelText("New Todo"), {
      target: { value: "Ship tests" },
    });
    const [, descriptionField] = screen.getAllByRole("textbox");
    fireEvent.change(descriptionField, {
      target: { value: "Cover the modal flow" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => expect(mocks.createTodo).toHaveBeenCalledWith({
      title: "Ship tests",
      description: "Cover the modal flow",
      dueTo: null,
      reminderOn: null,
    }));
    await waitFor(() => expect(handleToggleModal).toHaveBeenCalledOnce());
  });
});
