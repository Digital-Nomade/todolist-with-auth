import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { TodosList } from "./TodosList";
import { sampleTodos } from "@/stories/fixtures/todos";
import type { Todo } from "@/types/Todo.type";

function TodosListStory() {
  const [selectedTodoId, setSelectedTodoId] = useState(sampleTodos[0].id);

  return (
    <div className="max-w-md">
      <TodosList
        todos={sampleTodos}
        selectedTodoId={selectedTodoId}
        handleSelectTodo={(todo: Todo) => setSelectedTodoId(todo.id)}
      />
    </div>
  );
}

const meta = {
  title: "Features/TodosList",
  component: TodosListStory,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof TodosListStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  render: () => (
    <div className="max-w-md text-white font-light">
      <TodosList
        todos={[]}
        selectedTodoId=""
        handleSelectTodo={() => undefined}
      />
      <p className="mt-4 text-sm text-danger-light">No todos to display.</p>
    </div>
  ),
};
