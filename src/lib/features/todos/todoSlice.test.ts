import { describe, expect, it } from "vitest";
import todoReducer, { setToggleAddTodoModal } from "./todoSlice";

describe("todoSlice", () => {
  it("toggles the add-todo modal flag", () => {
    const opened = todoReducer(undefined, setToggleAddTodoModal());
    const closed = todoReducer(opened, setToggleAddTodoModal());

    expect(opened.toggleAddTodoModal).toBe(true);
    expect(closed.toggleAddTodoModal).toBe(false);
  });
});
