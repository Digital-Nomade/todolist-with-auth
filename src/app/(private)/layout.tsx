"use client"
import { AddTodoModal } from "@/components/organism/add-todo-modal/AddTodoModal";
import { LayoutHeader } from "@/components/organism/layout-header/LayoutHeader";
import { setToggleAddTodoModal } from "@/lib/features/todos/todoSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


export default function RootLayout({children}: Readonly<{
  children: React.ReactNode;
}>) {
  const dispatch = useAppDispatch()
  const {
    auth,
    todo: { toggleAddTodoModal },
  } = useAppSelector(state => state)
  const router = useRouter()

  useEffect(() => {
    if (!auth.isAuthenticated) {
      router.replace(
        auth.user?.status === "PENDING_VERIFICATION"
          ? `/check-email?email=${encodeURIComponent(auth.user.email)}`
          : "/login",
      )
    }
  }, [auth.isAuthenticated, auth.user, router])

  if (!auth.isAuthenticated || auth.user?.status !== "ACTIVE") return null

  return (
    <div className="bg-gradient-to-br from-secondary to-primary-dark h-[100%] w-full flex flex-col overflow-hidden">
        <LayoutHeader />
        {children}
        <AddTodoModal
          handleToggleModal={() => dispatch(setToggleAddTodoModal())}
          isOpen={toggleAddTodoModal}
        />
    </div>
  )
}
