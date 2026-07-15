import type { Meta, StoryObj } from "@storybook/react";
import { useAnimate } from "framer-motion";
import { DetailHeader } from "./DetailHeader";
import { sampleTodos } from "@/stories/fixtures/todos";

function DetailHeaderStory({
  todoIndex = 0,
}: {
  todoIndex?: number;
}) {
  const [todoTitle] = useAnimate<HTMLHeadingElement>();
  const [previousButtonScope] = useAnimate<HTMLDivElement>();
  const [nextButtonScope] = useAnimate<HTMLDivElement>();

  return (
    <DetailHeader
      todoTitle={todoTitle}
      previousButtonScope={previousButtonScope}
      nextButtonScope={nextButtonScope}
      currentTodo={sampleTodos[todoIndex]}
      todoIndex={todoIndex}
      todos={sampleTodos}
      handleTodoNavigation={() => undefined}
    />
  );
}

const meta = {
  title: "Organism/DetailHeader",
  component: DetailHeaderStory,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof DetailHeaderStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstTodo: Story = {
  args: {
    todoIndex: 0,
  },
};

export const MiddleTodo: Story = {
  args: {
    todoIndex: 1,
  },
};

export const LastTodo: Story = {
  args: {
    todoIndex: 2,
  },
};
