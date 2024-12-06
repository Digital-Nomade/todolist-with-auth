import { TextIcon } from "@/components/icons";
import { CalendarIcon } from "@/components/icons/CalendarIcon";
import { Todo } from "@/types/Todo.type";

interface Props {
  todos: Todo[]
  handleSelectTodo: (todo: Todo) => void
  selectedTodoId: string
}

export function TodosList({ todos, handleSelectTodo, selectedTodoId }: Props) {
  return (
    todos.map(t => (
      <button
        key={t.id}
        className={`flex justify-between ${selectedTodoId === t.id ? 'border-2 border-danger-light shadow-lg shadow-danger-light' :  'border-none'} px-4 py-2 bg-primary-dark-transparency rounded-3xl items-center mb-3 `}
        onClick={() => handleSelectTodo(t)}
      >
        <div className="flex gap-6">
          <input type="checkbox" />
          <p
            title={t.title}
            className=" text-white font-light text-left"
          >
            {t.title.length > 14 ? t.title.substring(0, 14)+'...' : t.title}
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <span className={!!t.description ? ' opacity-100' : ' opacity-25'}>
            <TextIcon />
          </span>
          <span className={(!!t.dueTo || !!t.reminderOn) ? ' opacity-100' : ' opacity-25'}>
            <CalendarIcon />
          </span>
        </div>
      </button>
    ))
  )
}