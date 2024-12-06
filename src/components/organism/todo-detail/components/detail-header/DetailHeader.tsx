import { ArrowLeftIcon, ArrowRightIcon } from "@/components/icons";
import { Todo } from "@/types/Todo.type";
import { AnimationScope } from "framer-motion";
import { TodoNavigationDirection } from "../../types/TodoDetail.types";
import { SectionReminderOn } from "../section-reminder-on/SectionReminderOn";

interface Props {
  todoTitle: AnimationScope<any>
  previousButtonScope: AnimationScope<any>
  nextButtonScope: AnimationScope<any>
  currentTodo?: Todo
  todoIndex: number
  todos: Todo[]
  handleTodoNavigation: (direction: TodoNavigationDirection) => void
}

export function DetailHeader({
  todoTitle,
  previousButtonScope,
  nextButtonScope,
  currentTodo,
  todoIndex,
  todos,
  handleTodoNavigation,
}: Props) {

  if (!currentTodo) {
    return null
  }
  
  return (
    <header className="flex justify-between mb-8">
      <div>
        <h1
          ref={todoTitle}
          className="text-4xl font-extralight text-white"
        >
          {currentTodo?.title ?? 'no title'}
        </h1>
        <SectionReminderOn reminderOn={currentTodo?.reminderOn} />
      </div>
      <div>
        <div className="flex justify-between w-full mb-4 min-w-[100px]">
          <button
            className="relative flex justify-center items-center"
            type="button"
            onClick={() => handleTodoNavigation('previous')}
            disabled={todoIndex <= 0}
          >
            <div
              ref={previousButtonScope}
              className="absolute h-[48px] w-[48px] bg-danger-light rounded-full"
              style={{ opacity: 0 }}
            />
            <ArrowLeftIcon />
          </button>
          <button
            className="relative flex justify-center items-center"
            type="button"
            onClick={() => handleTodoNavigation('next')}
            disabled={todoIndex >= (todos.length - 1)}
          >
            <div
              ref={nextButtonScope}
              className="absolute h-[48px] w-[48px] bg-danger-light rounded-full"
              style={{ opacity: 0 }}
            />
            <ArrowRightIcon />
          </button>
        </div>
        { currentTodo?.dueTo &&
          <p className="text-white font-extralight">
            Due to: <strong>{new Date(currentTodo.dueTo).toString()}</strong>
          </p>
        }
      </div>
    </header>
  )
}