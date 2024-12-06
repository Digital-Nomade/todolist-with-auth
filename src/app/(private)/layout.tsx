'use client'
import { AddTodoModal } from "@/components/organism/add-todo-modal/AddTodoModal";
import { LayoutHeader } from "@/components/organism/layout-header/LayoutHeader";
import { setToggleAddTodoModal } from "@/lib/features/todos/todoSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useRouter } from "next/navigation";


export default function RootLayout({children}: Readonly<{
  children: React.ReactNode;
}>) {
  const dispatch = useAppDispatch()
  const { 
    auth: { isUserAuthenticated }, 
    todo: { toggleAddTodoModal },
  } = useAppSelector(state => state)
  const router = useRouter()

  if (!isUserAuthenticated) {
    return router.push('/login')
  }

  return (
    <html lang="en" className="h-[100vh]">
      <body className="bg-gradient-to-br from-secondary to-primary-dark h-[100%] w-full flex flex-col overflow-hidden">
        <LayoutHeader />
        {children}
        <AddTodoModal
          handleToggleModal={() => dispatch(setToggleAddTodoModal())}
          isOpen={toggleAddTodoModal}
        />
      </body>
    </html>
  )
}
