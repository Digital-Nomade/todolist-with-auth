"use client"

import { Button } from "@/components/atomic/button/Button";
import {
  CheckIcon
} from "@/components/icons";
import { useOfflineTodoMutations } from "@/lib/features/todos/offline/hooks";
import { isTodoUnavailableError } from "@/lib/features/todos/todoApi";
import { PaginatedTodo, Todo } from "@/types/Todo.type";
import { format } from "date-fns";
import { useAnimate } from "framer-motion";
import { useEffect, useState } from "react";
import { DetailHeader } from "./components/detail-header/DetailHeader";
import { TodoEmptyState } from "./components/todo-empty-state/TodoEmptyState";
import { TodoNavigationDirection } from "./types/TodoDetail.types";

interface Props {
  paginatedTodos?: PaginatedTodo
  selectedTodo?: Todo
  onSelectTodo?: (todo: Todo) => void
  tIndex: number
}

export function TodoDetail({ paginatedTodos, selectedTodo, onSelectTodo, tIndex }: Props) {
  const [todoIndex, setTodoIndex] = useState(tIndex)
  const [todos, setTodos] = useState<Todo[]>()
  const [currentTodo, setCurrentTodo] = useState<Todo>()
  const [isUnavailable, setIsUnavailable] = useState(false)
  const [todoDescription, animateTodoDescription] = useAnimate<HTMLDivElement>()
  const [todoTitle, animateTodoTitle] = useAnimate<HTMLHeadingElement>()
  const [nextButtonScope, animateNextButton] = useAnimate<HTMLDivElement>()
  const [previousButtonScope, animatePreviousButton] = useAnimate<HTMLDivElement>()
  const { deleteTodo, updateTodo } = useOfflineTodoMutations()

  useEffect(() => {
    if (tIndex !== undefined) {
      setTodoIndex(tIndex)
    }
  }, [tIndex])

  useEffect(() => {
    if (selectedTodo) {
      setCurrentTodo(selectedTodo)
      setIsUnavailable(false)
    }
  }, [selectedTodo])

  useEffect(() => {
    if (paginatedTodos?.data) {
      setTodos(paginatedTodos.data);
    }
  }, [paginatedTodos]);

  useEffect(() => {
    if (!todos?.length) {
      setCurrentTodo(undefined);
      setTodoIndex(0);
      return;
    }

    setCurrentTodo(current =>
      current && todos.some(todo => todo.id === current.id)
        ? current
        : todos[0],
    );
  }, [todos]);

  function handleTodoNavigation(direction: TodoNavigationDirection) {
    switch(direction) {
      case "next":
        handleNext()
        break
      case "previous":
        handlePrevious()
        break
      default:
        throw new Error("direction failed")
    }
  }

  async function handleNext() {
    if (todos && todoIndex < (todos?.length - 1)) {
      const next = todoIndex + 1
      
      titleAnimation()
      nextButtonAnimation()
      nextClickAnimation()
      setTodoIndex(next)
      setCurrentTodo(todos[next])
      onSelectTodo?.(todos[next])
    }
  }

  async function handlePrevious() {
    if (todos && todoIndex > 0) {
      const previous = todoIndex - 1;

      titleAnimation()
      previousButtonAnimation()
      previousClickAnimation()
      setTodoIndex(previous)
      setCurrentTodo(todos[previous])
      onSelectTodo?.(todos[previous])
    }
  }

  async function titleAnimation(): Promise<void> {
    await animateTodoTitle(
        todoTitle.current,
        { opacity: 0 },
        {
          duration: .001,
          ease: "linear"
        }
      )
    await animateTodoTitle(
      todoTitle.current,
      { opacity: 1 },
      { duration: .3, ease: "linear"}
    )
  }

  async function previousClickAnimation(): Promise<void> {
    await animateTodoDescription(
      todoDescription.current,
      { x: -1330 },
      {
        duration: .4,
        type: "spring",
      }
    )
    await animateTodoDescription(
      todoDescription.current,
      { x: 0 },
      {
        duration: .2,
        type: "spring"
      }
    )
  }

  async function nextClickAnimation(): Promise<void> {
    await animateTodoDescription(
      todoDescription.current,
      {
        x: 1330
      },
      {
        duration: .4,
        type: "spring",
      }
    )
    await animateTodoDescription(
        todoDescription.current,
        {
          x: 0
        },
        {
          duration: .2,
          type: "spring"
        }
      )
  }

  async function previousButtonAnimation(): Promise<void> {
    await animatePreviousButton(
      previousButtonScope.current,
      { opacity: 0, scale: 1 }, { duration: .2, type: "spring", ease: "easeInOut" }
    )
    await animatePreviousButton(
      previousButtonScope.current,
      { opacity: .2, scale: 1.3 }, { duration: .3, type: "spring", ease: "easeInOut", bounce: 2 }
    )
    await animatePreviousButton(
      previousButtonScope.current,
      { opacity: .2, scale: .9 }, { duration: .2, type: "spring", ease: "easeInOut", bounce: 2 }
    )
    await animatePreviousButton(
      previousButtonScope.current,
      { opacity: .2, scale: 1.3 }, { duration: .3, type: "spring", ease: "easeInOut", bounce: 2 }
    )
    await animatePreviousButton(
      previousButtonScope.current,
      { opacity: 0, scale: 1 }, { duration: .2, type: "spring", ease: "easeInOut", bounce: 2 }
    )
  }

  async function nextButtonAnimation(): Promise<void> {
    try {
      await animateNextButton(
        nextButtonScope.current,
        { opacity: 0, scale: 1 }, { duration: .2, type: "spring", ease: "easeInOut" }
      )
      await animateNextButton(
        nextButtonScope.current,
        { opacity: .2, scale: 1.3 }, { duration: .3, type: "spring", ease: "easeInOut", bounce: 2 }
      )
      await animateNextButton(
        nextButtonScope.current,
        { opacity: .2, scale: .9 }, { duration: .2, type: "spring", ease: "easeInOut", bounce: 2 }
      )
      await animateNextButton(
        nextButtonScope.current,
        { opacity: .2, scale: 1.3 }, { duration: .3, type: "spring", ease: "easeInOut", bounce: 2 }
      )
      await animateNextButton(
        nextButtonScope.current,
        { opacity: 0, scale: 1 }, { duration: .2, type: "spring", ease: "easeInOut", bounce: 2 }
      )
    } catch {
      // Animation failures do not expose request or session details.
    }
  }

  async function checkTodoAnimation(): Promise<void> {
    await animateTodoDescription(
      todoDescription.current,
      {
        y: 200,
        opacity: 0,
      },
      {
        duration: .4,
        type: "spring",
        bounce: .5,
      }
    )
    await await animateTodoDescription(
      todoDescription.current,
      {
        y: 0,
        opacity: 1,
      },
      {
        duration: .3,
        type: "spring",
        bounce: .5,
      }
    )
  }

  async function handleCheckTodo() {
    if (!currentTodo || !updateTodo) {
      return
    }

    checkTodoAnimation()
    titleAnimation()

    try {
      const done = !currentTodo.done
      await updateTodo(currentTodo.id, { done })
      setCurrentTodo({ ...currentTodo, done })
    } catch (error) {
      if (isTodoUnavailableError(error)) {
        setCurrentTodo(undefined)
        setIsUnavailable(true)
        return
      }
      // Keep the current todo visible for retryable failures.
    }
  }

  async function handleDeleteTodo() {
    if (!currentTodo || !deleteTodo) return
    await deleteTodo(currentTodo.id)
    setCurrentTodo(undefined)
  }

  if (isUnavailable) {
    return (
      <section className="mx-auto max-w-[684px]">
        <p>This todo is unavailable.</p>
      </section>
    )
  }

  if (!todos?.length) {
    return <TodoEmptyState />;
  }

  if (!currentTodo) {
    return <TodoEmptyState />;
  }

  return (
    <section className="mx-auto max-w-[684px] w-full flex flex-col">
      <DetailHeader
       currentTodo={currentTodo}
       handleTodoNavigation={handleTodoNavigation}
       nextButtonScope={nextButtonScope}
       previousButtonScope={previousButtonScope}
       todoIndex={todoIndex}
       todoTitle={todoTitle}
       todos={todos}
      />
      <div
        ref={todoDescription}
        className="flex flex-col w-full flex-1"
      >
        <div className=" mb-16">
          <p className="font-extralight text-2xl text-white mb-8">
            {currentTodo?.description ? currentTodo?.description : <span className="text-sm">No description provided</span>}
          </p>
        </div>
        <div className="mb-10 mt-auto">
          {
            currentTodo?.createdAt 
              && (
                <p className="text-lg font-extralight text-white ">
                  created at: {format(currentTodo?.createdAt, "d LLL yyyy")}
                </p>
              )
          }
        </div>
      </div>
      <div className="flex justify-end gap-4">
        <Button
          rounded={false}
          variant="outlined"
          buttonType="danger"
          className="max-w-[200px]"
          type="button"
          onClick={handleDeleteTodo}
        >
          delete
        </Button>
        <Button
          rounded={false}
          variant="outlined"
          buttonType="success"
          className="max-w-[200px] ml-auto"
          type="submit"
          onClick={handleCheckTodo}
        >
          {currentTodo?.done && <CheckIcon className=" absolute left-6" />}
          check
        </Button>
      </div>
    </section>
  )
}
