import { Button } from "@/components/atomic/button/Button";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/icons";
import { Todo } from "@/types/Todo";
import { useEffect, useState } from "react";

interface Props {
  todos?: Todo[]
}

export function TodoDetail({ todos }: Props) {
  const [todoIndex, setTodoIndex] = useState(0)
  const [currentTodo, setCurrentTodo] = useState<Todo>()

  useEffect(() => {
    if (todos?.length) {
      setCurrentTodo(todos[0])
    }
  }, [todos])

  // if (!todos) {
  //   return (
  //     <section className="mx-auto max-w-[684px]">
  //       <div className="">
  //         <Skeleton
  //           height={50}
  //           enableAnimation
  //           baseColor="#ccc"
  //           highlightColor="#fff"
  //           borderRadius={2}
  //         />
  //         <Skeleton
  //           height={50}
  //           enableAnimation
  //           baseColor="#ccc"
  //           highlightColor="#fff"
  //           borderRadius={2}
  //         />
  //       </div>
  //       <Skeleton
  //         count={5}
  //         enableAnimation
  //         baseColor="#ccc"
  //         highlightColor="#fff"
  //         borderRadius={2}
  //       />
  //     </section>
  //   )
  // }

  return (
    <section className="mx-auto max-w-[684px]">
      <header className="flex justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extralight text-white">Buy new fruits</h1>
          <p className="text-white font-extralight">Reminder on: <strong>10:00AM - 03/10/2024</strong></p>
        </div>
        <div>
          <div className="flex justify-between w-full mb-4">
            <button>
              <ArrowLeftIcon />
            </button>
            <button>
              <ArrowRightIcon />
            </button>
          </div>
          <div className="text-white font-extralight">
            Due to: <strong>03/10/2024</strong>
          </div>
        </div>
      </header>
      <div className=" mb-16">
        <p className="font-extralight text-2xl text-white mb-8">I need to buy some fruits for my next trip to the beach, the list is:</p>
        <ul className="font-extralight text-2xl text-white list-disc ml-8 mb-8">
          <li>5 lemons</li>
          <li>4 mangoes</li>
          <li>10 watermelons</li>
          <li>2kg of fish</li>
          <li>5kg of rice</li>
        </ul>
        <p className="font-extralight text-2xl text-white">With that we can make some dinner.</p>
      </div>
      <div className="mb-10">
        <p className="text-lg font-extralight text-white ">created at: 03/10/2024</p>
      </div>
      <div className="flex justify-end">
        <Button
          rounded={false}
          variant="outlined"
          buttonType="success"
          className="max-w-[200px] ml-auto"
        >
          check
        </Button>
      </div>
    </section>
  )
}
