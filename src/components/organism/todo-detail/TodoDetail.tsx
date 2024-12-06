'use client'

import { Button } from "@/components/atomic/button/Button";
import {
  CheckIcon
} from "@/components/icons";
import { useUpdateTodosMutation } from "@/lib/features/todos/todoApi";
import { PaginatedTodo, Todo } from "@/types/Todo.type";
import { format } from "date-fns";
import { useAnimate } from "framer-motion";
import { useEffect, useState } from "react";
import { DetailHeader } from "./components/detail-header/DetailHeader";
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
  const [todoDescription, animateTodoDescription] = useAnimate()
  const [todoTitle, animateTodoTitle] = useAnimate()
  const [nextButtonScope, animateNextButton] = useAnimate()
  const [previousButtonScope, animatePreviousButton] = useAnimate()
  const [updateTodo, {}] = useUpdateTodosMutation()

  useEffect(() => {
    if (tIndex !== undefined) {
      setTodoIndex(tIndex)
    }
  }, [tIndex])

  useEffect(() => {
    if (selectedTodo) {
      setCurrentTodo(selectedTodo)
    }
  }, [selectedTodo])

  useEffect(() => {
    if (paginatedTodos && paginatedTodos.data) {
      setTodos(paginatedTodos?.data)
    }
  }, [paginatedTodos])

  useEffect(() => {
    if (todos?.length) {
      setCurrentTodo(todos[0])
    }
  }, [todos])

  function handleTodoNavigation(direction: TodoNavigationDirection) {
    switch(direction) {
      case 'next':
        handleNext()
        break
      case 'previous':``
        handlePrevious()
        break
      default:
        throw new Error('direction failed')
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
      onSelectTodo && onSelectTodo(todos[next])
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
      onSelectTodo && onSelectTodo(todos[previous])
    }
  }

  async function titleAnimation(): Promise<void> {
    await animateTodoTitle(
        todoTitle.current,
        { opacity: 0 },
        {
          duration: .001,
          ease: 'linear'
        }
      )
    await animateTodoTitle(
      todoTitle.current,
      { opacity: 1 },
      { duration: .3, ease: 'linear'}
    )
  }

  async function previousClickAnimation(): Promise<void> {
    await animateTodoDescription(
      todoDescription.current,
      { translateX: -1330 },
      {
        duration: .4,
        type: 'spring',
      }
    )
    await animateTodoDescription(
      todoDescription.current,
      { translateX: 0 },
      {
        duration: .2,
        type: 'spring'
      }
    )
  }

  async function nextClickAnimation(): Promise<void> {
    await animateTodoDescription(
      todoDescription.current,
      {
        translateX: 1330
      },
      {
        duration: .4,
        type: 'spring',
      }
    )
    await animateTodoDescription(
        todoDescription.current,
        {
          translateX: 0
        },
        {
          duration: .2,
          type: 'spring'
        }
      )
  }

  async function previousButtonAnimation(): Promise<void> {
    await animatePreviousButton(
      previousButtonScope.current,
      { opacity: 0, scale: 1 }, { duration: .2, type: 'spring', ease: 'easeInOut' }
    )
    await animatePreviousButton(
      previousButtonScope.current,
      { opacity: .2, scale: 1.3 }, { duration: .3, type: 'spring', ease: 'easeInOut', bounce: 2 }
    )
    await animatePreviousButton(
      previousButtonScope.current,
      { opacity: .2, scale: .9 }, { duration: .2, type: 'spring', ease: 'easeInOut', bounce: 2 }
    )
    await animatePreviousButton(
      previousButtonScope.current,
      { opacity: .2, scale: 1.3 }, { duration: .3, type: 'spring', ease: 'easeInOut', bounce: 2 }
    )
    await animatePreviousButton(
      previousButtonScope.current,
      { opacity: 0, scale: 1 }, { duration: .2, type: 'spring', ease: 'easeInOut', bounce: 2 }
    )
  }

  async function nextButtonAnimation(): Promise<void> {
    try {
      await animateNextButton(
        nextButtonScope.current,
        { opacity: 0, scale: 1 }, { duration: .2, type: 'spring', ease: 'easeInOut' }
      )
      await animateNextButton(
        nextButtonScope.current,
        { opacity: .2, scale: 1.3 }, { duration: .3, type: 'spring', ease: 'easeInOut', bounce: 2 }
      )
      await animateNextButton(
        nextButtonScope.current,
        { opacity: .2, scale: .9 }, { duration: .2, type: 'spring', ease: 'easeInOut', bounce: 2 }
      )
      await animateNextButton(
        nextButtonScope.current,
        { opacity: .2, scale: 1.3 }, { duration: .3, type: 'spring', ease: 'easeInOut', bounce: 2 }
      )
      await animateNextButton(
        nextButtonScope.current,
        { opacity: 0, scale: 1 }, { duration: .2, type: 'spring', ease: 'easeInOut', bounce: 2 }
      )
    } catch(error) {
      console.error(error)
    }
  }

  async function checkTodoAnimation(): Promise<void> {
    await animateTodoDescription(
      todoDescription.current,
      {
        translateY: 200,
        opacity: 0,
      },
      {
        duration: .4,
        type: 'spring',
        bounce: .5,
      }
    )
    await await animateTodoDescription(
      todoDescription.current,
      {
        translateY: 0,
        opacity: 1,
      },
      {
        duration: .3,
        type: 'spring',
        bounce: .5,
      }
    )
  }

  async function handleCheckTodo() {
    checkTodoAnimation()
    titleAnimation()

    try {
      await updateTodo({...currentTodo, done: !currentTodo?.done } as Todo)
    } catch (error) {
      console.error(error)
    }
  }

  if (!todos) {
    return (
      <section className="mx-auto max-w-[684px]">
        <p>You have no todos</p>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-[684px] w-full flex flex-col">
      <DetailHeader
       currentTodo={currentTodo}
       handleTodoNavigation={handleTodoNavigation}
       nextButtonScope={nextButtonScope}
       previousButtonScope={nextButtonScope}
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
                  created at: {format(currentTodo?.createdAt, 'd LLL yyyy')}
                </p>
              )
          }
        </div>
      </div>
      <div className="flex justify-end">
        <Button
          rounded={false}
          variant="outlined"
          buttonType="success"
          className="max-w-[200px] ml-auto"
          type="submit"
          onClick={handleCheckTodo}
        >
          {selectedTodo?.done && <CheckIcon className=" absolute left-6" />}
          check
        </Button>
      </div>
    </section>
  )
}
