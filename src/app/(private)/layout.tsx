"use client"
import { AddTodoModal } from "@/components/organism/add-todo-modal/AddTodoModal";
import { TodoSyncStatusBanner } from "@/components/feats/todo-sync-status-banner/TodoSyncStatusBanner";
import { LayoutHeader } from "@/components/organism/layout-header/LayoutHeader";
import { setToggleAddTodoModal } from "@/lib/features/todos/todoSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { storeVerificationEmail } from "@/lib/features/auth/verificationFlow";
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
      if (auth.user?.status === "PENDING_VERIFICATION") {
        storeVerificationEmail(auth.user.email);
        router.replace("/check-email");
        return;
      }

      router.replace("/login");
    }
  }, [auth.isAuthenticated, auth.user, router])

  if (!auth.isAuthenticated || auth.user?.status !== "ACTIVE") return null

  return (
    <div className="bg-gradient-to-br from-secondary to-primary-dark h-[100%] w-full flex flex-col overflow-hidden">
        <LayoutHeader />
        <TodoSyncStatusBanner />
        {children}
        <AddTodoModal
          handleToggleModal={() => dispatch(setToggleAddTodoModal())}
          isOpen={toggleAddTodoModal}
        />
    </div>
  )
}
